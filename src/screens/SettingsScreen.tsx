import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { TILT_CONTROLS, clamp, roundToDecimals } from '../config/tiltControls';

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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    return () => {
      // Clean up timeout on unmount
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Debounced save settings whenever they change (after initial load)
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }
    
    // Debounce saves to avoid excessive AsyncStorage writes
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Game Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingHint}>Play sounds during gameplay</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#E3E8F0', true: '#56D1B7' }}
              thumbColor="#fff"
            />
          </View>
 
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingHint}>Haptic feedback on collisions</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={toggleVibration}
              trackColor={{ false: '#E3E8F0', true: '#56D1B7' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Controls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Tilt Sensitivity</Text>
              <Text style={styles.settingHint}>Left/right movement speed: {settings.sensitivity.toFixed(1)}x</Text>
            </View>
            <View style={styles.adjustButtons}>
              <TouchableOpacity 
                style={styles.adjustButton} 
                onPress={() => adjustSensitivity(-0.1)}
              >
                <Text style={styles.adjustButtonText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adjustButton} 
                onPress={() => adjustSensitivity(0.1)}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sensitivityBar}>
            <View style={styles.sensitivityTrack}>
              <View 
                style={[
                  styles.sensitivityFill, 
                  { width: `${((settings.sensitivity - 0.3) / 2.7) * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.sensitivityLabels}>
              <Text style={styles.sensitivityLabelText}>Slow</Text>
              <Text style={styles.sensitivityLabelText}>Fast</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {!isGuest && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleResetBestTime}
              disabled={loading}
            >
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={styles.actionButtonLabel}>Reset Best Time</Text>
                <Text style={styles.actionButtonHint}>Remove your highscore from leaderboard</Text>
              </View>
            </TouchableOpacity>
          )}

          {!isGuest && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.destructiveButton]}
              onPress={handleSignOut}
            >
              <Text style={styles.actionButtonIcon}>🚪</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={[styles.actionButtonLabel, styles.destructiveText]}>Sign Out</Text>
                <Text style={styles.actionButtonHint}>Log out of your account</Text>
              </View>
            </TouchableOpacity>
          )}

          {isGuest && (
            <View style={styles.guestInfo}>
              <Text style={styles.guestInfoIcon}>ℹ️</Text>
              <Text style={styles.guestInfoText}>
                Playing as guest. Sign in to save your scores!
              </Text>
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Tilt Maze v{APP_VERSION}</Text>
          <Text style={styles.appInfoSubtext}>Tilt left/right only • Gravity pulls down</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F0',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  backButtonText: {
    fontSize: 22,
    color: '#1F2937',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 20,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2EC4C6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  sensitivityBar: {
    marginTop: 20,
    paddingTop: 16,
  },
  sensitivityTrack: {
    height: 10,
    backgroundColor: '#E3E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  sensitivityFill: {
    height: '100%',
    backgroundColor: '#7FB5FF',
    borderRadius: 5,
  },
  sensitivityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sensitivityLabelText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F0',
  },
  destructiveButton: {
    borderBottomWidth: 0,
  },
  actionButtonIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  actionButtonInfo: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  destructiveText: {
    color: '#DC2626',
  },
  actionButtonHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF1E8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F4C7B4',
  },
  guestInfoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  guestInfoText: {
    flex: 1,
    fontSize: 15,
    color: '#B4533B',
    lineHeight: 22,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  appInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  appInfoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
  },
});
