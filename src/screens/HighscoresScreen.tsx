import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { formatTime, GameScore } from '../types';

// Medal constants for top 3 positions
const MEDALS = {
  FIRST: '🥇',
  SECOND: '🥈',
  THIRD: '🥉',
} as const;

interface HighscoresScreenProps {
  onBack: () => void;
}

export default function HighscoresScreen({ onBack }: HighscoresScreenProps) {
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
        
        // Sort by time (ascending - lower is better)
        scoresArray.sort((a, b) => a.time - b.time);
        
        // Take top 10
        setScores(scoresArray.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching highscores:', error);
    } finally {
      setLoading(false);
    }
  };


  const renderScore = ({ item, index }: { item: GameScore; index: number }) => {
    // Display nickname if available, otherwise email
    const displayName = item.nickname || item.email || 'Anonymous';
    
    // Medal emojis for top 3
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

    return (
      <View style={[
        styles.scoreItem, 
        isTopThree && styles.topThreeItem,
        index === 0 && styles.rank1,
        index === 1 && styles.rank2,
        index === 2 && styles.rank3,
      ]}>
        <View style={styles.rankContainer}>
          {medal ? (
            <Text style={styles.medalIcon}>{medal}</Text>
          ) : (
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{index + 1}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.scoreInfo}>
          <Text style={[styles.playerName, isTopThree && styles.topThreeName]} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>⏱</Text>
            <Text style={[styles.time, isTopThree && styles.topThreeTime]}>
              {formatTime(item.time)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🏆 Highscores</Text>
          <Text style={styles.headerSubtitle}>Top 10 Players</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading highscores...</Text>
        </View>
      ) : scores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>No scores yet!</Text>
          <Text style={styles.emptySubtext}>Be the first to complete the game!</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderScore}
          keyExtractor={(item, index) => `${item.userId}-${index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#2EC4C6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 46,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  topThreeItem: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
  },
  rank1: {
    backgroundColor: '#FFF4E6',
    borderColor: '#F59C7A',
  },
  rank2: {
    backgroundColor: '#F3F6FB',
    borderColor: '#7FB5FF',
  },
  rank3: {
    backgroundColor: '#FCE7E1',
    borderColor: '#F59C7A',
  },
  rankContainer: {
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
  medalIcon: {
    fontSize: 40,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2EC4C6',
  },
  scoreInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 8,
  },
  topThreeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    fontSize: 15,
  },
  time: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2EC4C6',
  },
  topThreeTime: {
    fontSize: 21,
    fontWeight: '800',
  },
});
