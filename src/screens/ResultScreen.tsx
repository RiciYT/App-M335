import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { ref, set, get } from 'firebase/database';
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
      <View className="flex-1 px-6 py-8">
        {/* Header with celebration */}
        <View className="items-center mt-8 mb-8">
          <Text className="text-7xl mb-4">🎉</Text>
          <Text className={`text-3xl font-black mb-2 ${isDark ? 'text-ink-light' : 'text-ink'}`}>
            Game Complete!
          </Text>
          <Text className={isDark ? 'text-ink-muted-light' : 'text-ink-muted'}>
            Well done!
          </Text>
        </View>
        
        {/* Time Display Card */}
        <Card 
          variant="elevated" 
          className="mb-6 items-center py-8"
          style={{ 
            shadowColor: '#2EC4C6', 
            shadowOpacity: 0.2, 
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 }
          }}
        >
          <Text className={`text-sm font-bold uppercase tracking-widest mb-3 ${
            isDark ? 'text-ink-muted-light' : 'text-ink-muted'
          }`}>
            Your Time
          </Text>
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">⏱</Text>
            <Text className="text-5xl font-black text-primary" style={{ letterSpacing: -2 }}>
              {formatTime(time)}
            </Text>
          </View>
        </Card>

        {/* Status Messages */}
        <View className="mb-8">
          {isGuest ? (
            <Card variant="default" className="flex-row items-center border-2 border-secondary/40 bg-secondary/10">
              <Text className="text-4xl mr-4">⚠️</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-secondary-dark mb-1">
                  Playing as Guest
                </Text>
                <Text className="text-secondary-dark font-medium">
                  Log in to save your highscores!
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {saving && (
                <Card variant="default" className="flex-row items-center justify-center bg-primary/10">
                  <ActivityIndicator size="small" color="#2EC4C6" />
                  <Text className="ml-3 text-primary font-semibold">Saving score...</Text>
                </Card>
              )}

              {saved && isNewBest && (
                <Card variant="default" className="flex-row items-center border-2 border-mint bg-mint/10">
                  <Text className="text-4xl mr-4">🏆</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-mint-dark mb-1">
                      New Personal Best!
                    </Text>
                    <Text className="text-mint-dark font-medium">
                      You've set a new record!
                    </Text>
                  </View>
                </Card>
              )}

              {saved && !isNewBest && (
                <Card variant="default" className="flex-row items-center border-2 border-accent bg-accent/10">
                  <Text className="text-4xl mr-4">💪</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-accent-dark mb-1">
                      Good Try!
                    </Text>
                    <Text className="text-accent-dark font-medium">
                      Keep practicing to beat your best!
                    </Text>
                  </View>
                </Card>
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-1 justify-end space-y-4">
          <Button
            variant="primary"
            size="lg"
            onPress={() => onNavigate('Game')}
            disabled={saving}
            icon={<Text className="text-white text-xl">🎮</Text>}
          >
            Play Again
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onPress={() => onNavigate('Highscores')}
            disabled={saving}
            icon={<Text className="text-white text-xl">🏆</Text>}
          >
            View Highscores
          </Button>

          <Button
            variant="outline"
            size="md"
            onPress={() => onNavigate('Menu')}
            disabled={saving}
            icon={<Text className="text-lg">←</Text>}
          >
            Back to Menu
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
