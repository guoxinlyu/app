// React and React Native imports
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Appearance,
  View,
  SafeAreaView,
  Text,
  Alert,
} from "react-native";

// MapView components for rendering map, circles, and markers
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Location and distance utilities
import * as Location from "expo-location";
import { getDistance } from "geolib";

// Expo Router for navigation
import { useRouter } from "expo-router";

// BLE scanning and permission request functions
import {
  startBLEScan,
  stopBLEScan,
  requestBLEPermissions,
} from "./bleService";

// API to fetch beacon locations from backend
import { getBeaconLocations } from "../api/api";

// Determine if the app is in dark mode
const colorScheme = Appearance.getColorScheme();

/**
 * A small UI component to display info about the nearby beacon
 */
function NearbyLocation(props) {
  if (typeof props.name !== "undefined") {
    return (
      <SafeAreaView style={styles.nearbyLocationSafeAreaView}>
        <View style={styles.nearbyLocationView}>
          <Text style={styles.nearbyLocationText}>🏷 {props.name}</Text>
          {props.distance?.nearby && (
            <Text style={{ ...styles.nearbyLocationText, fontWeight: "bold" }}>
              Within 100 Metres!
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

/**
 * Main component for rendering the interactive map and beacon scanning.
 * Tracks user location, scans for BLE beacons, and shows nearby discovery areas.
 */
export default function ShowMap() {
  const router = useRouter();
  const [mapState, setMapState] = useState({
    locations: [],// List of beacon locations from backend
    userLocation: {
      latitude: -27.5263381,  // Default location
      longitude: 153.0954163,
    },
    nearbyLocation: {},  // Closest beacon within range
  });
  const alertShownRef = useRef(false); // Avoid repeating alert

  useEffect(() => {
    let locationSubscription = null;

    /**
     * Calculates the distance between user and all beacons,
     * finds the nearest one and adds distance info.
     */
    const calculateDistance = (userLocation, locations) => {
      const nearestLocations = locations
        .map((location) => {
          const metres = getDistance(userLocation, location.coordinates);
          location["distance"] = {
            metres,
            nearby: metres <= 100,
          };
          return location;
        })
        .sort((a, b) => a.distance.metres - b.distance.metres);
      return nearestLocations.shift();// Return closest one
    };

    /**
     * Setup BLE, permissions, alert, beacon fetching, and location tracking
     */
    const setup = async () => {
      // Ask for location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      // Request Bluetooth permissions
      await requestBLEPermissions();

      // Onboarding message
      Alert.alert(
        "EcoCache Adventure Begins!",
        "🧭 Your exploration has started!\n\n🔊 Please ensure Bluetooth and vibration are enabled.\n🟣 Look for the purple circles — that's where the treasure is!",
        [{ text: "Got it!" }]
      );

      // Fetch beacon locations from backend
      const remoteBeacons = await getBeaconLocations();
      const updatedLocations = remoteBeacons
        .map((b) => {
          const [lat, lng] = b.location.split(",").map((v) => v.trim());
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);
          if (isNaN(latitude) || isNaN(longitude)) {
            return null;// Skip invalid coordinates
          }
          return {
            ...b,
            coordinates: { latitude, longitude },
          };
        })
        .filter(Boolean);// Remove null values

      setMapState((prev) => ({
        ...prev,
        locations: updatedLocations,
      }));

       // Start BLE scanning
      startBLEScan((device) => {});

      // Track user movement
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,// Update every 10 meters
        },
        (location) => {
          const userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

           // Check for the nearest beacon
          const nearby = calculateDistance(userLocation, updatedLocations);
          const isNearby = nearby?.distance?.nearby;

          if (!isNearby) alertShownRef.current = false;

          // Update user location and nearby beacon state
          setMapState((prev) => ({
            ...prev,
            userLocation,
            nearbyLocation: nearby,
          }));
        }
      );
    };

    setup();// Run setup on mount

    // Cleanup on unmount
    return () => {
      if (locationSubscription) locationSubscription.remove();
      stopBLEScan();// Stop BLE when leaving screen
    };
  }, []);

  return (
    <>
      <MapView
        provider={PROVIDER_GOOGLE}
        region={{
          ...mapState.userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        style={styles.container}
      >
        {mapState.locations.map((loc) => (
          <React.Fragment key={loc.id}>
            <Circle
              center={loc.coordinates}
              radius={100}
              strokeWidth={3}
              strokeColor="#A42DE8"
              fillColor={
                colorScheme === "dark"
                  ? "rgba(128,0,128,0.5)"
                  : "rgba(210,169,210,0.5)"
              }
            />
            <Marker
              coordinate={loc.coordinates}
              title={loc.name}
              description={`Beacon ID: ${loc.beacon_id}`}
            />
          </React.Fragment>
        ))}
      </MapView>

      <NearbyLocation {...mapState.nearbyLocation} />

      {mapState.nearbyLocation?.distance?.nearby && (
        <View style={styles.scanPromptContainer}>
          <Text style={styles.scanPromptText}>🎯 You're near the treasure!</Text>
          <Text style={styles.scanPromptTextSmall}>
            Tap below to scan the QR code on the beacon.
          </Text>
          <Text style={{ height: 10 }} />
          <Text
            style={styles.scanButton}
            onPress={() => router.push("/QRcode scanner")}
          >
            📷 Scan QR Code
          </Text>
        </View>
      )}
    </>
  );
}

// Styling for MapView, beacon overlays, and scan prompt UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nearbyLocationSafeAreaView: {
    backgroundColor: "black",
  },
  nearbyLocationView: {
    padding: 20,
  },
  nearbyLocationText: {
    color: "white",
    lineHeight: 25,
  },
  scanPromptContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scanPromptText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  scanPromptTextSmall: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  scanButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: "hidden",
    textAlign: "center",
    fontSize: 16,
  },
});
