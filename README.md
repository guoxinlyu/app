# 🌱 EcoCache – Sustainability Adventure App

**EcoCache** is a mobile adventure app that combines **BLE beacons**, **QR scanning**, **maps**, and **gamification** to encourage eco-friendly exploration.  
Built with **React Native** and **Expo**, it offers a fun, interactive, and educational way to engage with real-world environments.

---

## 🚀 Features

- 📍 Real-time map with beacon and location markers (`react-native-maps`, `expo-location`, `geolib`)
- 📡 BLE beacon detection for proximity-based feedback (`react-native-ble-plx`)
- 📷 QR code scanning and image capture (`expo-camera`, `expo-image-picker`)
- 🎮 Gamified exploration with point-based rewards
- 🔒 Secure local storage with `expo-secure-store`
- 🧭 Navigation powered by `expo-router` (file-based routing)
- 💥 Haptic feedback using `expo-haptics`
- 🌐 WebView integration for displaying location content
- 🧪 Jest testing support with `jest-expo`
- checkbox
- >npm install react-native-paper react-native-vector-icons

---

## ⚙️ Getting Started

### Install dependencies

```bash
npm install
```


## 📱 Android APK Build

This project supports native Android builds via **Expo Application Services (EAS)**.

### 🔽 Download Latest APK

You can install the latest build directly by visiting the following link:

> [📦 Download Android APK](https://expo.dev/accounts/3181182997/projects/my-first-native-app/builds/ad5b82ee-d67e-413e-8583-d28a49ca3fa4)

1. Open the link on your Android phone
2. Tap **"Download"** to save the `.apk` file
3. Open the file to install it

> ⚠️ **Note**: You may need to enable _"Install from unknown sources"_ in your device settings to install the app.

---

### 🔐 Expo Account Access (optional)

If you need to access additional build details or future builds, please log in to [https://expo.dev](https://expo.dev) with the appropriate Expo account.

- **Account ID**: `3181182997`
- **PassWord**:`laolvzi123`



▶️ **Run the App (Using Dev Client APK)**
This project uses a custom Development Client built with **EAS** to support native modules like **BLE**.

🖥 **On your Windows computer**
Ensure your computer and Android device are on the same Wi-Fi network

Start the local development server:

```bash
npx expo start
```

A QR code will appear in your terminal or browser

📱 **On your Android device**
📦 **Download and install the Dev APK**

Open the installed app (which includes expo-dev-client)
Scan the QR code displayed from your development server
The app will load directly from your local machine
⚠️ Make sure to enable "Install from Unknown Sources" in your Android settings before installing the APK.


## 🔒 Required Permissions

Make sure the app has the following permissions enabled:

- **Location access (foreground)** – for detecting nearby beacons and showing map
- **Camera access** – for scanning QR codes
- **Bluetooth access** – for BLE scanning (Android 12+ requires special handling)
- **Media Library access** – for saving or uploading images

You may also need to manually allow these in Android system settings.


⚠️ **Known Issues / Limitations**
- ✅ **Android only**: The project currently supports Android; iOS is not yet implemented.
- 🚫 **BLE features require physical devices**: Simulators/emulators do not support Bluetooth.
- 📦 **No iOS build**: Requires Apple Developer credentials and EAS configuration (not included here).



