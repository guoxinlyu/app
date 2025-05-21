import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Image,
  View,
} from "react-native";
import {
  Card,
  Title,
  Text,
  Button,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getUserInfo, getMyDiscoveries, logout } from "../api/api";
import LottieView from "lottie-react-native";

/**
 * HomeScreen - Main screen of the app after login.
 * Displays user profile, discovery history, and navigation buttons.
 */
export default function HomeScreen() {
  const router = useRouter();              // Navigation
  const theme = useTheme();                // Paper theme colors
  const [userInfo, setUserInfo] = useState(null);     // Current user info
  const [discoveries, setDiscoveries] = useState([]); // List of user discoveries
  const [loading, setLoading] = useState(true);       // Loading state flag

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  /**
   * Fetch user profile and discoveries when screen is focused.
   * If authentication fails, redirect to login.
   */
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getUserInfo()
        .then((data) => {
          setUserInfo(data);
          return getMyDiscoveries();
        })
        .then((data) => setDiscoveries(data))
        .catch(() => {
          router.replace("/login");
        })
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>🌿 Welcome to EcoCache</Title>

      {/* Loading animation */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../assets/animations/index_loading.json")}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : userInfo ? (
        <>
          {/* User profile card */}
          <Card style={styles.userCard} elevation={4}>
            <Card.Content style={{ alignItems: "center" }}>
              <Image
                source={{ uri: userInfo.profile_picture || defaultAvatar }}
                style={styles.avatar}
              />
              <Title style={styles.username}>Hi, {userInfo.username}</Title>
            </Card.Content>
          </Card>

          {/* Navigation buttons */}
          <View style={styles.buttonGroup}>
            <Button
              icon="account-edit"
              mode="outlined"
              onPress={() => router.push("/settings")}
              style={styles.outlinedButton}
              textColor="#2e7d32"
            >
              Edit Profile
            </Button>

            <Button
              icon="map"
              mode="contained"
              onPress={() => router.push("/map")}
              style={styles.containedButton}
              buttonColor="#4CAF50"
            >
              Go to Map
            </Button>

            <Button
              icon="logout"
              mode="outlined"
              onPress={() => {
                logout(); // Clear local session
                router.replace("/login");
              }}
              textColor="#d32f2f"
              style={styles.outlinedDangerButton}
            >
              Log Out
            </Button>
          </View>

          {/* Discoveries Section */}
          <Title style={styles.subtitle}>📍 Your Discoveries</Title>
          <Text style={styles.tapHint}>📌 Tap a card to view its details.</Text>

          {discoveries.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <LottieView
                source={require("../assets/animations/discoveries_empty.json")}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
              <Text style={styles.emptyText}>
                🍃 No discoveries yet. Go explore your world!
              </Text>
            </View>
          ) : (
            discoveries.map((item, index) => (
              <Card
                key={index}
                style={styles.discoveryCard}
                onPress={() => router.push(`/beacon/${item.beacon_id}`)}
              >
                <Card.Content>
                  <Text style={styles.discoveryName}>{item.discovery_name}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Location:</Text>
                    <Text style={styles.detailValue}>{item.discovery_location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📝 Description:</Text>
                    <Text style={styles.detailValue}>{item.discovery_description}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🎯 Points:</Text>
                    <Text style={[styles.detailValue, { color: "#388e3c", fontWeight: "bold" }]}>
                      +{item.points_awarded} pts
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🕒 Discovered:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(item.discovered_at).toLocaleString()}
                    </Text>
                  </View>

                  {/* Redundant but decorative timestamp */}
                  <Text style={styles.discoveryDetail}>
                    🕒 {new Date(item.discovered_at).toLocaleString()}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </>
      ) : (
        <Text>Loading user info...</Text>
      )}
    </ScrollView>
  );
}

/**
 * Style definitions for the HomeScreen UI.
 */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f1f8e9",
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    marginTop: 20,
    marginBottom: 16,
    color: "#1b5e20",
    fontWeight: "bold",
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#388e3c",
    fontStyle: "italic",
  },
  userCard: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e7d32",
  },
  buttonGroup: {
    width: "100%",
    marginBottom: 24,
  },
  outlinedButton: {
    marginVertical: 6,
    borderColor: "#81c784",
    borderWidth: 1.5,
    borderRadius: 10,
  },
  containedButton: {
    marginVertical: 6,
    borderRadius: 10,
  },
  outlinedDangerButton: {
    marginVertical: 6,
    borderColor: "#d32f2f",
    borderWidth: 1.5,
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    color: "#1b5e20",
    marginBottom: 4,
    alignSelf: "flex-start",
    fontWeight: "600",
  },
  tapHint: {
    fontSize: 13,
    color: "#4e6e4e",
    marginBottom: 10,
    alignSelf: "flex-start",
    fontStyle: "italic",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#777",
    marginTop: 12,
    textAlign: "center",
  },
  discoveryCard: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    elevation: 3,
  },
  discoveryName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#2e7d32",
  },
  discoveryDetail: {
    fontSize: 13,
    color: "#555",
  },
  discoveryDescription: {
    fontSize: 13,
    color: "#777",
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#4e6e4e",
    marginRight: 6,
  },
  detailValue: {
    flexShrink: 1,
    color: "#555",
  },
});





