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
      {/* Header with celebration */}
      <View style={styles.headerSection}>
        <Text style={styles.celebrationIcon}>🎉</Text>
        <Text style={styles.title}>Game Complete!</Text>
        <Text style={styles.subtitle}>Well done!</Text>
      </View>
      
      {/* Time Display Card */}
      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>Your Time</Text>
        <View style={styles.timeValueContainer}>
          <Text style={styles.timeIcon}>⏱</Text>
          <Text style={styles.timeValue}>{formatTime(time)}</Text>
        </View>
      </View>

      {/* Status Messages */}
      <View style={styles.statusSection}>
        {isGuest ? (
          <View style={styles.guestCard}>
            <Text style={styles.guestIcon}>⚠️</Text>
            <View style={styles.guestContent}>
              <Text style={styles.guestTitle}>Playing as Guest</Text>
              <Text style={styles.guestText}>Log in to save your highscores!</Text>
            </View>
          </View>
        ) : (
          <>
            {saving && (
              <View style={styles.savingCard}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.savingText}>Saving score...</Text>
              </View>
            )}

            {saved && isNewBest && (
              <View style={styles.bestCard}>
                <Text style={styles.bestIcon}>🏆</Text>
                <View style={styles.bestContent}>
                  <Text style={styles.bestTitle}>New Personal Best!</Text>
                  <Text style={styles.bestText}>You've set a new record!</Text>
                </View>
              </View>
            )}

            {saved && !isNewBest && (
              <View style={styles.notBestCard}>
                <Text style={styles.notBestIcon}>💪</Text>
                <View style={styles.notBestContent}>
                  <Text style={styles.notBestTitle}>Good Try!</Text>
                  <Text style={styles.notBestText}>Keep practicing to beat your best!</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.playAgainButton]}
          onPress={() => onNavigate('Game')}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🎮</Text>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.highscoresButton]}
          onPress={() => onNavigate('Highscores')}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🏆</Text>
          <Text style={styles.buttonText}>View Highscores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.menuButton]}
          onPress={() => onNavigate('Menu')}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>←</Text>
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  celebrationIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  timeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeIcon: {
    fontSize: 32,
  },
  timeValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: -2,
  },
  statusSection: {
    marginBottom: 32,
  },
  savingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  savingText: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '600',
  },
  bestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bestIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  bestContent: {
    flex: 1,
  },
  bestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  bestText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600',
  },
  notBestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  notBestIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  notBestContent: {
    flex: 1,
  },
  notBestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  notBestText: {
    fontSize: 14,
    color: '#B45309',
    fontWeight: '600',
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F87171',
  },
  guestIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  guestContent: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 4,
  },
  guestText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    gap: 10,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  playAgainButton: {
    backgroundColor: '#3B82F6',
  },
  highscoresButton: {
    backgroundColor: '#F59E0B',
  },
  menuButton: {
    backgroundColor: '#6B7280',
  },
});
