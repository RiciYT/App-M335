import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../config/firebase';

interface ResultScreenProps {
  time: number;
  onNavigate: (screen: string) => void;
  isGuest: boolean;
}

export default function ResultScreen({ time, onNavigate, isGuest }: ResultScreenProps) {
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
      // First get the user's nickname
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
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save score: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Complete!</Text>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Your Time:</Text>
        <Text style={styles.timeValue}>{formatTime(time)}</Text>
      </View>

      {isGuest ? (
        <View style={styles.guestContainer}>
          <Text style={styles.guestText}>⚠️ Playing as Guest</Text>
          <Text style={styles.guestSubtext}>Log in to save your highscores!</Text>
        </View>
      ) : (
        <>
          {saving && (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.savingText}>Saving score...</Text>
            </View>
          )}

          {saved && isNewBest && (
            <View style={styles.bestContainer}>
              <Text style={styles.bestText}>🎉 New Personal Best! 🎉</Text>
            </View>
          )}

          {saved && !isNewBest && (
            <View style={styles.notBestContainer}>
              <Text style={styles.notBestText}>Keep practicing to beat your best time!</Text>
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate('Game')}
        disabled={saving}
      >
        <Text style={styles.buttonText}>🎮 Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate('Highscores')}
        disabled={saving}
      >
        <Text style={styles.buttonText}>🏆 View Highscores</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.menuButton]}
        onPress={() => onNavigate('Menu')}
        disabled={saving}
      >
        <Text style={styles.buttonText}>← Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  timeContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  savingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  savingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  bestContainer: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  bestText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notBestContainer: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  notBestText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  guestContainer: {
    backgroundColor: '#8E8E93',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  guestText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestSubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
