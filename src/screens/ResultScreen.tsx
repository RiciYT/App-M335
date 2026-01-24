import React, { useState, useEffect, useRef } from 'react';
import { Animated, View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ref, set, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../config/firebase';
import { formatTime, Screen } from '../types';
import { ScreenContainer } from '../components/ui';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

interface ResultScreenProps {
  time: number;
  onNavigate: (screen: Screen) => void;
  isGuest: boolean;
}

export default function ResultScreen({ time, onNavigate, isGuest }: ResultScreenProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isGuest) {
      saveScore();
    }
  }, [isGuest]);

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [enterAnim]);

  const saveScore = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);

    try {
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
      
      if (existingData && !newBest) {
        setPreviousBest(existingData.time);
      }
      
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
    <ScreenContainer showGlowEffects={true} edges={['top', 'bottom']}>
      {/* Grand Glow Background */}
      <View
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          borderRadius: 200,
          backgroundColor: 'rgba(0, 242, 255, 0.15)',
          opacity: 0.6,
        }}
      />

      {/* Main Content */}
      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          opacity: enterAnim,
          transform: [
            {
              translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
            },
          ],
        }}
      >
        {/* Title Glow */}
        <View
          style={{
            position: 'absolute',
            top: -140,
            left: -120,
            width: 640,
            height: 640,
            borderRadius: 320,
            backgroundColor: 'rgba(0, 242, 255, 0.12)',
            opacity: 0.6,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -80,
            left: -60,
            width: 520,
            height: 520,
            borderRadius: 260,
            backgroundColor: 'rgba(0, 242, 255, 0.08)',
            opacity: 0.6,
          }}
        />
        {/* Main Title */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 64,
              fontWeight: '900',
              lineHeight: 58,
              letterSpacing: -3,
              textTransform: 'uppercase',
              fontStyle: 'italic',
              textShadowColor: 'rgba(0, 242, 255, 0.8)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            LEVEL
          </Text>
          <Text
            style={{
              color: NEON_CYAN,
              fontSize: 64,
              fontWeight: '900',
              lineHeight: 58,
              letterSpacing: -3,
              textTransform: 'uppercase',
              fontStyle: 'italic',
              textShadowColor: 'rgba(0, 242, 255, 1)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 30,
            }}
          >
            COMPLETE
          </Text>
        </View>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: -0.5,
            textTransform: 'uppercase',
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 48,
          }}
        >
          {isNewBest ? 'Personal Best!' : 'Great Performance'}
        </Text>

        {/* Time Display */}
        <View style={{ position: 'relative', alignItems: 'center', paddingVertical: 48 }}>
          {/* Glow behind time */}
          <View
            style={{
              position: 'absolute',
              width: 288,
              height: 288,
              borderRadius: 144,
              backgroundColor: 'rgba(0, 242, 255, 0.2)',
              opacity: 0.25,
            }}
          />

          <Text
            style={{
              fontSize: 12,
              color: NEON_CYAN,
              textTransform: 'uppercase',
              fontWeight: '900',
              letterSpacing: 4,
              marginBottom: 8,
              opacity: 0.8,
            }}
          >
            Final Time
          </Text>
          <Text
            style={{
              fontSize: 56,
              fontWeight: '900',
              color: '#FFFFFF',
              fontVariant: ['tabular-nums'],
              textShadowColor: 'rgba(0, 242, 255, 0.4)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 15,
            }}
          >
            {formatTime(time)}
          </Text>

          {/* Previous Best Info */}
          {saved && !isNewBest && previousBest && (
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(0, 242, 255, 0.5)',
                marginTop: 12,
                fontWeight: '600',
              }}
            >
              Best: {formatTime(previousBest)}
            </Text>
          )}

          {/* Saving Indicator */}
          {saving && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <ActivityIndicator size="small" color={NEON_CYAN} />
              <Text style={{ marginLeft: 8, color: 'rgba(0, 242, 255, 0.6)', fontSize: 12 }}>
                Saving...
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Footer with Buttons */}
      <Animated.View
        style={{
          paddingHorizontal: 32,
          paddingBottom: 40,
          paddingTop: 16,
          gap: 12,
          opacity: enterAnim,
          transform: [
            {
              translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
            },
          ],
        }}
      >
        {/* Guest Warning */}
        {isGuest && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(251, 146, 60, 0.3)',
              marginBottom: 8,
            }}
          >
            <Ionicons name="warning" size={20} color="#FB923C" style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#FB923C' }}>
              Sign in to save your score
            </Text>
          </View>
        )}

        {/* Play Again - Primary Button */}
        <TouchableOpacity
          onPress={() => onNavigate('Game')}
          disabled={saving}
          activeOpacity={0.9}
          style={{
            width: '100%',
            height: 80,
            backgroundColor: NEON_CYAN,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 12,
            shadowColor: NEON_CYAN,
            shadowOpacity: 0.4,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 50,
            opacity: saving ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: DEEP_NAVY,
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            Play Again
          </Text>
          <Ionicons name="refresh" size={24} color={DEEP_NAVY} />
        </TouchableOpacity>

        {/* Secondary Buttons Row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Leaderboard Button */}
          <TouchableOpacity
            onPress={() => onNavigate('Highscores')}
            disabled={saving}
            activeOpacity={0.8}
            style={{
              flex: 1,
              height: 64,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Ionicons name="trophy-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Scores
            </Text>
          </TouchableOpacity>

          {/* Menu Button */}
          <TouchableOpacity
            onPress={() => onNavigate('Menu')}
            disabled={saving}
            activeOpacity={0.8}
            style={{
              flex: 1,
              height: 64,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Ionicons name="grid-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Menu
            </Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </ScreenContainer>
  );
}
