import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { ref, set, get } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { formatTime, Screen } from '../types';
import { ScreenContainer, Button, Card } from '../components/ui';
import { useTheme } from '../theme';

interface ResultScreenProps {
  time: number;
  onNavigate: (screen: Screen) => void;
  isGuest: boolean;
}

export default function ResultScreen({ time, onNavigate, isGuest }: ResultScreenProps) {
  const { isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      saveScore();
    }
  }, [isGuest]);

  const saveScore = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);

    try {
      const nicknameRef = ref(database, `users/${user.uid}/nickname`);
      const nicknameSnapshot = await get(nicknameRef);
      const nickname = nicknameSnapshot.exists() 
        ? nicknameSnapshot.val() 
        : user.isAnonymous 
          ? 'Anonymous' 
          : user.email || 'Player';

      const userScoreRef = ref(database, `scores/${user.uid}`);
      const snapshot = await get(userScoreRef);
      const existingData = snapshot.val();

      const newBest = !existingData || time < existingData.time;
      
      if (newBest) {
        await set(userScoreRef, {
          userId: user.uid,
          email: user.email || 'anonymous@user.com',
          nickname: nickname,
          time: time,
          timestamp: Date.now(),
        });
        setIsNewBest(true);
      }

      setSaved(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to save score: ' + message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="px-6 py-6" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          {/* Header with celebration */}
          <View className="items-center mt-6 mb-6">
            {/* Animated celebration icon with glow */}
            <View 
              className="w-28 h-28 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: isDark ? 'rgba(34, 211, 238, 0.15)' : 'rgba(34, 211, 238, 0.1)',
                shadowColor: '#22D3EE',
                shadowOpacity: 0.5,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 24,
              }}
            >
              <Text className="text-6xl">🎉</Text>
            </View>
            
            <Text 
              className={`text-4xl font-black tracking-tighter mb-2 ${isDark ? 'text-ink-light' : 'text-ink'}`}
              style={{
                textShadowColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}
            >
              Complete!
            </Text>
            <Text className={`font-medium ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
              Great run! 🏃‍♂️
            </Text>
          </View>
          
          {/* Time Display Card with neon styling */}
          <View 
            className={`mb-6 items-center py-8 rounded-3xl ${isDark ? 'bg-surface-dark/80' : 'bg-surface-light'}`}
            style={{ 
              borderWidth: 2,
              borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.25)',
              shadowColor: '#A855F7', 
              shadowOpacity: isDark ? 0.4 : 0.2, 
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 }
            }}
          >
            <Text className={`text-xs font-black uppercase tracking-[3px] mb-4 ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              Your Time
            </Text>
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">⏱</Text>
              <Text 
                className="text-5xl font-black text-primary" 
                style={{ 
                  letterSpacing: -2,
                  textShadowColor: isDark ? 'rgba(168, 85, 247, 0.5)' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 12,
                }}
              >
                {formatTime(time)}
              </Text>
            </View>
          </View>

          {/* Status Messages */}
          <View className="mb-6">
            {isGuest ? (
              <View 
                className={`flex-row items-center p-5 rounded-2xl ${isDark ? 'bg-warning/15' : 'bg-warning/10'}`}
                style={{
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(251, 146, 60, 0.4)' : 'rgba(251, 146, 60, 0.3)',
                }}
              >
                <Text className="text-3xl mr-4">⚠️</Text>
                <View className="flex-1">
                  <Text className="text-lg font-black text-warning mb-1">
                    Guest Mode
                  </Text>
                  <Text className="text-warning/80 font-medium">
                    Sign in to save scores
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {saving && (
                  <View 
                    className={`flex-row items-center justify-center p-5 rounded-2xl ${isDark ? 'bg-primary/15' : 'bg-primary/10'}`}
                    style={{
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
                    }}
                  >
                    <ActivityIndicator size="small" color="#A855F7" />
                    <Text className="ml-3 text-primary font-bold">Saving...</Text>
                  </View>
                )}

                {saved && isNewBest && (
                  <View 
                    className={`flex-row items-center p-5 rounded-2xl ${isDark ? 'bg-mint/15' : 'bg-mint/10'}`}
                    style={{
                      borderWidth: 2,
                      borderColor: '#22D3EE',
                      shadowColor: '#22D3EE',
                      shadowOpacity: 0.3,
                      shadowOffset: { width: 0, height: 0 },
                      shadowRadius: 16,
                    }}
                  >
                    <Text className="text-3xl mr-4">🏆</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-black text-mint mb-1">
                        New Record!
                      </Text>
                      <Text className="text-mint/80 font-medium">
                        Personal best achieved
                      </Text>
                    </View>
                  </View>
                )}

                {saved && !isNewBest && (
                  <View 
                    className={`flex-row items-center p-5 rounded-2xl ${isDark ? 'bg-secondary/15' : 'bg-secondary/10'}`}
                    style={{
                      borderWidth: 2,
                      borderColor: isDark ? 'rgba(244, 114, 182, 0.4)' : 'rgba(244, 114, 182, 0.3)',
                    }}
                  >
                    <Text className="text-3xl mr-4">💪</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-black text-secondary mb-1">
                        Nice Try!
                      </Text>
                      <Text className="text-secondary/80 font-medium">
                        Keep practicing
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View className="mt-auto gap-3 pb-4">
            <Button
              variant="secondary"
              size="lg"
              onPress={() => onNavigate('Game')}
              disabled={saving}
              icon={<Text className="text-white text-xl">🎮</Text>}
            >
              Play Again
            </Button>

            <Button
              variant="primary"
              size="lg"
              onPress={() => onNavigate('Highscores')}
              disabled={saving}
              icon={<Text className="text-white text-xl">🏆</Text>}
            >
              Leaderboard
            </Button>

            <Button
              variant="outline"
              size="md"
              onPress={() => onNavigate('Menu')}
              disabled={saving}
              icon={<Text className="text-lg">←</Text>}
            >
              Menu
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
