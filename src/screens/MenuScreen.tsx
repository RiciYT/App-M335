import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, type User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { Screen } from '../types';

const { width } = Dimensions.get('window');

// UI Constants
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
      <View className="absolute -top-[10%] -left-[15%] w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <View className="absolute top-[20%] -right-[20%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
      <View className="absolute -bottom-[15%] -right-[10%] w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 py-8 justify-between">
          
          {/* Header Section */}
          <View className="items-center justify-center mt-4 mb-8">
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
               
              <View className="mt-6 items-center">
                <Text className="text-ink-muted text-xs font-bold uppercase tracking-[3px] mb-1">
                  Welcome back
                </Text>
                <Text className="text-ink text-2xl font-bold tracking-tight">
                  {getUserDisplayName()}
                </Text>
                
                {isGuest && (
                  <View className="mt-2 bg-secondary/15 border border-secondary/30 px-3 py-1 rounded-full flex-row items-center">
                    <Text className="text-secondary text-[10px] font-bold mr-1">⚠️</Text>
                    <Text className="text-secondary text-[10px] font-bold uppercase tracking-wider">
                      Guest Mode - Scores not saved
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Nickname Section - Only for logged-in users */}
            {!isGuest && user && (
              <View className="mt-6 w-full max-w-[280px]">
                {editingNickname ? (
                  <View className="flex-row items-center space-x-2 bg-surface-light border border-border rounded-xl px-3 py-2 shadow-sm">
                    <TextInput
                      className="flex-1 text-ink text-sm py-1"
                      placeholder="Enter nickname"
                      value={nickname}
                      onChangeText={setNickname}
                      maxLength={20}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="flex-row space-x-1">
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
                        className="w-8 h-8 items-center justify-center bg-surface-muted rounded-lg"
                      >
                        <Text className="text-ink-muted">{BUTTON_ICONS.CANCEL}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
          <View className="w-full space-y-6 mb-12">
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => onNavigate('Game')}
              className="w-full"
            >
              <LinearGradient
                colors={['#F59C7A', '#F07D62']}
                className="w-full h-16 rounded-[28px] flex-row items-center justify-center shadow-lg shadow-secondary/40"
              >
                <Text className="text-white mr-2 text-2xl">▶</Text>
                <Text className="text-white font-bold text-lg tracking-wide uppercase">Play Game</Text>
              </LinearGradient>
            </TouchableOpacity>
 
            <View className="flex-row space-x-5 mt-3">
              <TouchableOpacity 
                className="flex-1 h-14 bg-surface-light border border-border rounded-[24px] flex-row items-center justify-center shadow-sm"
                onPress={() => onNavigate('Highscores')}
                activeOpacity={0.7}
              >
                <Text className="mr-2 text-xl">🏆</Text>
                <Text className="text-ink font-semibold">Highscores</Text>
              </TouchableOpacity>
 
              <TouchableOpacity 
                className="flex-1 h-14 bg-surface-light border border-border rounded-[24px] flex-row items-center justify-center shadow-sm"
                onPress={() => onNavigate('Settings')}
                activeOpacity={0.7}
              >
                <Text className="mr-2 text-xl">⚙️</Text>
                <Text className="text-ink font-semibold">Settings</Text>
              </TouchableOpacity>
            </View>
 
            <TouchableOpacity 
              className="w-full py-4 flex-row items-center justify-center"
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text className="text-ink-muted text-sm font-bold uppercase tracking-widest">
                {isGuest ? 'Back to Login' : 'Logout'}
              </Text>
              <Text className="ml-2 text-ink-muted">{isGuest ? '←' : '🚪'}</Text>
            </TouchableOpacity>
          </View>
 
          {/* Footer */}
          <View className="pb-6">
            <Text className="text-center text-xs text-ink-muted font-bold uppercase tracking-[3px]">
              Tilt left/right to control the ball
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

