// Import BLE manager from react-native-ble-plx and required native modules
import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Vibration } from 'react-native';

// Create a new BLE manager instance
const manager = new BleManager();

/**
 * Vibrates the device based on Bluetooth signal strength (RSSI).
 * Stronger signals produce longer or repeated vibrations.
 * Weaker signals may be ignored.
 * 
 * @param {number} rssi - Received Signal Strength Indicator
 */
const vibrateBySignalStrength = (rssi) => {
  if (rssi === null || rssi === undefined) {
    console.warn("⚠️ RSSI is null or undefined. No vibration.");
    return;
  }

  if (Platform.OS === "ios") {
    Vibration.vibrate();
  } else {
    if (rssi > -75) {
      Vibration.vibrate([0, 600, 200, 600]);
    } else if (rssi > -80) {
      Vibration.vibrate(700);
    } else if (rssi > -100) {
      Vibration.vibrate(300);
    } else {
      console.log("📶 Signal too weak for vibration.");
    }
  }
};

/**
 * Requests required Bluetooth and location permissions on Android.
 * Required for scanning BLE devices.
 */
export async function requestBLEPermissions() {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  }
}

/**
 * Starts scanning for BLE devices.
 * If a matching device is found (name includes "DECO3801"), triggers vibration and callback.
 * 
 * @param {Function} onMatch - Callback to run when a target beacon is found
 */
export function startBLEScan(onMatch) {
  console.log("🚀 BLE scan started");

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error("❌ BLE scan error:", error.message);
      return;
    }

    if (device?.name?.includes("DECO3801")) {
      console.log(`🎯 Found: ${device.name} | RSSI: ${device.rssi}`);
      vibrateBySignalStrength(device.rssi);
      if (onMatch) onMatch(device); 
    }
  });
}

/**
 * Stops the BLE scan and cleans up resources.
 */
export function stopBLEScan() {
  manager.stopDeviceScan();
  manager.destroy();
}

// Default export as a fallback (not used directly in components)
export default () => null;