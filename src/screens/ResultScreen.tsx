import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { ref, set, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../config/firebase';
import { formatTime, Screen } from '../types';
import { ScreenContainer, NeonPrimaryButton, NeonSecondaryButton, NeonGhostButton, GlassCard } from '../components/ui';
import { useTheme } from '../theme';
import { tokens, createGlow } from '../theme/tokens';

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
  const [previousBest, setPreviousBest] = useState<number | null>(null);

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
      
      if (existingData && !newBest) {
        setPreviousBest(existingData.time);
      }
      
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
                ...createGlow('mint', 'strong'),
              }}
            >
              <Ionicons name="checkmark-circle" size={80} color="#22D3EE" />
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
          </View>
          
          {/* Time Display Card with neon styling */}
          <GlassCard 
            variant="elevated" 
            glowColor="primary"
            style={{ 
              marginBottom: tokens.spacing.lg,
              alignItems: 'center',
              paddingVertical: tokens.spacing['3xl'],
            }}
          >
            <Text className={`text-xs font-black uppercase tracking-[3px] mb-4 ${
              isDark ? 'text-ink-muted-light' : 'text-ink-muted'
            }`}>
              Your Time
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="stopwatch" size={32} color="#A855F7" style={{ marginRight: 12 }} />
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
          </GlassCard>

          {/* Status Messages */}
          <View className="mb-6">
            {isGuest ? (
              <GlassCard 
                variant="default"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(251, 146, 60, 0.4)' : 'rgba(251, 146, 60, 0.3)',
                }}
              >
                <Ionicons name="warning" size={32} color="#FB923C" style={{ marginRight: 16 }} />
                <View className="flex-1">
                  <Text className="text-lg font-black text-warning mb-1">
                    Guest Mode
                  </Text>
                  <Text className="text-warning/80 font-medium">
                    Sign in to save scores
                  </Text>
                </View>
              </GlassCard>
            ) : (
              <>
                {saving && (
                  <GlassCard 
                    variant="default"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ActivityIndicator size="small" color="#A855F7" />
                    <Text className="ml-3 text-primary font-bold">Saving...</Text>
                  </GlassCard>
                )}

                {saved && isNewBest && (
                  <GlassCard 
                    variant="neon"
                    glowColor="secondary"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'rgba(244, 114, 182, 0.15)' : 'rgba(244, 114, 182, 0.1)',
                      borderColor: '#F472B6',
                    }}
                  >
                    <Ionicons name="trophy" size={32} color="#F472B6" style={{ marginRight: 16 }} />
                    <View className="flex-1">
                      <Text className="text-lg font-black text-secondary mb-1">
                        NEW BEST!
                      </Text>
                      <Text className="text-secondary/80 font-medium">
                        Personal record achieved
                      </Text>
                    </View>
                  </GlassCard>
                )}

                {saved && !isNewBest && previousBest && (
                  <GlassCard 
                    variant="default"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
                      borderWidth: 2,
                      borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    <Ionicons name="trending-up" size={32} color="#A855F7" style={{ marginRight: 16 }} />
                    <View className="flex-1">
                      <Text className="text-lg font-black text-primary mb-1">
                        Keep Trying!
                      </Text>
                      <Text className="text-primary/80 font-medium">
                        Beat your best: {formatTime(previousBest)}
                      </Text>
                    </View>
                  </GlassCard>
                )}
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View className="mt-auto gap-3 pb-4">
            <NeonPrimaryButton
              size="lg"
              onPress={() => onNavigate('Game')}
              disabled={saving}
              icon="refresh"
            >
              Play Again
            </NeonPrimaryButton>

            <NeonSecondaryButton
              size="lg"
              onPress={() => onNavigate('Highscores')}
              disabled={saving}
              icon="trophy"
            >
              Leaderboard
            </NeonSecondaryButton>

            <NeonGhostButton
              size="md"
              onPress={() => onNavigate('Menu')}
              disabled={saving}
              icon="home"
              fullWidth={true}
            >
              Menu
            </NeonGhostButton>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
