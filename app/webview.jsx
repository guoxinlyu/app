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
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${beacon.name}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: linear-gradient(to bottom right, #f0f4f8, #dbeafe);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          padding: 24px;
          max-width: 90%;
          width: 360px;
          text-align: center;
          animation: fadeIn 0.8s ease;
        }
        h1 {
          font-size: 24px;
          color: #1e3a8a;
          margin-bottom: 12px;
        }
        p {
          font-size: 16px;
          color: #334155;
          margin: 6px 0;
        }
        .beacon-id {
          font-weight: bold;
          font-size: 18px;
          color: #2563eb;
        }
        img {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          border-radius: 12px;
          object-fit: contain;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="${imageUrl}" alt="Beacon Icon" />
        <h1>${beacon.name}</h1>
        <p class="beacon-id">ID: ${beacon.beacon_id}</p>
        <p>${beacon.description}</p>
        <p>📍 ${beacon.location}</p>
        <p>🎯 GOOD JOB!</p>
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
