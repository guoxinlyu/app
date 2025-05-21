/**
 * ShowMap - Main map screen for the EcoCache app.
 * 
 * Features:
 * - Displays user location and beacon locations as markers/circles
 * - Uses BLE to detect signal strength of nearby beacons
 * - Shows animated signal bar and proximity message
 * - Prompts to scan QR code when near a beacon
 */

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Appearance,
  View,
  SafeAreaView,
  Text,
  Alert,
  Animated,
  Easing,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { useRouter } from "expo-router";
import {
  startBLEScan,
  stopBLEScan,
  requestBLEPermissions,
} from "./bleService";
import { getBeaconLocations } from "../api/api";

// Detect current theme for adjusting marker circle color
const colorScheme = Appearance.getColorScheme();

/**
 * Calculate signal strength percentage from RSSI value
 */
const getSignalStrengthPercent = (rssi) => {
  const maxRSSI = -50;
  const minRSSI = -100;
  if (rssi === null || rssi === undefined) return 0;
  let percent = ((rssi - minRSSI) / (maxRSSI - minRSSI)) * 100;
  return Math.round(Math.max(0, Math.min(100, percent)));
};

/**
 * Get signal label for a given percentage
 */
const getSignalLabel = (percent) => {
  if (percent > 80) return "Excellent";
  if (percent > 60) return "Good";
  if (percent > 40) return "Fair";
  if (percent > 20) return "Weak";
  return "Very Weak";
};

/**
 * Get color for signal bar based on strength
 */
const getBarColor = (percent) => {
  if (percent > 80) return "#4caf50";
  if (percent > 60) return "#fbc02d";
  if (percent > 40) return "#ff9800";
  return "#f44336";
};

/**
 * NearbyLocation - A stable, animated signal strength display component.
 */
function NearbyLocation({ name, rssi, animatedBarWidth, signalPercent }) {
  if (!name) return null;

  return (
    <SafeAreaView style={styles.nearbyLocationSafeAreaView}>
      <View style={styles.nearbyLocationView}>
        <Text style={styles.nearbyLocationText}>
          📶 {getSignalLabel(signalPercent)} Signal ({rssi} dBm)
        </Text>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedBarWidth,
                backgroundColor: getBarColor(signalPercent),
              },
            ]}
          />
        </View>
        <Text style={styles.nearbyLocationText}>
          Strength: {signalPercent}%
        </Text>
        <Text style={styles.nearbyLocationText}>🏷 {name}</Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * ShowMap - Main component showing map, BLE feedback, and discovery UI
 */
export default function ShowMap() {
  const router = useRouter();

  /** Map state including beacons and user position */
  const [mapState, setMapState] = useState({
    locations: [],
    userLocation: {
      latitude: -27.5263381,
      longitude: 153.0954163,
    },
    nearbyLocation: {},
  });

  /** Current BLE signal strength (RSSI) */
  const [rssi, setRssi] = useState(null);

  /** Prevents multiple alert prompts */
  const alertShownRef = useRef(false);

  /** Animation value for signal bar */
  const animatedWidth = useRef(new Animated.Value(0)).current;

  /**
   * Effect: fetch beacon data, request permissions, start BLE and location tracking
   */
  useEffect(() => {
    let locationSubscription = null;

    /**
     * Calculate the closest beacon based on user location
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
      return nearestLocations.shift();
    };

    const setup = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      await requestBLEPermissions();

      Alert.alert(
        "EcoCache Adventure Begins!",
        "🧭 Your exploration has started!\n\n🔊 Please ensure Bluetooth and vibration are enabled.\n🟣 Look for the purple circles — that's where the treasure is!",
        [{ text: "Got it!" }]
      );

      const remoteBeacons = await getBeaconLocations();
      const updatedLocations = remoteBeacons
        .map((b) => {
          const [lat, lng] = b.location.split(",").map((v) => v.trim());
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);
          if (isNaN(latitude) || isNaN(longitude)) return null;
          return {
            ...b,
            coordinates: { latitude, longitude },
          };
        })
        .filter(Boolean);

      setMapState((prev) => ({
        ...prev,
        locations: updatedLocations,
      }));

      startBLEScan((device) => {
        if (device?.rssi !== null) {
          setRssi(device.rssi);
        }
      });

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (location) => {
          const userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          const nearby = calculateDistance(userLocation, updatedLocations);
          const isNearby = nearby?.distance?.nearby;

          if (!isNearby) alertShownRef.current = false;

          setMapState((prev) => ({
            ...prev,
            userLocation,
            nearbyLocation: nearby,
          }));
        }
      );
    };

    setup();

    return () => {
      if (locationSubscription) locationSubscription.remove();
      stopBLEScan();
    };
  }, []);

  /** Animation trigger when RSSI changes */
  const signalPercent = getSignalStrengthPercent(rssi);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: signalPercent,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [signalPercent]);

  /** Interpolated width for animated progress bar */
  const barWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <>
      {/* 📍 Map view with user and beacon markers */}
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

      {/* 📶 Signal Strength Panel */}
      <NearbyLocation
        name={mapState.nearbyLocation?.name}
        rssi={rssi}
        signalPercent={signalPercent}
        animatedBarWidth={barWidth}
      />

      {/* 🎯 Prompt for scanning when near beacon */}
      {mapState.nearbyLocation?.distance?.nearby && (
        <View style={styles.scanPromptContainer}>
          <Text style={styles.scanPromptText}>🎯 You're near the treasure!</Text>
          <Text style={styles.scanPromptTextSmall}>
            Tap below to scan the QR code on the beacon.
          </Text>
          <Text style={{ height: 10 }} />
          <Text
            style={styles.scanButton}
            onPress={() => router.push("/QRcodeScanner")}
          >
            📷 Scan QR Code
          </Text>
        </View>
      )}
    </>
  );
}

/**
 * Style definitions for map, signal panel, and prompt UI
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nearbyLocationSafeAreaView: {
    backgroundColor: "#000",
  },
  nearbyLocationView: {
    padding: 20,
  },
  nearbyLocationText: {
    color: "white",
    lineHeight: 25,
    fontSize: 15,
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
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
