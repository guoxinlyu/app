import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity, // ✅ 添加
} from "react-native";

import { useRouter } from "expo-router";
import { logout } from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { getUserInfo, getMyDiscoveries } from "../api/api";

export default function HomeScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>🌿 Welcome to EcoCache</Text>

    {loading ? (
      <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
    ) : userInfo ? (
      <>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: userInfo.profile_picture || defaultAvatar }}
            style={styles.avatar}
          />
          <Text style={styles.username}>Hi, {userInfo.username}</Text>
        </View>

        {/* Button Group */}
        <View style={styles.buttonGroup}>
          <Button title="Edit Profile" onPress={() => router.push("/settings")} color="#388e3c" />
          <View style={styles.spacer} />
          <Button title="Go to Map" onPress={() => router.push("/map")} color="#4CAF50" />
          <View style={styles.spacer} />
          <Button title="Log Out" onPress={() => {
            logout();
            router.replace("/login");
          }} color="#d32f2f" />
        </View>

        {/* Discoveries */}
        <Text style={styles.subtitle}>📍 Your Discoveries</Text>
        {discoveries.length === 0 ? (
          <Text style={{ marginTop: 10, fontStyle: "italic" }}>
            No discoveries yet.
          </Text>
        ) : (
          discoveries.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(`/beacon/${item.beacon_id}`)}
            >
              <Text style={styles.discoveryName}>{item.discovery_name}</Text>
              <Text style={styles.discoveryDetail}>📍 {item.discovery_location}</Text>
              <Text style={styles.discoveryDescription}>📝 {item.discovery_description}</Text>
              <Text style={styles.discoveryDetail}>🎯 +{item.points_awarded} pts</Text>
              <Text style={styles.discoveryDetail}>
                🕒 {new Date(item.discovered_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </>
    ) : (
      <Text>Loading user info...</Text>
    )}
  </ScrollView>
);

}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    color: "#1b5e20",
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 20,
  },
  spacer: {
    height: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
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
    marginTop: 4,
    marginBottom: 4,
  },
});




