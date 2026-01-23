import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { formatTime, GameScore } from '../types';
import { ScreenContainer, Header } from '../components/ui';
import { useTheme } from '../theme';

const MEDALS = {
  FIRST: '🥇',
  SECOND: '🥈',
  THIRD: '🥉',
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
        setScores(scoresArray.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching highscores:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderScore = ({ item, index }: { item: GameScore; index: number }) => {
    const displayName = item.nickname || item.email || 'Anonymous';
    
    const getMedalIcon = (rank: number): string | null => {
      switch (rank) {
        case 0: return MEDALS.FIRST;
        case 1: return MEDALS.SECOND;
        case 2: return MEDALS.THIRD;
        default: return null;
      }
    };

    const medal = getMedalIcon(index);
    const isTopThree = index < 3;

    const getBorderColor = () => {
      if (index === 0) return '#FACC15'; // Gold/Yellow
      if (index === 1) return '#A78BFA'; // Silver/Violet
      if (index === 2) return '#F472B6'; // Bronze/Pink
      return 'transparent';
    };

    const getGlowColor = () => {
      if (index === 0) return '#FACC15';
      if (index === 1) return '#A78BFA';
      if (index === 2) return '#F472B6';
      return '#A855F7';
    };

    return (
      <View 
        className={`mb-3 flex-row items-center p-4 rounded-2xl ${
          isDark ? 'bg-surface-dark/70' : 'bg-surface-light/90'
        }`}
        style={{
          borderWidth: isTopThree ? 2 : 1,
          borderColor: isTopThree ? getBorderColor() : isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.15)',
          shadowColor: isTopThree ? getGlowColor() : 'transparent',
          shadowOpacity: isTopThree ? (isDark ? 0.4 : 0.25) : 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: isTopThree ? 12 : 0,
        }}
      >
        {/* Rank indicator */}
        <View className="mr-4 items-center justify-center w-14">
          {medal ? (
            <Text className="text-4xl">{medal}</Text>
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
            <Text className="text-sm mr-2">⏱</Text>
            <Text 
              className={`font-black ${isTopThree ? 'text-xl' : 'text-lg'}`}
              style={{
                color: isTopThree ? getGlowColor() : isDark ? '#C084FC' : '#A855F7',
              }}
            >
              {formatTime(item.time)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer showGlowEffects={true}>
      {/* Header */}
      <View 
        className={`mx-4 mt-2 rounded-3xl overflow-hidden ${
          isDark ? 'bg-surface-dark/80' : 'bg-surface-light/90'
        }`}
        style={{
          borderWidth: 1,
          borderColor: isDark ? 'rgba(76, 29, 149, 0.4)' : 'rgba(168, 85, 247, 0.2)',
          shadowColor: '#A855F7',
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 16,
        }}
      >
        <Header
          title="Leaderboard"
          subtitle="Top 10 Players"
          leftIcon={<Text className={`text-2xl ${isDark ? 'text-ink-light' : 'text-ink'}`}>←</Text>}
          onLeftPress={onBack}
          variant="transparent"
        />
      </View>

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
      ) : scores.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{
              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
            }}
          >
            <Text className="text-5xl">🎯</Text>
          </View>
          <Text className={`text-2xl font-black mb-2 ${isDark ? 'text-ink-light' : 'text-ink'}`}>
            No scores yet!
          </Text>
          <Text className={`text-center font-medium ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            Be the first to complete the maze!
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
