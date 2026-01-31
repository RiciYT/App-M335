import 'dotenv/config';

export default {
  expo: {
    name: "TiltMaze",
    slug: "app-m335",
    version: "1.0.0",
    scheme: "tiltmaze",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.riciyt.tiltmaze",
      infoPlist: {
        NSMotionUsageDescription: "This app uses motion sensors to control the game ball."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.SENSORS"
      ],
      package: "com.riciyt.tiltmaze",
      googleServicesFile: "./google-services.json"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "ea02cbdc-02ce-4529-a804-2cfd1dcc00c9"
      },
      // Firebase configuration from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      // Google Sign-In configuration
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    },
    owner: "riciyt",
    originalFullName: "@riciyt/app-m335",
    plugins: [
      "@react-native-google-signin/google-signin",
      "expo-font",
      "expo-audio",
      "expo-asset"
    ]
  }
};
