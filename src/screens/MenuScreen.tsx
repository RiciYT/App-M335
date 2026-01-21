import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { signOut, type User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { Screen } from '../types';
import { Button, ScreenContainer, Badge, Card } from '../components/ui';
import { useTheme } from '../theme';

const BUTTON_ICONS = {
  SAVE: '✓',
  CANCEL: '✕',
} as const;

interface MenuScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  isGuest: boolean;
  user: User | null;
}

export default function MenuScreen({ onNavigate, onLogout, isGuest, user }: MenuScreenProps) {
  const { isDark } = useTheme();
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to save nickname: ' + message);
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
    <ScreenContainer>
      <View className="flex-1 px-6 py-6 justify-between">
        {/* Header Section */}
        <View className="items-center justify-center mt-2 mb-6">
          {/* Logo */}
          <View className="relative w-24 h-24 mb-5">
            <LinearGradient
              colors={['#2EC4C6', '#7FB5FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-2xl opacity-90"
              style={{ transform: [{ rotate: '6deg' }] }}
            />
            <View className={`absolute inset-0 rounded-2xl items-center justify-center border shadow-xl ${
              isDark ? 'bg-surface-dark border-border-dark' : 'bg-surface-light border-border'
            }`}>
              <Text className="text-5xl">🎮</Text>
            </View>
            <View className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full border-2 border-white shadow-sm" />
          </View>

          {/* Title */}
          <View className="items-center">
            <Text 
              className={`text-4xl font-black tracking-tighter ${isDark ? 'text-ink-light' : 'text-ink'}`}
              style={{
                textShadowColor: 'rgba(46, 196, 198, 0.35)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}
            >
              TILT <Text className="text-primary">MAZE</Text>
            </Text>
             
            {/* Welcome */}
            <View className="mt-5 items-center">
              <Text className={`text-xs font-bold uppercase tracking-[3px] mb-1 ${
                isDark ? 'text-ink-muted-light' : 'text-ink-muted'
              }`}>
                Welcome back
              </Text>
              <Text className={`text-2xl font-bold tracking-tight ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                {getUserDisplayName()}
              </Text>
              
              {isGuest && (
                <View className="mt-3">
                  <Badge variant="warning" icon="⚠️" text="Guest Mode - Scores not saved" />
                </View>
              )}
            </View>
          </View>

          {/* Nickname Section */}
          {!isGuest && user && (
            <View className="mt-5 w-full max-w-[280px]">
              {editingNickname ? (
                <Card variant="default" className="flex-row items-center p-3">
                  <TextInput
                    className={`flex-1 text-sm py-1 ${isDark ? 'text-ink-light' : 'text-ink'}`}
                    placeholder="Enter nickname"
                    value={nickname}
                    onChangeText={setNickname}
                    maxLength={20}
                    placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                  />
                  <View className="flex-row gap-1">
                    <TouchableOpacity 
                      onPress={saveNickname}
                      className="w-8 h-8 items-center justify-center bg-primary/10 rounded-lg"
                    >
                      <Text className="text-primary font-bold">{BUTTON_ICONS.SAVE}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setNickname(savedNickname);
                        setEditingNickname(false);
                      }}
                      className={`w-8 h-8 items-center justify-center rounded-lg ${
                        isDark ? 'bg-surface-muted-dark' : 'bg-surface-muted'
                      }`}
                    >
                      <Text className={isDark ? 'text-ink-muted-light' : 'text-ink-muted'}>{BUTTON_ICONS.CANCEL}</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <TouchableOpacity 
                  className="flex-row items-center justify-center py-2"
                  onPress={() => setEditingNickname(true)}
                >
                  <Text className="text-primary text-xs mr-2">✏️</Text>
                  <Text className="text-primary text-xs font-semibold uppercase tracking-widest">
                    {savedNickname ? 'Edit Nickname' : 'Set Nickname'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-5 mb-10">
          <Button
            variant="secondary"
            size="lg"
            onPress={() => onNavigate('Game')}
            icon={<Text className="text-white text-2xl">▶</Text>}
          >
            PLAY GAME
          </Button>

          <View className="flex-row gap-4 mt-2">
            <View className="flex-1">
              <Button
                variant="outline"
                size="md"
                onPress={() => onNavigate('Highscores')}
                icon={<Text className="text-xl">🏆</Text>}
              >
                Highscores
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="outline"
                size="md"
                onPress={() => onNavigate('Settings')}
                icon={<Text className="text-xl">⚙️</Text>}
              >
                Settings
              </Button>
            </View>
          </View>

          <Button
            variant="ghost"
            size="sm"
            onPress={handleLogout}
          >
            <Text className={`text-sm font-bold uppercase tracking-widest ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              {isGuest ? 'Back to Login ←' : 'Logout 🚪'}
            </Text>
          </Button>
        </View>

        {/* Footer */}
        <View className="pb-4">
          <Text className={`text-center text-xs font-bold uppercase tracking-[3px] ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Tilt left/right to control the ball
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

