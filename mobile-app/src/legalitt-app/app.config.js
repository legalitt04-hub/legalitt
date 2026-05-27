const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

export default ({ config }) => ({
  ...config,
  expo: {
    name: "Legalitt",
    owner: "legalittgrowths-organization",
    slug: "legalitt",
    version: "1.0.3",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-custom.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.legalitt.app",
      buildNumber: "1",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Legalitt uses your location to find advocates near you.",
        NSLocationAlwaysUsageDescription: "Legalitt uses your location to find advocates near you.",
        NSCameraUsageDescription: "Upload profile photo or documents.",
        NSPhotoLibraryUsageDescription: "Upload profile photo or documents."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#FFFFFF"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      package: "com.legalitt.app",
      versionCode: 1,
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.RECORD_AUDIO"
      ],
      googleServicesFile: "./google-services.json"
    },
    plugins: [
      "expo-font",
      "expo-location",
      "expo-image-picker",
      "expo-document-picker",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#0d9488"
        }
      ],
      "@react-native-google-signin/google-signin",
      "expo-web-browser"
    ],
    extra: {
      eas: {
        projectId: "8136d29e-51a5-4de0-9ae3-cbdedc794e9b"
      },
      API_URL: process.env.API_URL,
      SOCKET_URL: process.env.SOCKET_URL,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_API_URL: process.env.GEMINI_API_URL,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
      MOBILE_APP_SECRET: process.env.MOBILE_APP_SECRET,
    }
  }
});
