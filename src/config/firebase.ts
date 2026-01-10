import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

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

// Export Firebase services for use throughout the app
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
