import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../config/firebase';

// UI Constants
const BUTTON_ICONS = {
  SAVE: '✓',
  CANCEL: '✕',
} as const;

interface MenuScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  isGuest: boolean;
  user: any;
}

export default function MenuScreen({ onNavigate, onLogout, isGuest, user }: MenuScreenProps) {
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [savedNickname, setSavedNickname] = useState('');

  useEffect(() => {
    if (user && !isGuest) {
      fetchNickname();
    }
  }, [user, isGuest]);

  const fetchNickname = async () => {
    if (!user) return;
    try {
      const nicknameRef = ref(database, `users/${user.uid}/nickname`);
      const snapshot = await get(nicknameRef);
      if (snapshot.exists()) {
        const nick = snapshot.val();
        setSavedNickname(nick);
        setNickname(nick);
      }
    } catch (error) {
      console.error('Error fetching nickname:', error);
    }
  };

  const saveNickname = async () => {
    if (!user || !nickname.trim()) {
      Alert.alert('Error', 'Please enter a valid nickname');
      return;
    }
    try {
      const nicknameRef = ref(database, `users/${user.uid}/nickname`);
      await set(nicknameRef, nickname.trim());
      setSavedNickname(nickname.trim());
      setEditingNickname(false);
      Alert.alert('Success', 'Nickname saved!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save nickname: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (!isGuest) {
        await signOut(auth);
      }
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (isGuest) return 'Guest';
    if (savedNickname) return savedNickname;
    if (user?.isAnonymous) return 'Anonymous User';
    return user?.email || 'Player';
  };

  return (
    <View style={styles.container}>
      {/* Header Section with modern card */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>🎯 Tilt Maze</Text>
        <Text style={styles.subtitle}>Guide the ball to the target!</Text>
        
        <View style={styles.userInfoCard}>
          <Text style={styles.welcomeLabel}>Welcome back</Text>
          <Text style={styles.welcomeText}>{getUserDisplayName()}</Text>
          {isGuest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeIcon}>⚠️</Text>
              <Text style={styles.guestBadgeText}>Guest Mode - Scores not saved</Text>
            </View>
          )}
        </View>

        {/* Nickname Section - Only for logged-in users */}
        {!isGuest && user && (
          <View style={styles.nicknameSection}>
            {editingNickname ? (
              <View style={styles.nicknameEdit}>
                <TextInput
                  style={styles.nicknameInput}
                  placeholder="Enter nickname"
                  value={nickname}
                  onChangeText={setNickname}
                  maxLength={20}
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.nicknameButtons}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveNickname}>
                    <Text style={styles.smallButtonText}>{BUTTON_ICONS.SAVE} Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => {
                      setNickname(savedNickname);
                      setEditingNickname(false);
                    }}
                  >
                    <Text style={styles.smallButtonText}>{BUTTON_ICONS.CANCEL} Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editNicknameButton} 
                onPress={() => setEditingNickname(true)}
              >
                <Text style={styles.editNicknameIcon}>✏️</Text>
                <Text style={styles.editNicknameText}>
                  {savedNickname ? 'Edit Nickname' : 'Set Nickname'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons with improved styling */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.playButton]} 
          onPress={() => onNavigate('Game')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🎮</Text>
          <Text style={styles.buttonText}>Play Game</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.highscoresButton]} 
          onPress={() => onNavigate('Highscores')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🏆</Text>
          <Text style={styles.buttonText}>Highscores</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.settingsButton]} 
          onPress={() => onNavigate('Settings')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>⚙️</Text>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>{isGuest ? '←' : '🚪'}</Text>
          <Text style={styles.buttonText}>
            {isGuest ? 'Back to Login' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  userInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 8,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  guestBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  guestBadgeText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  nicknameSection: {
    width: '100%',
  },
  nicknameEdit: {
    width: '100%',
  },
  nicknameInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    color: '#111827',
  },
  nicknameButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  editNicknameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  editNicknameIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  editNicknameText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    gap: 12,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  playButton: {
    backgroundColor: '#3B82F6',
  },
  highscoresButton: {
    backgroundColor: '#F59E0B',
  },
  settingsButton: {
    backgroundColor: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginTop: 8,
  },
});
