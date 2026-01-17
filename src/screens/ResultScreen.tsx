import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { formatTime, Screen } from '../types';

interface ResultScreenProps {
  time: number;
  onNavigate: (screen: Screen) => void;
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to save score: ' + message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
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
    borderRadius: 26,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#2EC4C6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#D9F1F0',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
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
    color: '#2EC4C6',
    letterSpacing: -2,
  },
  statusSection: {
    marginBottom: 32,
  },
  savingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6FF',
    padding: 18,
    borderRadius: 18,
    gap: 14,
  },
  savingText: {
    fontSize: 16,
    color: '#2EC4C6',
    fontWeight: '600',
  },
  bestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF4',
    padding: 22,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#56D1B7',
    shadowColor: '#56D1B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bestIcon: {
    fontSize: 36,
    marginRight: 18,
  },
  bestContent: {
    flex: 1,
  },
  bestTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 6,
  },
  bestText: {
    fontSize: 15,
    color: '#0F766E',
    fontWeight: '600',
  },
  notBestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1E8',
    padding: 22,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F4C7B4',
  },
  notBestIcon: {
    fontSize: 36,
    marginRight: 18,
  },
  notBestContent: {
    flex: 1,
  },
  notBestTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#B4533B',
    marginBottom: 6,
  },
  notBestText: {
    fontSize: 15,
    color: '#B4533B',
    fontWeight: '600',
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8EA',
    padding: 22,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F4B7BD',
  },
  guestIcon: {
    fontSize: 36,
    marginRight: 18,
  },
  guestContent: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#B4234B',
    marginBottom: 6,
  },
  guestText: {
    fontSize: 15,
    color: '#B4234B',
    fontWeight: '600',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 24,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  playAgainButton: {
    backgroundColor: '#2EC4C6',
  },
  highscoresButton: {
    backgroundColor: '#F59C7A',
  },
  menuButton: {
    backgroundColor: '#7B8AA0',
  },
});
