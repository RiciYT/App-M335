import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { Toast } from '../components/ui';

const { width, height } = Dimensions.get('window');

// Required for Google Sign-In on web
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLogin: () => void;
  onGuestPlay: () => void;
}

export default function LoginScreen({ onLogin, onGuestPlay }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'guest' | 'google' | 'apple' | 'anonymous' | null>(null);
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

  const handleAppleSignIn = () => {
    setLoadingType('apple');
    // Simulate apple sign in
    setTimeout(() => {
      showToast('Apple Sign In not configured yet', 'info');
      setLoadingType(null);
    }, 1000);
  };

  const handleGuestPlay = () => {
    setLoadingType('guest');
    setTimeout(() => {
      onGuestPlay();
    }, 100);
  };

  const GridBackground = () => (
    <View style={styles.gridContainer} pointerEvents="none">
      {[...Array(20)].map((_, i) => (
        <View key={`v-${i}`} style={[styles.gridLineV, { left: i * (width / 10) }]} />
      ))}
      {[...Array(40)].map((_, i) => (
        <View key={`h-${i}`} style={[styles.gridLineH, { top: i * (width / 10) }]} />
      ))}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <GridBackground />
      
      {/* Blur Circles */}
      <View style={[styles.blurCircle, styles.blurTopLeft]} />
      <View style={[styles.blurCircle, styles.blurBottomRight]} />

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
            <View style={styles.logoOuter}>
              <LinearGradient
                colors={['#06b6d4', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              />
              <View style={styles.logoInner}>
                <Text style={styles.logoIcon}>🎮</Text>
              </View>
              <View style={styles.logoDot} />
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                TILT <Text style={styles.titleHighlight}>MAZE</Text>
              </Text>
              <Text style={styles.subtitle}>
                Guide the ball through the maze by tilting your device
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleGuestPlay}
              disabled={loading || loadingType === 'guest'}
            >
              <LinearGradient
                colors={['#fb923c', '#ea580c']}
                style={styles.playButton}
              >
                {loadingType === 'guest' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.playButtonIcon}>▶</Text>
                    <Text style={styles.playButtonText}>PLAY AS GUEST</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR LOGIN TO SAVE</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginOptions}>
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={handleGoogleSignIn}
                disabled={!request || loading}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIcon}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, styles.appleButton]} 
                onPress={handleAppleSignIn}
                disabled={loading}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={[styles.socialIcon, styles.appleIcon]}></Text>
                </View>
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.anonymousButton} 
                onPress={handleAnonymousLogin}
                disabled={loading}
              >
                <Text style={styles.anonymousIcon}>👤</Text>
                <Text style={styles.anonymousButtonText}>Anonymous Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              TILT LEFT/RIGHT TO CONTROL THE BALL
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#334155',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#334155',
  },
  blurCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.2,
  },
  blurTopLeft: {
    top: -50,
    left: -50,
    backgroundColor: '#06b6d4',
  },
  blurBottomRight: {
    bottom: -50,
    right: -50,
    backgroundColor: '#2563eb',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoOuter: {
    width: 96,
    height: 96,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    transform: [{ rotate: '6deg' }],
    opacity: 0.8,
  },
  logoInner: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 48,
  },
  logoDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    backgroundColor: '#f97316',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -2,
  },
  titleHighlight: {
    color: '#06b6d4',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
    marginBottom: 40,
  },
  playButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonIcon: {
    fontSize: 24,
    color: '#fff',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  loginOptions: {
    gap: 16,
  },
  socialButton: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  appleIcon: {
    color: '#fff',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  anonymousIcon: {
    fontSize: 18,
    color: '#64748b',
  },
  anonymousButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 2,
    fontWeight: '600',
  },
});
