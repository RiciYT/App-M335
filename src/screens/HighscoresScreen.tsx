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
    let rankStyle = null;
    if (index === 0) rankStyle = styles.rank1;
    else if (index === 1) rankStyle = styles.rank2;
    else if (index === 2) rankStyle = styles.rank3;

    // Display nickname if available, otherwise email
    const displayName = item.nickname || item.email || 'Anonymous';

    return (
      <View style={[styles.scoreItem, rankStyle]}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <View style={styles.scoreInfo}>
          <Text style={styles.email} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.time}>{formatTime(item.time)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Highscores</Text>
        <View style={{ width: 80 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading highscores...</Text>
        </View>
      ) : scores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scores yet!</Text>
          <Text style={styles.emptySubtext}>Be the first to complete the game!</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderScore}
          keyExtractor={(item, index) => `${item.userId}-${index}`}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
    width: 80,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  list: {
    padding: 20,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rank1: {
    backgroundColor: '#FFD700',
  },
  rank2: {
    backgroundColor: '#C0C0C0',
  },
  rank3: {
    backgroundColor: '#CD7F32',
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    width: 50,
  },
  scoreInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  email: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  time: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
