import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
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

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  sensitivity: TILT_CONTROLS.SENSITIVITY,
};

export default function SettingsScreen({ onBack, isGuest, onLogout }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [settings]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
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
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
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
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
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
          <Text style={styles.appInfoText}>Tilt Maze v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Tilt left/right only • Gravity pulls down</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  sensitivityBar: {
    marginTop: 16,
    paddingTop: 12,
  },
  sensitivityTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sensitivityFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  sensitivityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sensitivityLabelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  destructiveButton: {
    borderBottomWidth: 0,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonInfo: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  destructiveText: {
    color: '#DC2626',
  },
  actionButtonHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  guestInfoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  guestInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
});
