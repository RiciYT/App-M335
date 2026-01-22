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
        <View className="flex-1 items-center justify-center mt-8 mb-6">
          {/* Logo with neon glow */}
          <View className="relative w-32 h-32 mb-10">
            {/* Outer glow ring */}
            <View 
              className="absolute inset-[-8px] rounded-[32px]"
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
              }}
            />
            
            {/* Gradient background rotated */}
            <LinearGradient
              colors={['#A855F7', '#F472B6', '#22D3EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-[28px]"
              style={{ 
                transform: [{ rotate: '6deg' }],
                opacity: 0.9,
              }}
            />
            
            {/* Main logo container */}
            <View 
              className={`absolute inset-0 rounded-[28px] items-center justify-center ${
                isDark ? 'bg-surface-dark' : 'bg-surface-light'
              }`}
              style={{
                shadowColor: '#A855F7',
                shadowOpacity: isDark ? 0.5 : 0.3,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 24,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
              }}
            >
              <Text className="text-6xl">🎮</Text>
            </View>
            
            {/* Accent dot */}
            <View 
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary items-center justify-center"
              style={{
                shadowColor: '#F472B6',
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
              }}
            >
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
          </View>

          {/* Title with dramatic typography */}
          <View className="items-center">
            <View className="flex-row items-baseline">
              <Text 
                className={`text-6xl font-black tracking-tighter ${isDark ? 'text-ink-light' : 'text-ink'}`}
                style={{
                  textShadowColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.2)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 16,
                }}
              >
                TILT
              </Text>
            </View>
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-4 py-1 rounded-lg mt-1"
            >
              <Text 
                className="text-5xl font-black tracking-tight text-white"
                style={{ letterSpacing: -2 }}
              >
                MAZE
              </Text>
            </LinearGradient>
            
            <Text className={`text-base text-center mt-6 max-w-[280px] leading-relaxed font-medium ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              Guide the ball through the maze by tilting your device
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-5 mb-10">
          <Button
            variant="secondary"
            size="lg"
            onPress={handleGuestPlay}
            loading={loadingType === 'guest'}
            disabled={loading}
            icon={<Text className="text-white text-2xl">▶</Text>}
          >
            PLAY NOW
          </Button>

          <Divider text="or sign in" />

          <Button
            variant="outline"
            size="md"
            onPress={handleGoogleSignIn}
            loading={loadingType === 'google'}
            disabled={loading}
            icon={
              <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                <Text className="text-primary-dark font-black text-sm">G</Text>
              </View>
            }
          >
            Google
          </Button>
        </View>

        {/* Footer */}
        <View className="pb-4">
          <View className="flex-row items-center justify-center">
            <View className="w-8 h-[1px] bg-primary/30 mr-3" />
            <Text className={`text-center text-xs font-black uppercase tracking-[3px] ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              Tilt to Play
            </Text>
            <View className="w-8 h-[1px] bg-primary/30 ml-3" />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

