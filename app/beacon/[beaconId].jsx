import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { getBeacon } from "../../api/api";

/**
 * BeaconDetailScreen - Displays detailed information about a discovered beacon.
 * Fetches beacon data by ID and shows image, location, creator, and description.
 */
export default function BeaconDetailScreen() {
  /** Extract beaconId from route params */
  const { beaconId } = useLocalSearchParams();
  const router = useRouter();

  /** State: beacon details */
  const [beacon, setBeacon] = useState(null);

  /** State: loading indicator */
  const [loading, setLoading] = useState(true);

  /**
   * Fetch beacon data from the API using the ID.
   * If failed, log the error.
   */
  useEffect(() => {
    getBeacon(beaconId)
      .then(setBeacon)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [beaconId]);

  /**
   * Display loading spinner while fetching data.
   */
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ marginTop: 100 }}
        color="#4CAF50"
      />
    );
  }

  /**
   * Display fallback UI when no beacon is found.
   */
  if (!beacon) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Beacon not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>🔙 Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Render beacon information when available.
   */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{beacon.name}</Text>

        <Text style={styles.scoreText}>🎯 You earned 10 points!</Text>

        {beacon.image_url && (
          <Image source={{ uri: beacon.image_url }} style={styles.image} />
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>📍 Location:</Text>
          <Text style={styles.value}>{beacon.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🧑‍💻 Created by:</Text>
          <Text style={styles.value}>{beacon.created_by}</Text>
        </View>

        <Text style={styles.description}>📝 {beacon.description}</Text>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}> Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/**
 * Styles for the BeaconDetailScreen UI.
 */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#e0f2f1", // light green background
    alignItems: "center",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1b5e20", // dark green
    marginBottom: 8,
    textAlign: "center",
  },
  scoreText: {
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    color: "#2e7d32",
    marginRight: 6,
  },
  value: {
    color: "#4e4e4e",
    flexShrink: 1,
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    color: "#333",
    marginBottom: 30,
    lineHeight: 22,
    backgroundColor: "#f1f8e9",
    padding: 12,
    borderRadius: 8,
  },
  backBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#a5d6a7", // soft green
  },
  backText: {
    color: "#1b5e20",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    marginBottom: 20,
  },
});

