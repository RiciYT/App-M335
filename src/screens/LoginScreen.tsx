import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { PrimaryButton, SecondaryButton, Divider, Toast } from '../components/ui';

// Required for Google Sign-In on web
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLogin: () => void;
  onGuestPlay: () => void;
}

export default function LoginScreen({ onLogin, onGuestPlay }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'guest' | 'google' | 'anonymous' | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Google Sign-In setup
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

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleGoogleCredential = async (idToken: string) => {
    setLoading(true);
    setLoadingType('google');
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      onLogin();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setLoadingType('anonymous');
    try {
      await signInAnonymously(auth);
      onLogin();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingType('google');
    try {
      await promptAsync();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast(errorMessage, 'error');
      setLoadingType(null);
    }
  };

  const handleGuestPlay = () => {
    setLoadingType('guest');
    // Small delay to show visual feedback
    setTimeout(() => {
      onGuestPlay();
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Tilt Maze</Text>
          <Text style={styles.subtitle}>
            Guide the ball through the maze{'\n'}by tilting your device
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {loading && loadingType !== 'guest' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9500" />
              <Text style={styles.loadingText}>Signing in...</Text>
            </View>
          ) : (
            <>
              {/* Primary CTA - Play as Guest */}
              <PrimaryButton
                title="Play as Guest"
                icon="🎮"
                onPress={handleGuestPlay}
                disabled={loading}
                loading={loadingType === 'guest'}
              />

              {/* Divider */}
              <Divider text="or login to save scores" />

              {/* Login Options */}
              <View style={styles.loginOptions}>
                <SecondaryButton
                  title="Continue with Google"
                  icon="🔵"
                  variant="google"
                  onPress={handleGoogleSignIn}
                  disabled={!request || loading}
                  loading={loadingType === 'google'}
                  style={styles.loginButton}
                />

                <SecondaryButton
                  title="Anonymous Login"
                  icon="👤"
                  variant="anonymous"
                  onPress={handleAnonymousLogin}
                  disabled={loading}
                  loading={loadingType === 'anonymous'}
                  style={styles.loginButton}
                />
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tilt left/right to control the ball
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginOptions: {
    gap: 12,
  },
  loginButton: {
    marginBottom: 0,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
