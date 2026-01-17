import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { Toast } from '../components/ui';

const { width } = Dimensions.get('window');

// Required for Google Sign-In on web
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLogin: () => void;
  onGuestPlay: () => void;
}

export default function LoginScreen({ onLogin, onGuestPlay }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'guest' | 'google' | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Google Sign-In setup
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: '205887865955-eh17efj9j2jhseli4qbjgvosfoj53uua.apps.googleusercontent.com',
      webClientId: '205887865955-eh17efj9j2jhseli4qbjgvosfoj53uua.apps.googleusercontent.com',
      redirectUri,
    }
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      void handleGoogleCredential(id_token);
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

  const handleGoogleSignIn = async () => {
    setLoadingType('google');
    try {
      await promptAsync({ useProxy: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast(errorMessage, 'error');
      setLoadingType(null);
    }
  };

  const handleGuestPlay = () => {
    setLoadingType('guest');
    setTimeout(() => {
      onGuestPlay();
    }, 100);
  };

  const GridBackground = () => (
      <View className="absolute inset-0 z-0" pointerEvents="none">
        <View className="absolute inset-0 opacity-[0.06]">
          {[...Array(20)].map((_, i) => (
            <View key={`v-${i}`} className="absolute top-0 bottom-0 w-[1px] bg-ink" style={{ left: i * (width / 10) }} />
          ))}
          {[...Array(40)].map((_, i) => (
            <View key={`h-${i}`} className="absolute left-0 right-0 h-[1px] bg-ink" style={{ top: i * (width / 10) }} />
          ))}
        </View>
      </View>
  );

  return (
    <View className="flex-1 bg-background-light relative overflow-hidden">
      <GridBackground />
      
      {/* Glow effects */}
      <View className="absolute -top-[10%] -left-[15%] w-72 h-72 bg-primary/20 rounded-full" />
      <View className="absolute top-[25%] -right-[20%] w-64 h-64 bg-secondary/20 rounded-full" />
      <View className="absolute -bottom-[15%] -right-[10%] w-80 h-80 bg-accent/20 rounded-full" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 py-8 justify-between">
          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={() => setToast({ ...toast, visible: false })}
          />

          {/* Header Section */}
          <View className="flex-1 items-center justify-center mt-12 mb-8">
            <View className="relative w-24 h-24 mb-6">
              <LinearGradient
                colors={['#2EC4C6', '#7FB5FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0 rounded-2xl opacity-90"
                style={{ transform: [{ rotate: '6deg' }] }}
              />
              <View className="absolute inset-0 bg-surface-light rounded-2xl items-center justify-center border border-border shadow-xl">
                <Text className="text-5xl">🎮</Text>
              </View>
              <View className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full border-2 border-surface-light shadow-sm" />
            </View>

            <View className="items-center">
              <Text 
                className="text-5xl font-bold text-ink tracking-tighter"
                style={{
                  textShadowColor: 'rgba(46, 196, 198, 0.35)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
                }}
              >
                TILT <Text className="text-primary">MAZE</Text>
              </Text>
              <Text className="text-ink-muted text-lg text-center mt-2 max-w-[280px] leading-relaxed">
                Guide the ball through the maze by tilting your device
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View className="w-full space-y-8 mb-12">
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleGuestPlay}
              disabled={loading || loadingType === 'guest'}
              className="w-full"
            >
              <LinearGradient
                colors={['#F59C7A', '#F07D62']}
                className="w-full h-16 rounded-[28px] flex-row items-center justify-center shadow-lg shadow-secondary/40"
              >
                {loadingType === 'guest' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-white mr-2 text-2xl">▶</Text>
                    <Text className="text-white font-bold text-lg tracking-wide">PLAY AS GUEST</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="mx-4 text-ink-muted text-sm font-medium uppercase tracking-widest">
                or login to save
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>

            <View className="space-y-4">
              <TouchableOpacity 
                className="w-full h-14 bg-surface-light border border-border rounded-[24px] flex-row items-center justify-center shadow-sm"
                onPress={handleGoogleSignIn}
                disabled={!request || loading}
              >
                <View className="w-8 h-8 items-center justify-center mr-2">
                  <Text className="text-primary font-bold text-xl">G</Text>
                </View>
                <Text className="text-ink font-semibold">Continue with Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="pb-8">
            <Text className="text-center text-xs text-ink-muted font-medium uppercase tracking-[3px]">
              TILT LEFT/RIGHT TO CONTROL THE BALL
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

