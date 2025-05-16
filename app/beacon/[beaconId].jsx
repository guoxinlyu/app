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

export default function BeaconDetailScreen() {
  const { beaconId } = useLocalSearchParams();
  const router = useRouter();
  const [beacon, setBeacon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBeacon(beaconId)
      .then(setBeacon)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [beaconId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} color="#4CAF50" />;
  }

  if (!beacon) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Beacon not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{beacon.name}</Text>

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
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#e0f2f1", // 淡绿色背景
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
    color: "#1b5e20", // 深绿色
    marginBottom: 16,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "cover",
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
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#a5d6a7", // 柔和绿
  },
  backText: {
    color: "#1b5e20",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    marginBottom: 20,
  },
});
