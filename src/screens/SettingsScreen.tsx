import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { TILT_CONTROLS, clamp, roundToDecimals } from '../config/tiltControls';
import { ScreenContainer, Header, Card, ListItem } from '../components/ui';
import { useTheme } from '../theme';

interface SettingsScreenProps {
  onBack: () => void;
  isGuest: boolean;
  onLogout: () => void;
}

interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  sensitivity: number;
}

const SETTINGS_KEY = '@tiltmaze_settings';
const APP_VERSION = '1.0.0';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  sensitivity: TILT_CONTROLS.SENSITIVITY,
};

export default function SettingsScreen({ onBack, isGuest, onLogout }: SettingsScreenProps) {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

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
                setLoading(true);
                const scoreRef = ref(database, `scores/${user.uid}`);
                await remove(scoreRef);
                Alert.alert('Success', 'Your best time has been reset.');
              } catch (error) {
                Alert.alert('Error', 'Failed to reset best time.');
              } finally {
                setLoading(false);
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
      case 'system': return '🔄 System';
    }
  };

  return (
    <ScreenContainer showGlowEffects={false}>
      {/* Header */}
      <View className={`${isDark ? 'bg-surface-dark border-b border-border-dark' : 'bg-surface-light border-b border-border'}`}>
        <Header
          title="Settings"
          leftIcon={<Text className={`text-2xl ${isDark ? 'text-ink-light' : 'text-ink'}`}>←</Text>}
          onLeftPress={onBack}
          variant="transparent"
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Appearance Section */}
        <Card variant="default" className="mb-5">
          <Text className={`text-sm font-bold uppercase tracking-wider mb-4 ${
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
                className={`px-4 py-2 rounded-full ${isDark ? 'bg-surface-muted-dark' : 'bg-surface-muted'}`}
              >
                <Text className={`font-semibold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                  {getThemeLabel()}
                </Text>
              </TouchableOpacity>
            }
            showBorder={false}
          />
        </Card>

        {/* Game Settings Section */}
        <Card variant="default" className="mb-5">
          <Text className={`text-sm font-bold uppercase tracking-wider mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Game
          </Text>
          
          <ListItem
            icon="🔊"
            title="Sound Effects"
            subtitle="Play sounds during gameplay"
            rightContent={
              <Switch
                value={settings.soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: isDark ? '#475569' : '#E3E8F0', true: '#56D1B7' }}
                thumbColor="#fff"
              />
            }
          />

          <ListItem
            icon="📳"
            title="Vibration"
            subtitle="Haptic feedback on collisions"
            rightContent={
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: isDark ? '#475569' : '#E3E8F0', true: '#56D1B7' }}
                thumbColor="#fff"
              />
            }
            showBorder={false}
          />
        </Card>

        {/* Controls Section */}
        <Card variant="default" className="mb-5">
          <Text className={`text-sm font-bold uppercase tracking-wider mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Controls
          </Text>
          
          <ListItem
            icon="📱"
            title="Tilt Sensitivity"
            subtitle={`Movement speed: ${settings.sensitivity.toFixed(1)}x`}
            rightContent={
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                  onPress={() => adjustSensitivity(-0.1)}
                >
                  <Text className="text-white font-bold text-lg">−</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                  onPress={() => adjustSensitivity(0.1)}
                >
                  <Text className="text-white font-bold text-lg">+</Text>
                </TouchableOpacity>
              </View>
            }
            showBorder={false}
          />

          {/* Sensitivity Bar */}
          <View className="mt-4 pt-4">
            <View className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-surface-muted-dark' : 'bg-surface-muted'}`}>
              <View 
                className="h-full rounded-full bg-accent"
                style={{ width: `${((settings.sensitivity - 0.3) / 2.7) * 100}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>Slow</Text>
              <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>Fast</Text>
            </View>
          </View>
        </Card>

        {/* Account Section */}
        <Card variant="default" className="mb-5">
          <Text className={`text-sm font-bold uppercase tracking-wider mb-4 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Account
          </Text>
          
          {!isGuest && (
            <>
              <ListItem
                icon="🗑️"
                title="Reset Best Time"
                subtitle="Remove your highscore from leaderboard"
                onPress={handleResetBestTime}
              />

              <ListItem
                icon="🚪"
                title="Sign Out"
                subtitle="Log out of your account"
                onPress={handleSignOut}
                showBorder={false}
              />
            </>
          )}

          {isGuest && (
            <View className={`flex-row items-center p-4 rounded-2xl ${
              isDark ? 'bg-secondary/20 border border-secondary/40' : 'bg-secondary/10 border border-secondary/30'
            }`}>
              <Text className="text-lg mr-3">ℹ️</Text>
              <Text className={`flex-1 text-sm leading-5 ${isDark ? 'text-secondary-light' : 'text-secondary-dark'}`}>
                Playing as guest. Sign in to save your scores!
              </Text>
            </View>
          )}
        </Card>

        {/* App Info */}
        <View className="items-center py-6">
          <Text className={`text-sm font-semibold ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            Tilt Maze v{APP_VERSION}
          </Text>
          <Text className={`text-xs mt-1 ${isDark ? 'text-ink-muted-light/60' : 'text-ink-muted/60'}`}>
            Tilt left/right only • Gravity pulls down
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
