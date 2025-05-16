// React and React Native imports
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

// Import authentication and user-related API functions
import { signInUser } from "../api/auth";
import { getUserInfo } from "../api/api";

// Navigation hook from Expo Router
import { useRouter } from "expo-router";

/**
 * LoginScreen component - allows users to log in and navigate to other parts of the app.
 * Includes input validation, error handling, and a user guide section.
 */
export default function LoginScreen() {
  // State for form fields and loading state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();// Navigation object

   /**
   * Handles login logic:
   * - Validates input
   * - Calls backend API to authenticate
   * - On success, fetches user info and redirects to home
   * - On failure, shows an error alert
   */
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please fill in both username and password.");
      return;
    }

    setLoading(true);// Show spinner

    try {
      await signInUser({ username, password });
      const userInfo = await getUserInfo(); // Fetch user data

      if (userInfo) {
        Alert.alert("Login Successful", `Welcome back, ${userInfo.username}!`);
        router.replace("/"); // Redirect to home page
      } else {
        throw new Error("Failed to retrieve user info");
      }
    } catch (err) {
      Alert.alert("Login Failed", err.message || "Invalid username or password.");
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title}>🔐 Log In to EcoCache</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Log In" onPress={handleLogin} color="#388e3c" />
      )}

      <View style={{ marginTop: 16 }}>
        <Text style={{ marginBottom: 6 }}>Don't have an account?</Text>
        <Button
          title="Create Account"
          onPress={() => router.push("/signup")}
          color="#1976D2"
        />
      </View>
    </View>

    <View style={styles.guide}>
      <Text style={styles.guideTitle}>🌍 How to Use EcoCache</Text>
      <Text style={styles.guideText}>• Create an account or log in.</Text>
      <Text style={styles.guideText}>• Explore the map and look for beacons.</Text>
      <Text style={styles.guideText}>• Scan beacons in real-world locations.</Text>
      <Text style={styles.guideText}>• Earn points and rank on the leaderboard!</Text>
    </View>
  </ScrollView>
);

}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
    backgroundColor: "#e0f2f1",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fefefe",
  },
  guide: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c8e6c9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  guideTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2e7d32",
    fontSize: 16,
  },
  guideText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
});


