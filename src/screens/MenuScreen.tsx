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
        <View className="items-center justify-center mt-2 mb-4">
          {/* Compact Logo */}
          <View className="relative w-20 h-20 mb-4">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-2xl"
              style={{ 
                transform: [{ rotate: '6deg' }],
                opacity: 0.9,
              }}
            />
            <View 
              className={`absolute inset-0 rounded-2xl items-center justify-center ${
                isDark ? 'bg-surface-dark' : 'bg-surface-light'
              }`}
              style={{
                shadowColor: '#A855F7',
                shadowOpacity: isDark ? 0.4 : 0.25,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
              }}
            >
              <Text className="text-4xl">🎮</Text>
            </View>
          </View>

          {/* Title */}
          <View className="items-center">
            <View className="flex-row items-center">
              <Text 
                className={`text-3xl font-black tracking-tighter ${isDark ? 'text-ink-light' : 'text-ink'}`}
                style={{
                  textShadowColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                }}
              >
                TILT
              </Text>
              <Text className="text-3xl font-black tracking-tighter text-primary ml-2">MAZE</Text>
            </View>
             
            {/* Welcome */}
            <View className="mt-4 items-center">
              <Text className={`text-xs font-black uppercase tracking-[4px] mb-2 ${
                isDark ? 'text-ink-muted-light' : 'text-ink-muted'
              }`}>
                Welcome back
              </Text>
              <Text 
                className={`text-2xl font-black tracking-tight ${isDark ? 'text-ink-light' : 'text-ink'}`}
                style={{
                  textShadowColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
                }}
              >
                {getUserDisplayName()}
              </Text>
              
              {isGuest && (
                <View className="mt-3">
                  <Badge variant="warning" icon="⚠️" text="Guest Mode" />
                </View>
              )}
            </View>
          </View>

          {/* Nickname Section */}
          {!isGuest && user && (
            <View className="mt-4 w-full max-w-[280px]">
              {editingNickname ? (
                <Card variant="default" className="flex-row items-center p-3">
                  <TextInput
                    className={`flex-1 text-sm py-1 font-medium ${isDark ? 'text-ink-light' : 'text-ink'}`}
                    placeholder="Enter nickname"
                    value={nickname}
                    onChangeText={setNickname}
                    maxLength={20}
                    placeholderTextColor={isDark ? '#A78BFA' : '#9CA3AF'}
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={saveNickname}
                      className="w-9 h-9 items-center justify-center bg-primary/20 rounded-xl"
                    >
                      <Text className="text-primary font-black">{BUTTON_ICONS.SAVE}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setNickname(savedNickname);
                        setEditingNickname(false);
                      }}
                      className={`w-9 h-9 items-center justify-center rounded-xl ${
                        isDark ? 'bg-surface-muted-dark' : 'bg-surface-muted'
                      }`}
                    >
                      <Text className={isDark ? 'text-ink-muted-light' : 'text-ink-muted'}>{BUTTON_ICONS.CANCEL}</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <TouchableOpacity 
                  className="flex-row items-center justify-center py-2 px-4 rounded-full bg-primary/10"
                  onPress={() => setEditingNickname(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <Text className="text-primary text-sm mr-2">✏️</Text>
                  <Text className="text-primary text-xs font-black uppercase tracking-[2px]">
                    {savedNickname ? 'Edit Nickname' : 'Set Nickname'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4 mb-8">
          <Button
            variant="secondary"
            size="xl"
            onPress={() => onNavigate('Game')}
            icon={<Text className="text-white text-3xl">▶</Text>}
          >
            PLAY
          </Button>

          <View className="flex-row gap-3 mt-2">
            <View className="flex-1">
              <Button
                variant="outline"
                size="md"
                onPress={() => onNavigate('Highscores')}
                icon={<Text className="text-2xl">🏆</Text>}
              >
                Scores
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="outline"
                size="md"
                onPress={() => onNavigate('Settings')}
                icon={<Text className="text-2xl">⚙️</Text>}
              >
                Settings
              </Button>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogout}
            className="py-4 items-center"
          >
            <Text className={`text-sm font-black uppercase tracking-[3px] ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              {isGuest ? '← Back' : 'Logout →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="pb-3">
          <View className="flex-row items-center justify-center">
            <View className="w-6 h-[1px] bg-primary/30 mr-3" />
            <Text className={`text-center text-xs font-black uppercase tracking-[2px] ${
              isDark ? 'text-ink-muted-light/60' : 'text-ink-muted/60'
            }`}>
              Tilt · Navigate · Win
            </Text>
            <View className="w-6 h-[1px] bg-primary/30 ml-3" />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

