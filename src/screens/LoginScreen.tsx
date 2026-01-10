import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';

// Required for Google Sign-In on web
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLogin: () => void;
  onGuestPlay: () => void;
}

export default function LoginScreen({ onLogin, onGuestPlay }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  // Google Sign-In setup
  // Note: Replace with your actual Google client IDs from Firebase Console > Authentication > Sign-in method > Google
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleCredential(id_token);
    }
  }, [response]);

  const handleGoogleCredential = async (idToken: string) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      onLogin();
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      onLogin();
    } catch (error: any) {
      Alert.alert('Anonymous Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tilt Maze</Text>
      <Text style={styles.subtitle}>Guide the ball to the target!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          {/* Guest Play Button - Most prominent */}
          <TouchableOpacity style={[styles.button, styles.guestButton]} onPress={onGuestPlay}>
            <Text style={styles.buttonText}>🎮 Play as Guest</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or login to save scores</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={!request}
          >
            <Text style={styles.buttonText}>🔵 Sign in with Google</Text>
          </TouchableOpacity>

          {/* Anonymous Login Button */}
          <TouchableOpacity style={[styles.button, styles.anonymousButton]} onPress={handleAnonymousLogin}>
            <Text style={styles.buttonText}>👤 Anonymous Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  guestButton: {
    backgroundColor: '#FF9500',
    marginBottom: 10,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  anonymousButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
});
