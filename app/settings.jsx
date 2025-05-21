/**
 * UploadAvatar - Profile editing screen for the EcoCache app.
 * 
 * Features:
 * - Select and preview profile image
 * - Update username, email, and bio
 * - Upload all data via multipart/form-data to server
 * - Snackbar feedback and navigation after success
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Title,
  Button,
  ActivityIndicator,
  Snackbar,
  Avatar,
  TextInput,
  useTheme,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "../api/api";
import { useRouter, useNavigation } from "expo-router";

/**
 * UploadAvatar - A form UI allowing user to update their profile image and personal info.
 */
export default function UploadAvatar() {
  /** Selected image URI */
  const [image, setImage] = useState(null);

  /** Text input states */
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  /** Upload and permission states */
  const [uploading, setUploading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  /** Snackbar feedback */
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();

  /**
   * Request media library permission when component mounts.
   */
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const { status: askStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(askStatus === "granted");

        if (askStatus !== "granted") {
          setSnackbar({ visible: true, message: "Please enable photo access in settings." });
        }
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  /**
   * Launch image picker to select avatar photo.
   */
  const pickImage = async () => {
    if (!hasPermission) {
      setSnackbar({ visible: true, message: "Gallery access is required." });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      setSnackbar({ visible: true, message: "Error picking image." });
    }
  };

  /**
   * Handle form submission: assemble FormData and send to backend.
   */
  const handleUpload = async () => {
    if (!image && !username && !email && !bio) {
      setSnackbar({ visible: true, message: "Please fill at least one field." });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      if (username) formData.append("username", username);
      if (email) formData.append("email", email);
      if (bio) formData.append("bio", bio);
      if (image) {
        formData.append("profile_picture", {
          uri: image,
          name: "avatar.jpg",
          type: "image/jpeg",
        });
      }

      await updateProfile(formData);

      setSnackbar({ visible: true, message: "Profile updated successfully!" });

      // Navigate back or to home after success
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          router.replace("/");
        }
      }, 1200);
    } catch (err) {
      const msg = err.message || "Update failed.";

      if (msg.toLowerCase().includes("username") && msg.toLowerCase().includes("exist")) {
        setSnackbar({ visible: true, message: "❌ Username already taken. Please choose another." });
      } else if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("exist")) {
        setSnackbar({ visible: true, message: "❌ Email already in use." });
      } else {
        setSnackbar({ visible: true, message: "❌ " + msg });
      }
    }
    finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Card style={styles.card} elevation={4}>
          <Card.Content style={{ alignItems: "center" }}>
            <Title style={styles.title}>🌿 Update Profile</Title>

            {/* Avatar preview */}
            <Avatar.Image
              source={{
                uri: image || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              size={120}
              style={styles.avatar}
            />

            {/* Pick image button */}
            <Button
              mode="outlined"
              onPress={pickImage}
              style={styles.outlinedButton}
              icon="image"
            >
              Choose Image
            </Button>

            {/* Profile input fields */}
            <TextInput
              label="New Username"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="New Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Bio"
              mode="outlined"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={styles.input}
              left={<TextInput.Icon icon="information" />}
            />

            {/* Upload button or loading spinner */}
            {uploading ? (
              <ActivityIndicator
                animating={true}
                size="large"
                color={theme.colors.primary}
                style={{ marginTop: 20 }}
              />
            ) : (
              <Button
                mode="contained"
                onPress={handleUpload}
                style={styles.uploadButton}
                icon="upload"
              >
                Update Profile
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Snackbar for messages */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ visible: false, message: "" })}
          duration={2500}
          action={{ label: "OK", onPress: () => { } }}
        >
          {snackbar.message}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * Style definitions for the UploadAvatar screen
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f8e9",
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#1b5e20",
    marginBottom: 16,
    textAlign: "center",
  },
  avatar: {
    marginBottom: 16,
  },
  outlinedButton: {
    marginBottom: 16,
    borderColor: "#66bb6a",
    borderWidth: 1.5,
    borderRadius: 8,
  },
  input: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#f9fbe7",
  },
  uploadButton: {
    marginTop: 10,
    backgroundColor: "#66bb6a",
    borderRadius: 10,
  },
});

