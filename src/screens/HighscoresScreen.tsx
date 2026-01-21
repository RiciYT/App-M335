import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { formatTime, GameScore } from '../types';
import { ScreenContainer, Header, Card } from '../components/ui';
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

    const getRankBgColor = () => {
      if (index === 0) return isDark ? 'bg-amber-900/30 border-amber-500/50' : 'bg-amber-50 border-secondary';
      if (index === 1) return isDark ? 'bg-slate-700/50 border-slate-500' : 'bg-slate-100 border-accent';
      if (index === 2) return isDark ? 'bg-orange-900/30 border-orange-500/50' : 'bg-orange-50 border-secondary';
      return '';
    };

    return (
      <Card 
        variant={isTopThree ? 'elevated' : 'default'} 
        className={`mb-3 flex-row items-center ${isTopThree ? `border-2 ${getRankBgColor()}` : ''}`}
      >
        <View className="mr-4 items-center justify-center w-14">
          {medal ? (
            <Text className="text-4xl">{medal}</Text>
          ) : (
            <View className={`w-11 h-11 rounded-full items-center justify-center ${
              isDark ? 'bg-primary/20' : 'bg-primary-muted'
            }`}>
              <Text className="text-lg font-bold text-primary">#{index + 1}</Text>
            </View>
          )}
        </View>
        
        <View className="flex-1">
          <Text 
            className={`font-semibold mb-1.5 ${
              isTopThree ? 'text-lg font-bold' : 'text-base'
            } ${isDark ? 'text-ink-light' : 'text-ink'}`} 
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm mr-2">⏱</Text>
            <Text className={`font-bold text-primary ${isTopThree ? 'text-xl' : 'text-lg'}`}>
              {formatTime(item.time)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer showGlowEffects={false}>
      {/* Header */}
      <View className={`px-5 pt-3 pb-5 ${
        isDark ? 'bg-surface-dark border-b border-border-dark' : 'bg-surface-light border-b border-border'
      } rounded-b-3xl shadow-lg`}>
        <Header
          title="🏆 Highscores"
          subtitle="Top 10 Players"
          leftIcon={<Text className={`text-2xl ${isDark ? 'text-ink-light' : 'text-ink'}`}>←</Text>}
          onLeftPress={onBack}
          variant="transparent"
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2EC4C6" />
          <Text className={`mt-4 font-semibold ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            Loading highscores...
          </Text>
        </View>
      ) : scores.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <Text className="text-7xl mb-4">🎯</Text>
          <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-ink-light' : 'text-ink'}`}>
            No scores yet!
          </Text>
          <Text className={`text-center ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            Be the first to complete the game!
          </Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderScore}
          keyExtractor={(item, index) => `${item.userId}-${index}`}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}
