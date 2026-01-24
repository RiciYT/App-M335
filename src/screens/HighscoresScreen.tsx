import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { ref, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { database, auth } from '../config/firebase';
import { formatTime, GameScore } from '../types';
import { ScreenContainer } from '../components/ui';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

interface HighscoresScreenProps {
  onBack: () => void;
}

export default function HighscoresScreen({ onBack }: HighscoresScreenProps) {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    fetchHighscores();
  }, []);

  const fetchHighscores = async () => {
    try {
      const scoresRef = ref(database, 'scores');
      const snapshot = await get(scoresRef);
      
      if (snapshot.exists()) {
        const scoresData = snapshot.val();
        const scoresArray: GameScore[] = Object.values(scoresData);
        scoresArray.sort((a, b) => a.time - b.time);
        setScores(scoresArray.slice(0, 10));
      } else {
        setScores([]);
      }
    } catch (error) {
      console.error('Error fetching highscores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (score: GameScore) => {
    return score.nickname || score.email?.split('@')[0] || 'Anonymous';
  };

  // Podium component for top 3
  const Podium = () => {
    const top3 = scores.slice(0, 3);
    const rank1 = top3[0];
    const rank2 = top3[1];
    const rank3 = top3[2];

    const PodiumCard = ({
      score,
      rank,
      height
    }: {
      score?: GameScore;
      rank: number;
      height: number;
    }) => {
      if (!score) {
        return (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                height,
                width: '100%',
                borderRadius: 12,
                backgroundColor: 'rgba(0, 242, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(0, 242, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
              }}
            >
              <Text style={{ color: 'rgba(0, 242, 255, 0.3)', fontSize: 12, fontWeight: '900' }}>
                RANK {rank}
              </Text>
              <Text style={{ color: 'rgba(0, 242, 255, 0.2)', fontSize: 10, marginTop: 4 }}>
                —
              </Text>
            </View>
          </View>
        );
      }

      const isFirst = rank === 1;
      const isCurrentUser = score.userId === currentUserId;

      return (
        <View style={{ flex: 1, alignItems: 'center' }}>
          {isFirst && (
            <View style={{ marginBottom: 8 }}>
              <Ionicons name="trophy" size={28} color={NEON_CYAN} style={{
                textShadowColor: 'rgba(0, 242, 255, 0.8)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }} />
            </View>
          )}
          <View
            style={{
              height,
              width: '100%',
              borderRadius: 12,
              backgroundColor: isFirst
                ? 'rgba(0, 242, 255, 0.15)'
                : 'rgba(0, 242, 255, 0.08)',
              borderWidth: isFirst ? 2 : 1,
              borderBottomWidth: isFirst ? 4 : 2,
              borderColor: isFirst
                ? 'rgba(0, 242, 255, 0.4)'
                : 'rgba(0, 242, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              ...(isFirst && {
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 15,
              }),
            }}
          >
            <Text style={{
              color: isFirst ? NEON_CYAN : 'rgba(0, 242, 255, 0.6)',
              fontSize: isFirst ? 14 : 11,
              fontWeight: '900',
              marginBottom: 4,
              textShadowColor: isFirst ? 'rgba(0, 242, 255, 0.5)' : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isFirst ? 8 : 0,
            }}>
              RANK {rank}
            </Text>
            <Text
              style={{
                color: isFirst ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                fontSize: isFirst ? 13 : 11,
                fontWeight: isFirst ? '900' : '700',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {getDisplayName(score)}
            </Text>
            {isCurrentUser && (
              <View style={{
                backgroundColor: NEON_CYAN,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                marginBottom: 6,
              }}>
                <Text style={{ color: DEEP_NAVY, fontSize: 8, fontWeight: '900' }}>YOU</Text>
              </View>
            )}
            <View style={{
              height: 1,
              width: isFirst ? 48 : 32,
              backgroundColor: isFirst ? 'rgba(0, 242, 255, 0.4)' : 'rgba(0, 242, 255, 0.2)',
              marginBottom: 8
            }} />
            <Text style={{
              color: isFirst ? NEON_CYAN : 'rgba(0, 242, 255, 0.7)',
              fontSize: isFirst ? 16 : 13,
              fontWeight: '700',
              letterSpacing: 2,
              textShadowColor: isFirst ? 'rgba(0, 242, 255, 0.5)' : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isFirst ? 8 : 0,
            }}>
              {formatTime(score.time)}
            </Text>
          </View>
        </View>
      );
    };

    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}>
        {/* Rank 2 - Left */}
        <PodiumCard score={rank2} rank={2} height={130} />

        {/* Rank 1 - Center (taller) */}
        <View style={{ flex: 1, marginTop: -24 }}>
          <PodiumCard score={rank1} rank={1} height={160} />
        </View>

        {/* Rank 3 - Right */}
        <PodiumCard score={rank3} rank={3} height={110} />
      </View>
    );
  };

  // Remaining scores (4-10)
  const RemainingScores = () => {
    const remaining = scores.slice(3);

    if (remaining.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {remaining.map((score, index) => {
          const rank = index + 4;
          const isCurrentUser = score.userId === currentUserId;

          return (
            <View
              key={score.userId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isCurrentUser
                  ? 'rgba(0, 242, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.03)',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                borderWidth: isCurrentUser ? 2 : 1,
                borderColor: isCurrentUser
                  ? 'rgba(0, 242, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.08)',
                marginBottom: 12,
                ...(isCurrentUser && {
                  shadowColor: NEON_CYAN,
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 10,
                }),
              }}
            >
              {/* Rank number */}
              <Text style={{
                width: 32,
                fontSize: 18,
                fontWeight: '900',
                fontStyle: 'italic',
                color: isCurrentUser ? NEON_CYAN : 'rgba(255, 255, 255, 0.2)',
              }}>
                {String(rank).padStart(2, '0')}
              </Text>

              {/* Player name */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: isCurrentUser ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  }}
                  numberOfLines={1}
                >
                  {getDisplayName(score)}
                </Text>
                {isCurrentUser && (
                  <View style={{
                    backgroundColor: NEON_CYAN,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                    <Text style={{ color: DEEP_NAVY, fontSize: 8, fontWeight: '900' }}>YOU</Text>
                  </View>
                )}
              </View>

              {/* Time */}
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 2,
                color: isCurrentUser ? NEON_CYAN : 'rgba(255, 255, 255, 0.5)',
                ...(isCurrentUser && {
                  textShadowColor: 'rgba(0, 242, 255, 0.5)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                }),
              }}>
                {formatTime(score.time)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Empty state
  const EmptyState = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Ionicons name="trophy-outline" size={64} color="rgba(0, 242, 255, 0.3)" />
      <Text style={{
        fontSize: 20,
        fontWeight: '700',
        color: 'rgba(0, 242, 255, 0.6)',
        marginTop: 16,
        textAlign: 'center',
      }}>
        No scores yet
      </Text>
      <Text style={{
        fontSize: 14,
        color: 'rgba(0, 242, 255, 0.4)',
        marginTop: 8,
        textAlign: 'center',
      }}>
        Be the first to complete the maze!
      </Text>
    </View>
  );

  return (
    <ScreenContainer showGlowEffects={true} showGrid={false} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingTop: 0, paddingBottom: 24, paddingHorizontal: 24 }}>
        <Text style={{
          textAlign: 'center',
          fontSize: 28,
          fontWeight: '700',
          color: NEON_CYAN,
          letterSpacing: 8,
          textTransform: 'uppercase',
          textShadowColor: 'rgba(0, 242, 255, 0.8)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
        }}>
          Leaderboard
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 242, 255, 0.15)',
            }}
          >
            <ActivityIndicator size="large" color={NEON_CYAN} />
          </View>
          <Text style={{ marginTop: 16, fontWeight: '700', color: 'rgba(0, 242, 255, 0.6)' }}>
            Loading...
          </Text>
        </View>
      ) : scores.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <Podium />
          <RemainingScores />
        </ScrollView>
      )}

      {/* Back Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 32,
          paddingBottom: 20,
          paddingTop: 8,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.9}
          style={{
            width: '100%',
            height: 64,
            backgroundColor: NEON_CYAN,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: NEON_CYAN,
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 30,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: DEEP_NAVY,
            }}
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
