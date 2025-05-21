/**
 * SignUpScreen - A user registration screen for the EcoCache app.
 *
 * Features:
 * - Input fields for username, email, password, and date of birth.
 * - Underage user consent checkbox.
 * - Validation for missing fields and invalid date formats.
 * - Loading indicator during submission.
 * - Snackbar for user feedback.
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  ActivityIndicator,
  useTheme,
  Snackbar,
} from "react-native-paper";
import CheckBox from "@react-native-community/checkbox";
import { signUpUser, signInUser } from "../api/auth";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  /** Form input states */
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");

  /** Underage confirmation checkbox */
  const [underageConfirmed, setUnderageConfirmed] = useState(false);

  /** Submission/loading state */
  const [uploading, setUploading] = useState(false);

  /** Snackbar feedback state */
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  /** Navigation */
  const router = useRouter();
  const theme = useTheme();

  /**
   * getAge - Calculate age from date string
   * @param {string} dobStr - Date of birth (YYYY-MM-DD)
   * @returns {number|null}
   */
  const getAge = (dobStr) => {
    if (!dobStr) return null;
    const today = new Date();
    const dob = new Date(dobStr);
    if (isNaN(dob)) return null;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * handleSignUp - Handles user registration and auto login
   */
  const handleSignUp = async () => {
    const age = getAge(birthDate);

    if (!username || !email || !password || !birthDate) {
      setSnackbar({ visible: true, message: "Please fill in all required fields." });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      setSnackbar({ visible: true, message: "Please enter date in YYYY-MM-DD format." });
      return;
    }

    if (age !== null && age < 18 && !underageConfirmed) {
      setSnackbar({ visible: true, message: "Parental/guardian consent is required." });
      return;
    }

    setUploading(true);

    try {
      await signUpUser({ username, email, password, dob: birthDate });
      await signInUser({ username, password });

      setSnackbar({ visible: true, message: "Welcome to EcoCache!" });
      router.replace("/");
    } catch (err) {
      setSnackbar({ visible: true, message: err.message || "Registration failed." });
    } finally {
      setUploading(false);
    }
  };

  const age = getAge(birthDate);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <Title style={styles.title}>📝 Create Your EcoCache Account</Title>

          {/* User Input Fields */}
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
          />
          <TextInput
            label="Date of Birth (YYYY-MM-DD)"
            value={birthDate}
            onChangeText={setBirthDate}
            mode="outlined"
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
          />

          {/* Underage warning box */}
          {age !== null && age < 18 && (
            <View style={styles.warningBox}>
              <View style={styles.checkboxRow}>
                <CheckBox
                  value={underageConfirmed}
                  onValueChange={setUnderageConfirmed}
                />
                <Text style={styles.checkboxText}>I have parental/guardian consent</Text>
              </View>
              <Text style={styles.warningText}>
                ⚠️ This app requires outdoor use with mobile devices to detect Bluetooth beacons.
                Parental/guardian consent is required for users under 18.
              </Text>
            </View>
          )}

          {/* Loading or Submit */}
          {uploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>🌱 Creating your account...</Text>
            </View>
          ) : (
            <Button
              icon="account-plus"
              mode="contained"
              onPress={handleSignUp}
              style={styles.signupButton}
            >
              Sign Up
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Snackbar feedback */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: "" })}
        duration={2500}
        action={{ label: "OK", onPress: () => {} }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}

/**
 * Stylesheet for SignUpScreen layout and appearance
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
    backgroundColor: "#ffffff",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
    color: "#1b5e20",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f9fbe7",
  },
  signupButton: {
    marginTop: 12,
    backgroundColor: "#66bb6a",
    borderRadius: 10,
  },
  warningBox: {
    backgroundColor: "#fff3e0",
    borderColor: "#ffa726",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: "#d32f2f",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxText: {
    flexShrink: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#444",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "600",
    fontStyle: "italic",
  },
});




