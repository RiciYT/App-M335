import { initializeApp } from 'firebase/app';
// @ts-expect-error - getReactNativePersistence is exported from react-native specific bundle
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSKogzBS0Cs6Xg00OHbCm4tF-MEt_atW4",
  authDomain: "expo-app-m335.firebaseapp.com",
  databaseURL: "https://expo-app-m335-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "expo-app-m335",
  storageBucket: "expo-app-m335.firebasestorage.app",
  messagingSenderId: "205887865955",
  appId: "1:205887865955:web:dfda1888e09e10e7a6e456",
  measurementId: "G-8M9VQQD567"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence (AsyncStorage)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const database = getDatabase(app);
