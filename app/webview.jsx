import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { discoverBeacon, getBeacon } from '../api/api';

/**
 * BeaconWebView – Displays detailed beacon info inside a WebView
 * - Loads beacon details from backend
 * - Automatically performs "discovery" upon scan
 */
export default function BeaconWebView() {
  const { url } = useLocalSearchParams();
  const [discovered, setDiscovered] = useState(false); // Prevent repeated scans
  const [beacon, setBeacon] = useState(null); // Beacon info state

  // Extract beacon ID from incoming URL param
  let beaconId = decodeURIComponent(url || '');
  if (beaconId.startsWith('beacon://')) {
    beaconId = beaconId.replace('beacon://', '');
  }

  // On mount: load beacon info and trigger discovery API
  useEffect(() => {
    if (!beaconId || discovered) return;

    // Fetch beacon metadata
    getBeacon(beaconId)
      .then((data) => {
        setBeacon(data);
      })
      .catch((err) => {
        Alert.alert('Unable to load beacon info', err.message || 'Please check your network connection');
      });

    // Perform beacon discovery (scan logging)
    discoverBeacon(beaconId)
      .then((res) => {
        if (res.points_awarded > 0) {
          Alert.alert('🎉 Success!', `You earned ${res.points_awarded} points`);
        } else {
          Alert.alert('📍 Already scanned', 'You have already discovered this beacon');
        }
        setDiscovered(true);
      })
      .catch((err) => {
        console.error('❌ Discovery failed:', err);
        Alert.alert('⚠️ Discovery failed', err.message || 'Please check your network or login status');
      });
  }, [beaconId]);

  // While loading, return nothing
  if (!beacon) return null;

  const imageUrl = beacon.image_url || 'https://cdn-icons-png.flaticon.com/512/684/684908.png';

  // Dynamically generated HTML content for the WebView
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${beacon.name}</title>
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <style>
  * {
  box-sizing: border-box;
  }
  body {
      margin: 0;
      padding: 0;
      font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(to bottom right, #e8f5e9, #bbdefb);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .card {
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      width: 92%;
      max-width: 420px;
      padding: 24px 20px;
      text-align: center;
      transform: scale(0.95);
      opacity: 0;
      animation: fadeInScale 0.6s ease-out forwards;
    }

    @keyframes fadeInScale {
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .lottie {
      margin-bottom: -10px;
      margin-top: -10px;
    }

    .reward {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 10px 14px;
      margin: 14px auto;
      border-radius: 10px;
      font-weight: bold;
      font-size: 16px;
      display: inline-block;
    }

    img {
    width: 180px;
    height: 130px;
    object-fit: cover;
    border-radius: 16px;
    margin: 12px auto 18px auto; 
    border: 4px solid #4caf50;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    display: block;
    }

    h1 {
      font-size: 24px;
      color: #2e7d32;
      margin: 12px 0 6px;
    }

    p {
      font-size: 16px;
      color: #37474f;
      margin: 8px 0;
    }

    .beacon-id {
      font-weight: 600;
      color: #1e88e5;
    }

    .tagline {
      font-weight: bold;
      color: #43a047;
      margin-top: 16px;
      font-size: 16px;
    }
      </style>
    </head>
  <body>
    <div class="card">
    <img src="${imageUrl}" alt="Beacon" />
    <div class="reward">🏆 +10 Eco Points</div>
    <h1>${beacon.name}</h1>
    <p class="beacon-id">ID: ${beacon.beacon_id}</p>
    <p>${beacon.description}</p>
    <p>📍 ${beacon.location}</p>
    <p class="tagline">🎯 You just discovered a beacon!</p>
    </div>
  </body>
  </html>
`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      style={{ flex: 1 }}
    />
  );
}
