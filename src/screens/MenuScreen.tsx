import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../config/firebase';

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
      <Text style={styles.title}>Tilt Maze</Text>
      <Text style={styles.subtitle}>Guide the ball to the target!</Text>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Welcome, {getUserDisplayName()}!</Text>
        {isGuest && (
          <Text style={styles.guestWarning}>
            ⚠️ Playing as guest - scores won't be saved
          </Text>
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
              />
              <View style={styles.nicknameButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={saveNickname}>
                  <Text style={styles.smallButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setNickname(savedNickname);
                    setEditingNickname(false);
                  }}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.editNicknameButton} 
              onPress={() => setEditingNickname(true)}
            >
              <Text style={styles.editNicknameText}>
                {savedNickname ? '✏️ Edit Nickname' : '✏️ Set Nickname'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => onNavigate('Game')}>
        <Text style={styles.buttonText}>🎮 Play Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => onNavigate('Highscores')}>
        <Text style={styles.buttonText}>🏆 Highscores</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.settingsMenuButton]} onPress={() => onNavigate('Settings')}>
        <Text style={styles.buttonText}>⚙️ Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>{isGuest ? '← Back to Login' : '🚪 Logout'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  guestWarning: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 5,
    textAlign: 'center',
  },
  nicknameSection: {
    width: '100%',
    marginBottom: 20,
  },
  nicknameEdit: {
    width: '100%',
  },
  nicknameInput: {
    width: '100%',
    height: 45,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  nicknameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8E8E93',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editNicknameButton: {
    padding: 10,
    alignItems: 'center',
  },
  editNicknameText: {
    color: '#007AFF',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingsMenuButton: {
    backgroundColor: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
