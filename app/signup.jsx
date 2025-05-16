import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { signUpUser, signInUser } from "../api/auth";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(""); // string: YYYY-MM-DD
  const [underageConfirmed, setUnderageConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  // 计算年龄
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

  const handleSignUp = async () => {
    const age = getAge(birthDate);

    if (!username || !email || !password || !birthDate) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert("Invalid Date Format", "Please enter birth date in YYYY-MM-DD format.");
      return;
    }

    if (age !== null && age < 18 && !underageConfirmed) {
      Alert.alert("Parental Consent Required", "Please confirm parental consent to proceed.");
      return;
    }

    setUploading(true);

    try {
      await signUpUser({ username, email, password, dob: birthDate });
      await signInUser({ username, password });

      Alert.alert("Registration Successful 🎉", "Welcome to EcoCache!");
      router.replace("/");
    } catch (err) {
      Alert.alert("Registration Failed", err.message || "An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const age = getAge(birthDate); // 缓存 age

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title}>📝 Create Your EcoCache Account</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
        keyboardType="numbers-and-punctuation"
      />

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
            Be aware of your surroundings and stay safe. Parental/guardian consent is required for users under 18.
          </Text>
        </View>
      )}

      {uploading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Sign Up" onPress={handleSignUp} color="#388e3c" />
      )}
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
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
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
});


