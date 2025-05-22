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
- ✅ Custom UI built with `react-native-paper` and `react-native-vector-icons`

---

## 📁 Project Structure

<details>
<summary>Project Structure </summary>

```text
App/
├── app/                     # App entry point with Expo Router pages
│   ├── index.jsx            # Home screen
│   ├── map.jsx              # Main map 
│   ├── login.jsx            # Login screen
│   ├── signup.jsx           # Signup screen
│   ├── QRcodeScanner.jsx    # QR scanner screen
│   ├── _layout.jsx          # Layout page
│   ├── webview.jsx          # Beacon screen
│   ├── settings.jsx         # Update user screen
│   ├── bleService.jsx       # BLE logic
│   └── beacon/              # Dynamic route for scanned beacon
│       └── [beaconId].jsx   # Beacon detail page (Discoveries)
│
├── api/                     # API calls (getBeacon, signIn, etc.)
│   ├── api.jsx              # Authenticated endpoints (beacons, profile)
│   └── auth.jsx             # Sign in / sign up logic with JWT token handling
│
├── data/                    # QRcode of beacons
│
├── assets/                  # Images, icons, lottie animations
│   └── animations/          # Lottie JSON files
│
├── app.json                 # Expo project config
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation

 ```
</details>

## ⚙️ Getting Started

### Install dependencies

```bash
npm install
```


## 📱 Android APK Build

This project supports native Android builds via **Expo Application Services (EAS)**.

### 🔽 Download Android APK

> ⚠️ **Note:** Due to Expo’s current permissions system, downloading this APK requires logging in with an Expo account.

If you are reviewing this project, please log in to [https://expo.dev](https://expo.dev) using the credentials below to access the build:

- **Expo Account ID:** `3181182997`  
- **Password:** `laolvzi123`

👉 After login, go to the following build link:

[📦 Click here to Download the Android APK](https://expo.dev/accounts/3181182997/projects/my-first-native-app/builds/c7e1a8c8-9374-4eb5-88e9-fb835d41a44e)

> 📅 **Click "Install" on that page to download the APK built on May 17th.**


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

## 📚 References

LottieFiles. (2024). *Animated confetti celebration*. Retrieved from https://app.lottiefiles.com/animation/126770eb-c18b-4a55-b7bd-0f3c1b260ad5

LottieFiles. (2024). *Beacon pulse animation*. Retrieved from https://app.lottiefiles.com/animation/16e13955-b0ff-4192-9752-4a891b6777d4

LottieFiles. (2024). *Nature eco badge animation*. Retrieved from https://app.lottiefiles.com/animation/9eee597d-e8b2-4980-af48-1e3b2fbe07fb


