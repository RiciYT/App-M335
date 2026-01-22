import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { clamp, roundToDecimals } from '../config/tiltControls';
import { ScreenContainer, Header, Card, ListItem } from '../components/ui';
import { useTheme } from '../theme';
import { AppSettings, SETTINGS_KEY, DEFAULT_SETTINGS } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  isGuest: boolean;
  onLogout: () => void;
}

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ onBack, isGuest, onLogout }: SettingsScreenProps) {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    loadSettings();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveSettings();
    }, 500);
  }, [settings]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
      isInitializedRef.current = true;
    } catch (error) {
      console.error('Error loading settings:', error);
      isInitializedRef.current = true;
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleVibration = useCallback(() => {
    setSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }));
  }, []);

  const adjustSensitivity = useCallback((delta: number) => {
    setSettings(prev => ({
      ...prev,
      sensitivity: roundToDecimals(clamp(prev.sensitivity + delta, 0.3, 3.0), 1),
    }));
  }, []);

  const handleResetBestTime = () => {
    Alert.alert(
      'Reset Best Time',
      'Are you sure you want to reset your best time? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const user = auth.currentUser;
            if (user) {
              try {
                const scoreRef = ref(database, `scores/${user.uid}`);
                await remove(scoreRef);
                Alert.alert('Success', 'Your best time has been reset.');
              } catch (error) {
                Alert.alert('Error', 'Failed to reset best time.');
              }
            } else {
              Alert.alert('Info', 'No score to reset.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              onLogout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out.');
            }
          },
        },
      ]
    );
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeMode(themes[nextIndex]);
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return '☀️ Light';
      case 'dark': return '🌙 Dark';
      case 'system': return '🔄 Auto';
    }
  };

  return (
    <ScreenContainer showGlowEffects={true}>
      {/* Header */}
      <View 
        className={`mx-4 mt-2 rounded-3xl overflow-hidden ${
          isDark ? 'bg-surface-dark/80' : 'bg-surface-light/90'
        }`}
        style={{
          borderWidth: 1,
          borderColor: isDark ? 'rgba(76, 29, 149, 0.4)' : 'rgba(168, 85, 247, 0.2)',
          shadowColor: '#A855F7',
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 16,
        }}
      >
        <Header
          title="Settings"
          leftIcon={<Text className={`text-2xl ${isDark ? 'text-ink-light' : 'text-ink'}`}>←</Text>}
          onLeftPress={onBack}
          variant="transparent"
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Appearance Section */}
        <View 
          className={`mb-4 rounded-2xl p-5 ${isDark ? 'bg-surface-dark/70' : 'bg-surface-light/90'}`}
          style={{
            borderWidth: 1,
            borderColor: isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
          }}
        >
          <Text className={`text-xs font-black uppercase tracking-[3px] mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Appearance
          </Text>
          
          <ListItem
            icon="🎨"
            title="Theme"
            subtitle={`Current: ${getThemeLabel()}`}
            onPress={cycleTheme}
            rightContent={
              <TouchableOpacity 
                onPress={cycleTheme}
                className={`px-4 py-2 rounded-xl ${isDark ? 'bg-primary/20' : 'bg-primary-muted'}`}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
                }}
              >
                <Text className={`font-black text-sm ${isDark ? 'text-primary-light' : 'text-primary-dark'}`}>
                  {getThemeLabel()}
                </Text>
              </TouchableOpacity>
            }
            showBorder={false}
          />
        </View>

        {/* Game Settings Section */}
        <View 
          className={`mb-4 rounded-2xl p-5 ${isDark ? 'bg-surface-dark/70' : 'bg-surface-light/90'}`}
          style={{
            borderWidth: 1,
            borderColor: isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
          }}
        >
          <Text className={`text-xs font-black uppercase tracking-[3px] mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Game
          </Text>
          
          <ListItem
            icon="🔊"
            title="Sound Effects"
            subtitle="Audio feedback"
            rightContent={
              <Switch
                value={settings.soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: isDark ? '#4C1D95' : '#DDD6FE', true: '#22D3EE' }}
                thumbColor="#fff"
              />
            }
          />

          <ListItem
            icon="📳"
            title="Vibration"
            subtitle="Haptic feedback"
            rightContent={
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: isDark ? '#4C1D95' : '#DDD6FE', true: '#22D3EE' }}
                thumbColor="#fff"
              />
            }
            showBorder={false}
          />
        </View>

        {/* Controls Section */}
        <View 
          className={`mb-4 rounded-2xl p-5 ${isDark ? 'bg-surface-dark/70' : 'bg-surface-light/90'}`}
          style={{
            borderWidth: 1,
            borderColor: isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
          }}
        >
          <Text className={`text-xs font-black uppercase tracking-[3px] mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Controls
          </Text>
          
          <ListItem
            icon="📱"
            title="Tilt Sensitivity"
            subtitle={`Speed: ${settings.sensitivity.toFixed(1)}x`}
            rightContent={
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  onPress={() => adjustSensitivity(-0.1)}
                  style={{
                    backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <Text className="text-primary font-black text-lg">−</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  onPress={() => adjustSensitivity(0.1)}
                  style={{
                    backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <Text className="text-primary font-black text-lg">+</Text>
                </TouchableOpacity>
              </View>
            }
            showBorder={false}
          />

          {/* Sensitivity Bar */}
          <View className="mt-4 pt-4">
            <View 
              className="h-3 rounded-full overflow-hidden"
              style={{
                backgroundColor: isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
              }}
            >
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full rounded-full"
                style={{ width: `${((settings.sensitivity - 0.3) / 2.7) * 100}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className={`text-xs font-bold ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>Slow</Text>
              <Text className={`text-xs font-bold ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>Fast</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View 
          className={`mb-4 rounded-2xl p-5 ${isDark ? 'bg-surface-dark/70' : 'bg-surface-light/90'}`}
          style={{
            borderWidth: 1,
            borderColor: isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
          }}
        >
          <Text className={`text-xs font-black uppercase tracking-[3px] mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Account
          </Text>
          
          {!isGuest && (
            <>
              <ListItem
                icon="🗑️"
                title="Reset Best Time"
                subtitle="Clear your record"
                onPress={handleResetBestTime}
              />

              <ListItem
                icon="🚪"
                title="Sign Out"
                subtitle="Log out of account"
                onPress={handleSignOut}
                showBorder={false}
              />
            </>
          )}

          {isGuest && (
            <View 
              className={`flex-row items-center p-4 rounded-2xl ${
                isDark ? 'bg-warning/15' : 'bg-warning/10'
              }`}
              style={{
                borderWidth: 1,
                borderColor: isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.2)',
              }}
            >
              <Text className="text-lg mr-3">ℹ️</Text>
              <Text className={`flex-1 text-sm font-medium leading-5 ${isDark ? 'text-warning' : 'text-warning'}`}>
                Sign in to save scores
              </Text>
            </View>
          )}
        </View>

        {/* App Info */}
        <View className="items-center py-6">
          <Text className={`text-sm font-black tracking-wide ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            Tilt Maze v{APP_VERSION}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="w-4 h-[1px] bg-primary/30 mr-2" />
            <Text className={`text-xs font-medium ${isDark ? 'text-ink-muted-light/60' : 'text-ink-muted/60'}`}>
              Tilt · Navigate · Win
            </Text>
            <View className="w-4 h-[1px] bg-primary/30 ml-2" />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
