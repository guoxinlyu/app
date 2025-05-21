import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

/**
 * ScanScreen - A camera view screen that continuously scans QR codes.
 * Extracts beacon ID from scanned URLs and navigates to a WebView for the beacon.
 */
export default function ScanScreen() {
  /** Indicates whether a QR code has been recently scanned */
  const [scanned, setScanned] = useState(false);

  /** Manages camera permission status */
  const [permission, requestPermission] = useCameraPermissions();

  /** Router instance for navigation */
  const router = useRouter();

  /** Timer reference for scan cooldown */
  const timeoutRef = useRef(null);

  /**
   * Cleanup: clear any running timers on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /**
   * Handle case where permission state is still loading
   */
  if (!permission) {
    return (
      <View>
        <Text>Requesting permission</Text>
      </View>
    );
  }

  /**
   * Show request screen if permission is denied
   */
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need camera permission</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  /**
   * Handler for QR code scanning.
   * Parses URL, extracts beacon ID, and navigates to WebView.
   */
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return; // Prevent duplicate scans

    setScanned(true);

    try {
      let beaconId = null;

      // Try to extract beaconId from a scanned URL like http://.../beacon/abc123
      if (data.startsWith("http")) {
        const urlObj = new URL(data);
        if (urlObj.pathname.startsWith("/beacon/")) {
          beaconId = urlObj.pathname.split("/beacon/")[1];
        }
      }

      if (!beaconId) {
        Alert.alert('Invalid QR Code', 'Beacon ID not found.');
      } else {
        router.push(`/webview?url=${encodeURIComponent(`beacon://${beaconId}`)}`);
      }
    } catch (error) {
      Alert.alert('Discovery failed', error.message);
    } finally {
      /**
       * Allow scanning again after a short delay (2s)
       */
      timeoutRef.current = setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  /**
   * Main camera interface
   */
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        type="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarCodeScanned}
      />
    </View>
  );
}

/**
 * Styles for ScanScreen layout and camera view
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});
