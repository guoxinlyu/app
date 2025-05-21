/**
 * LoginScreen - Login page for EcoCache app.
 * 
 * Features:
 * - Username and password input
 * - Animated loading state
 * - Snackbar for feedback
 * - Navigation to SignUp page
 * - Quick guide section
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { signInUser } from "../api/auth";
import { getUserInfo } from "../api/api";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

/**
 * LoginScreen - Handles user login and authentication
 */
export default function LoginScreen() {
  /** User input: username and password */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /** Loading state while logging in */
  const [loading, setLoading] = useState(false);

  /** Snackbar for error/success messages */
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  /** Navigation router */
  const router = useRouter();
  const theme = useTheme();

  /**
   * handleLogin - Triggered when login button is pressed
   * Calls login API, fetches user info, and redirects on success
   */
  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbar({ visible: true, message: "Please fill in both fields." });
      return;
    }

    setLoading(true);

    try {
      await signInUser({ username, password });
      const userInfo = await getUserInfo();
      if (userInfo) {
        setSnackbar({ visible: true, message: `Welcome back, ${userInfo.username}!` });
        setTimeout(() => router.replace("/"), 1000);
      } else {
        throw new Error("Failed to retrieve user info");
      }
    } catch (err) {
      setSnackbar({ visible: true, message: err.message || "Login failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%" }}
      >
        {/* Main login card */}
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Title style={styles.title}>🔐 Log In to EcoCache</Title>

            <TextInput
              label="Username"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />

            {/* Loading animation or login button */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={require("../assets/animations/plant.json")}
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
                <Text style={styles.loadingText}>🌱 Growing your green world...</Text>
              </View>
            ) : (
              <Button
                icon="leaf"
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                labelStyle={{ fontSize: 16 }}
              >
                Log In
              </Button>
            )}

            {/* Sign up navigation */}
            <Button
              mode="text"
              onPress={() => router.push("/signup")}
              style={styles.signupLink}
              labelStyle={{ color: "#2e7d32", fontWeight: "600" }}
            >
              Don't have an account? Create one
            </Button>
          </Card.Content>
        </Card>

        {/* Instructional guide card */}
        <Card style={styles.guideCard}>
          <Card.Content>
            <Title style={styles.guideTitle}>🌍 How to Use EcoCache</Title>
            <Paragraph style={styles.guideText}>• Create an account or log in.</Paragraph>
            <Paragraph style={styles.guideText}>• Explore the map and look for beacons.</Paragraph>
            <Paragraph style={styles.guideText}>• Scan beacons in real-world locations.</Paragraph>
            <Paragraph style={styles.guideText}>• Earn points and rank on the leaderboard!</Paragraph>
          </Card.Content>
        </Card>
      </KeyboardAvoidingView>

      {/* Snackbar feedback */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: "" })}
        duration={2000}
        action={{ label: "OK", onPress: () => {} }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}

/**
 * Styles for the login screen layout and UI components
 */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f1f8e9",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
    color: "#1b5e20",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f9fbe7",
    borderRadius: 8,
  },
  loginButton: {
    marginTop: 12,
    backgroundColor: "#66bb6a",
    borderRadius: 10,
  },
  signupLink: {
    marginTop: 16,
    alignSelf: "center",
  },
  loadingContainer: {
    marginVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "600",
    fontStyle: "italic",
  },
  guideCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#aed581",
    paddingBottom: 8,
  },
  guideTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#2e7d32",
    fontWeight: "600",
  },
  guideText: {
    fontSize: 14,
    color: "#4e6e4e",
    marginBottom: 4,
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
});

