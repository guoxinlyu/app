import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

/**
 * ScanScreen - A screen that uses the camera to scan QR codes
 * and extracts a beacon ID to navigate to a WebView screen.
 */
export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);// State to avoid multiple scans
  const [permission, requestPermission] = useCameraPermissions();// Hook to handle camera permissions
  const router = useRouter();// Expo router for navigation

   // While permission object is loading
  if (!permission) return <View><Text>Requesting permission</Text></View>;

  // If camera permission is not granted, prompt user
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text>We need camera permission</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );

  /**
   * Callback for when a QR code is successfully scanned.
   * Parses beacon ID from the QR code URL and navigates to the WebView.
   */  
  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);// prevent repeated scans

    try {
      let beaconId = null;

      // Example valid data: https://example.com/beacon/abc123
      if (data.startsWith("http")) {
        const urlObj = new URL(data);
        if (urlObj.pathname.startsWith("/beacon/")) {
          beaconId = urlObj.pathname.split("/beacon/")[1];// Extract ID from URL
        }
      }

      if (!beaconId) {
        Alert.alert('Invalid QR Code', 'Beacon ID not found.');
        return;
      }

      // Navigate to WebView screen and pass beaconId using custom protocol
      router.push(`/webview?url=${encodeURIComponent(`beacon://${beaconId}`)}`);
    } catch (error) {
      Alert.alert('Discovery failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        type="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

// Basic styles for layout
const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
});
