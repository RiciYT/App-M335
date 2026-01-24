import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ref, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../config/firebase';
import { formatTime, GameScore } from '../types';
import { ScreenContainer, Header, GlassCard } from '../components/ui';
import { useTheme } from '../theme';
import { tokens } from '../theme/tokens';

const MEDALS = {
  FIRST: 'medal',
  SECOND: 'medal-outline',
  THIRD: 'ribbon',
} as const;

interface HighscoresScreenProps {
  onBack: () => void;
}

export default function HighscoresScreen({ onBack }: HighscoresScreenProps) {
  const { isDark } = useTheme();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Always show 10 rows - pad with placeholders
        const topScores = scoresArray.slice(0, 10);
        const paddedScores = [...topScores];
        while (paddedScores.length < 10) {
          paddedScores.push({
            userId: `placeholder-${paddedScores.length}`,
            email: 'placeholder',
            nickname: null,
            time: 0,
            timestamp: 0,
          });
        }
        setScores(paddedScores);
      } else {
        // No scores yet - show 10 placeholders
        const placeholders: GameScore[] = [];
        for (let i = 0; i < 10; i++) {
          placeholders.push({
            userId: `placeholder-${i}`,
            email: 'placeholder',
            nickname: null,
            time: 0,
            timestamp: 0,
          });
        }
        setScores(placeholders);
      }
    } catch (error) {
      console.error('Error fetching highscores:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderScore = ({ item, index }: { item: GameScore; index: number }) => {
    const isPlaceholder = item.email === 'placeholder';
    const displayName = isPlaceholder ? '—' : (item.nickname || item.email || 'Anonymous');
    
    const getMedalIcon = (rank: number): keyof typeof Ionicons.glyphMap | null => {
      switch (rank) {
        case 0: return MEDALS.FIRST;
        case 1: return MEDALS.SECOND;
        case 2: return MEDALS.THIRD;
        default: return null;
      }
    };

    const medal = getMedalIcon(index);
    const isTopThree = index < 3;

    // Updated colors: #1 uses pink glow, #2/#3 use purple tones
    const getMedalColor = () => {
      if (index === 0) return '#F472B6'; // Pink for #1
      if (index === 1) return '#C084FC'; // Light purple for #2
      if (index === 2) return '#A855F7'; // Purple for #3
      return '#A855F7';
    };

    const getGlowConfig = () => {
      if (index === 0) return { color: 'secondary' as const, intensity: 'strong' as const };
      if (index === 1) return { color: 'primary' as const, intensity: 'dark' as const };
      if (index === 2) return { color: 'primary' as const, intensity: 'light' as const };
      return { color: 'primary' as const, intensity: 'light' as const };
    };

    const glowConfig = getGlowConfig();

    // Placeholder skeleton styling
    if (isPlaceholder) {
      return (
        <GlassCard
          variant="default"
          style={{
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: 0.35,
            borderStyle: 'dashed',
          }}
        >
          {/* Rank indicator */}
          <View className="mr-4 items-center justify-center w-14">
            <View className={`w-11 h-11 rounded-xl items-center justify-center ${
              isDark ? 'bg-primary/10' : 'bg-primary-muted/50'
            }`}>
              <Text className="text-lg font-black text-primary/50">#{index + 1}</Text>
            </View>
          </View>

          {/* Placeholder content */}
          <View className="flex-1">
            <View
              className="h-4 rounded mb-2"
              style={{
                width: '60%',
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
              }}
            />
            <View
              className="h-3 rounded"
              style={{
                width: '30%',
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.08)',
              }}
            />
          </View>
        </GlassCard>
      );
    }

    return (
      <GlassCard 
        variant={isTopThree ? 'elevated' : 'default'}
        glowColor={glowConfig.color}
        style={{
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: isTopThree ? 2 : 1,
          borderColor: isTopThree
            ? `${getMedalColor()}50`
            : isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
        }}
      >
        {/* Rank indicator */}
        <View className="mr-4 items-center justify-center w-14">
          {medal ? (
            <View className="relative">
              <Ionicons name={medal} size={40} color={getMedalColor()} />
              {index === 0 && (
                <View
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: '#F472B6',
                    shadowColor: '#F472B6',
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                  }}
                >
                  <Text className="text-[10px] font-black text-white">1</Text>
                </View>
              )}
            </View>
          ) : (
            <View className={`w-11 h-11 rounded-xl items-center justify-center ${
              isDark ? 'bg-primary/20' : 'bg-primary-muted'
            }`}>
              <Text className="text-lg font-black text-primary">#{index + 1}</Text>
            </View>
          )}
        </View>
        
        {/* Player info */}
        <View className="flex-1">
          <Text 
            className={`mb-1 ${
              isTopThree ? 'text-lg font-black' : 'text-base font-bold'
            } ${isDark ? 'text-ink-light' : 'text-ink'}`}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <View className="flex-row items-center">
            <Ionicons 
              name="stopwatch" 
              size={16} 
              color={isTopThree ? getMedalColor() : '#A855F7'}
              style={{ marginRight: 8 }}
            />
            <Text 
              className={`font-black ${isTopThree ? 'text-xl' : 'text-lg'}`}
              style={{
                color: isTopThree ? getMedalColor() : isDark ? '#C084FC' : '#A855F7',
              }}
            >
              {formatTime(item.time)}
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  return (
    <ScreenContainer showGlowEffects={true}>
      {/* Header */}
      <GlassCard
        variant="elevated"
        style={{
          marginHorizontal: 16,
          marginTop: 8,
          borderRadius: tokens.radius['3xl'],
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <Header
          title="Leaderboard"
          subtitle="Top 10 Players"
          leftIcon={<Ionicons name="arrow-back" size={24} color={isDark ? '#FAF5FF' : '#1E1B4B'} />}
          onLeftPress={onBack}
          variant="transparent"
        />
      </GlassCard>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <View 
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
            }}
          >
            <ActivityIndicator size="large" color="#A855F7" />
          </View>
          <Text className={`mt-4 font-bold ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderScore}
          keyExtractor={(item, index) => `${item.userId}-${index}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}
