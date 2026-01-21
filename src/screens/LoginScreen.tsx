import React, { useState } from 'react';
import { View, Text } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { Toast, Button, ScreenContainer, Divider } from '../components/ui';
import { useTheme } from '../theme';

GoogleSignin.configure({
  webClientId: '205887865955-vh3dhhluv4a1i65ku62tfdlstkctcja9.apps.googleusercontent.com',
});

interface LoginScreenProps {
  onLogin: () => void;
  onGuestPlay: () => void;
}

export default function LoginScreen({ onLogin, onGuestPlay }: LoginScreenProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'guest' | 'google' | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });

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

  const handleGuestPlay = () => {
    setLoadingType('guest');
    setTimeout(() => {
      onGuestPlay();
    }, 100);
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 py-8 justify-between">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />

        {/* Header Section */}
        <View className="flex-1 items-center justify-center mt-12 mb-8">
          {/* Logo */}
          <View className="relative w-28 h-28 mb-8">
            <LinearGradient
              colors={['#2EC4C6', '#7FB5FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-3xl opacity-90"
              style={{ transform: [{ rotate: '6deg' }] }}
            />
            <View className={`absolute inset-0 rounded-3xl items-center justify-center border shadow-2xl ${
              isDark ? 'bg-surface-dark border-border-dark' : 'bg-surface-light border-border'
            }`}>
              <Text className="text-6xl">🎮</Text>
            </View>
            <View className="absolute -top-2 -right-2 w-7 h-7 bg-secondary rounded-full border-2 border-white shadow-lg" />
          </View>

          {/* Title */}
          <View className="items-center">
            <Text 
              className={`text-5xl font-black tracking-tighter ${isDark ? 'text-ink-light' : 'text-ink'}`}
              style={{
                textShadowColor: 'rgba(46, 196, 198, 0.35)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 12,
              }}
            >
              TILT <Text className="text-primary">MAZE</Text>
            </Text>
            <Text className={`text-lg text-center mt-3 max-w-[300px] leading-relaxed ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              Guide the ball through the maze by tilting your device
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-6 mb-12">
          <Button
            variant="secondary"
            size="lg"
            onPress={handleGuestPlay}
            loading={loadingType === 'guest'}
            disabled={loading}
            icon={<Text className="text-white text-2xl">▶</Text>}
          >
            PLAY AS GUEST
          </Button>

          <Divider text="or login to save" />

          <Button
            variant="outline"
            size="md"
            onPress={handleGoogleSignIn}
            loading={loadingType === 'google'}
            disabled={loading}
            icon={<Text className="text-primary font-bold text-xl">G</Text>}
          >
            Continue with Google
          </Button>
        </View>

        {/* Footer */}
        <View className="pb-6">
          <Text className={`text-center text-xs font-bold uppercase tracking-[3px] ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            TILT LEFT/RIGHT TO CONTROL THE BALL
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

