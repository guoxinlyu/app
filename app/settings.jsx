// React and React Native imports
import { useState, useEffect } from "react";
import { View, Button, Image, StyleSheet, Alert, Text, ActivityIndicator } from "react-native";

// Expo image picker for selecting images from the media library
import * as ImagePicker from "expo-image-picker";

// API function to upload the avatar
import { uploadAvatar } from "../api/api";

// Navigation hooks from Expo Router
import { useRouter, useNavigation } from "expo-router";

/**
 * UploadAvatar Screen – allows the user to pick an image from the gallery
 * and upload it as their new profile picture.
 */
export default function UploadAvatar() {
  const [image, setImage] = useState(null);// Stores selected image URI
  const [uploading, setUploading] = useState(false);// Upload progress indicator
  const [hasPermission, setHasPermission] = useState(null);// Photo access permission state

  const router = useRouter();
  const navigation = useNavigation();

  /**
   * Request media library permission on component mount
   */
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        // Request permission if not already granted
        const { status: askStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(askStatus === "granted");

        if (askStatus !== "granted") {
          Alert.alert("Permission Denied", "Please enable photo access in your system settings.");
        }
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  /**
   * Opens the image picker and stores the selected image
   */
  const pickImage = async () => {
    if (!hasPermission) {
      Alert.alert("Cannot Access Gallery", "Please grant permission first.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      console.log("Image selected:", result);

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);// Save selected image URI
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking an image: " + error.message);
    }
  };

  /**
   * Uploads the selected image to the server as the user's avatar
   */
  const handleUpload = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image before uploading.");
      return;
    }

    setUploading(true);// Show loading spinner

    // Prepare image data as FormData for the backend
    const formData = new FormData();
    formData.append("avatar", {
      uri: image,
      name: "avatar.jpg",
      type: "image/jpeg",
    });

    try {
      await uploadAvatar(formData);
      Alert.alert("✅ Upload Successful", "Your avatar has been updated!");

      // Go back or redirect to homepage
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        router.replace("/");
      }
    } catch (err) {
      Alert.alert("❌ Upload Failed", err.message);
    } finally {
      setUploading(false);// Hide loading spinner
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Avatar</Text>
      <Button title="Choose Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Upload Avatar" onPress={handleUpload} color="#4CAF50" />
      )}
    </View>
  );
}

// Styles for UploadAvatar screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: "#2e7d32",
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginVertical: 20,
  },
});
