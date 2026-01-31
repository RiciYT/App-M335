import { initializeApp } from 'firebase/app';
// @ts-expect-error - getReactNativePersistence is exported from react-native specific bundle
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get config from app.config.js extra
const extra = Constants.expoConfig?.extra ?? {};

// Validate required environment variables
const requiredEnvVars = [
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseDatabaseUrl',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId',
];

const missingVars = requiredEnvVars.filter((key) => !extra[key]);
if (missingVars.length > 0) {
  console.warn(
    `Missing Firebase environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file and app.config.js setup.'
  );
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  databaseURL: extra.firebaseDatabaseUrl,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
  measurementId: extra.firebaseMeasurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence (AsyncStorage)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const database = getDatabase(app);
