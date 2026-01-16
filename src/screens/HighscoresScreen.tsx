import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { GameScore } from '../types';

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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  const renderScore = ({ item, index }: { item: GameScore; index: number }) => {
    // Display nickname if available, otherwise email
    const displayName = item.nickname || item.email || 'Anonymous';
    
    // Medal emojis for top 3
    const getMedalIcon = (rank: number) => {
      if (rank === 0) return '🥇';
      if (rank === 1) return '🥈';
      if (rank === 2) return '🥉';
      return null;
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
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
    fontWeight: '500',
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
    fontWeight: '500',
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
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
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
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  topThreeItem: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
  },
  rank1: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  rank2: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  },
  rank3: {
    backgroundColor: '#FED7AA',
    borderColor: '#EA580C',
  },
  rankContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
  },
  medalIcon: {
    fontSize: 36,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  scoreInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  topThreeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeIcon: {
    fontSize: 14,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  topThreeTime: {
    fontSize: 20,
    fontWeight: '800',
  },
});
