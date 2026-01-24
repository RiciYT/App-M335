import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { Toast, ScreenContainer } from '../components/ui';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#020617';

GoogleSignin.configure({
  webClientId: '205887865955-vh3dhhluv4a1i65ku62tfdlstkctcja9.apps.googleusercontent.com',
});

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoadingType('google');
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          onLogin();
        } else {
          showToast('No ID token received from Google', 'error');
        }
      }
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            showToast('Sign in is already in progress', 'info');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showToast('Google Play Services not available', 'error');
            break;
          default:
            showToast(error.message || 'An error occurred during sign in', 'error');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };


  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, paddingHorizontal: 32, paddingVertical: 48 }}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />

        {/* Header Section */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Title */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 48,
                fontWeight: '900',
                letterSpacing: -2,
                color: NEON_CYAN,
                textTransform: 'uppercase',
                fontStyle: 'italic',
                textShadowColor: 'rgba(34, 211, 238, 0.8)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}
            >
              Tilt
            </Text>
            <View
              style={{
                backgroundColor: NEON_CYAN,
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 4,
                marginTop: 8,
                transform: [{ rotate: '-1deg' }],
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 25,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '900',
                  letterSpacing: 8,
                  color: DEEP_NAVY,
                  textTransform: 'uppercase',
                }}
              >
                Maze
              </Text>
            </View>
          </View>

          {/* Ball Icon with Glow */}
          <View style={{ position: 'relative', marginBottom: 32 }}>
            {/* Blur glow behind */}
            <Animated.View
              style={{
                position: 'absolute',
                top: -16,
                left: -16,
                right: -16,
                bottom: -16,
                backgroundColor: 'rgba(34, 211, 238, 0.2)',
                borderRadius: 999,
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] }),
                transform: [
                  {
                    scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.05] }),
                  },
                ],
              }}
            />
            {/* Ball */}
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(103, 232, 249, 0.3)',
                backgroundColor: NEON_CYAN,
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.7,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 30,
              }}
            >
              <Ionicons name="grid" size={48} color="rgba(255, 255, 255, 0.9)" />
            </View>
            {/* Rotating ring */}
            <View
              style={{
                position: 'absolute',
                top: -8,
                left: -8,
                right: -8,
                bottom: -8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'rgba(34, 211, 238, 0.2)',
              }}
            />
          </View>

          {/* Subtitle */}
          <Text
            style={{
              color: 'rgba(103, 232, 249, 0.7)',
              fontSize: 14,
              fontWeight: '300',
              maxWidth: 240,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Guide the ball through the maze by{' '}
            <Text style={{ color: NEON_CYAN, fontWeight: '600' }}>tilting your device</Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ width: '100%', gap: 32 }}>
          {/* Google Login Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              width: '100%',
              height: 64,
              backgroundColor: DEEP_NAVY,
              borderWidth: 2,
              borderColor: 'rgba(34, 211, 238, 0.6)',
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              shadowColor: NEON_CYAN,
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 15,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loadingType === 'google' ? (
              <ActivityIndicator size="small" color={NEON_CYAN} />
            ) : (
              <>
                {/* Google Icon */}
                <View style={{ width: 20, height: 20 }}>
                  <Text style={{ color: NEON_CYAN, fontSize: 16, fontWeight: '700' }}>G</Text>
                </View>
                <Text
                  style={{
                    color: NEON_CYAN,
                    fontSize: 14,
                    fontWeight: '700',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  Login with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </ScreenContainer>
  );
}
