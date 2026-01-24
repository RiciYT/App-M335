import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../config/firebase';
import { roundToDecimals } from '../config/tiltControls';
import { ScreenContainer } from '../components/ui';
import { AppSettings, SETTINGS_KEY, DEFAULT_SETTINGS } from '../types';
import { setMusicEnabled } from '../audio/music';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';


interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

// Custom Toggle Component
const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.8}
    style={{
      width: 56,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      paddingHorizontal: 4,
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: value ? NEON_CYAN : 'rgba(255, 255, 255, 0.2)',
        alignSelf: value ? 'flex-end' : 'flex-start',
        ...(value && {
          shadowColor: NEON_CYAN,
          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 10,
        }),
      }}
    />
  </TouchableOpacity>
);

// Settings Row Component
const SettingsRow = ({
  title,
  subtitle,
  rightContent,
}: {
  title: string;
  subtitle: string;
  rightContent: React.ReactNode;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    }}
  >
    <View style={{ flex: 1, marginRight: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'rgba(0, 242, 255, 0.4)',
          marginTop: 4,
        }}
      >
        {subtitle}
      </Text>
    </View>
    {rightContent}
  </View>
);

export default function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    setSettings(prev => {
      const newEnabled = !prev.soundEnabled;
      setMusicEnabled(newEnabled);
      return { ...prev, soundEnabled: newEnabled };
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }));
  }, []);

  const handleSensitivityChange = useCallback((value: number) => {
    setSettings(prev => ({
      ...prev,
      sensitivity: roundToDecimals(value, 1),
    }));
  }, []);

  const handleResetBestTime = () => {
    setShowResetConfirm(true);
  };

  const confirmResetBestTime = async () => {
    setShowResetConfirm(false);
    const user = auth.currentUser;
    if (user) {
      try {
        const scoreRef = ref(database, `scores/${user.uid}`);
        await remove(scoreRef);
      } catch (error) {
        Alert.alert('Error', 'Failed to reset best time.');
      }
    } else {
      Alert.alert('Info', 'No score to reset.');
    }
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

  const sensitivityPresets = [
    { label: 'Low', value: 0.6 },
    { label: 'Medium', value: 1.5 },
    { label: 'High', value: 2.4 },
  ];

  return (
    <ScreenContainer showGlowEffects={true} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: 0, paddingBottom: 40, paddingHorizontal: 32 }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 42,
              fontWeight: '900',
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: NEON_CYAN,
              textShadowColor: 'rgba(0, 242, 255, 0.8)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }}
          >
            Settings
          </Text>
          <View
            style={{
              width: 64,
              height: 4,
              backgroundColor: NEON_CYAN,
              alignSelf: 'center',
              marginTop: 16,
              borderRadius: 2,
              opacity: 0.5,
              shadowColor: NEON_CYAN,
              shadowOpacity: 0.8,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 10,
            }}
          />
        </View>

        {/* Settings List */}
        <View style={{ paddingHorizontal: 32, gap: 24 }}>
          {/* Sound Effects */}
          <SettingsRow
            title="Sound Effects"
            subtitle="Immersive Audio"
            rightContent={<Toggle value={settings.soundEnabled} onToggle={toggleSound} />}
          />

          {/* Haptic Feedback */}
          <SettingsRow
            title="Haptic Feedback"
            subtitle="Tactile Response"
            rightContent={<Toggle value={settings.vibrationEnabled} onToggle={toggleVibration} />}
          />

          {/* Sensitivity Presets */}
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  Sensitivity
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '500',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'rgba(0, 242, 255, 0.4)',
                    marginTop: 4,
                  }}
                >
                  Tilt Control Range
                </Text>
              </View>
            </View>

            {/* Preset Buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {sensitivityPresets.map(preset => {
                const isActive = settings.sensitivity === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => handleSensitivityChange(preset.value)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: isActive ? NEON_CYAN : 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: isActive ? NEON_CYAN : 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: isActive ? DEEP_NAVY : 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Account Section */}
          <View style={{ marginTop: 32, gap: 16 }}>
            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                marginBottom: 16,
              }}
            />

            {/* Reset Best Time */}
            <TouchableOpacity
              onPress={handleResetBestTime}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Reset Best Time
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '500',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'rgba(0, 242, 255, 0.3)',
                    marginTop: 4,
                  }}
                >
                  Clear Your Record
                </Text>
              </View>
              <Ionicons name="trash-outline" size={24} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity
              onPress={handleSignOut}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Sign Out
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '500',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'rgba(0, 242, 255, 0.3)',
                    marginTop: 4,
                  }}
                >
                  Log Out of Account
                </Text>
              </View>
              <Ionicons name="log-out-outline" size={24} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reset Best Time Modal */}
      <Modal
        visible={showResetConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetConfirm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(2, 6, 23, 0.75)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 18,
              backgroundColor: DEEP_NAVY,
              borderWidth: 1,
              borderColor: 'rgba(0, 242, 255, 0.25)',
              padding: 20,
              shadowColor: NEON_CYAN,
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 20,
            }}
          >
            <Text
              style={{
                color: NEON_CYAN,
                fontSize: 16,
                fontWeight: '900',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Reset Best Time
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 13,
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              Are you sure you want to reset your best time? This action cannot be undone.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowResetConfirm(false)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 12,
                    fontWeight: '700',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmResetBestTime}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: NEON_CYAN,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: DEEP_NAVY,
                    fontSize: 12,
                    fontWeight: '900',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Back Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 32,
          paddingBottom: 20,
          paddingTop: 8,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.9}
          style={{
            width: '100%',
            height: 64,
            backgroundColor: NEON_CYAN,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: NEON_CYAN,
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 30,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: DEEP_NAVY,
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

      </View>
    </ScreenContainer>
  );
}
