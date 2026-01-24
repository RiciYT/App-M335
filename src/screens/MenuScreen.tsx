import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { signOut, type User } from 'firebase/auth';
import { get, ref, set, update } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../config/firebase';
import { Screen } from '../types';

// Neon Cyan color constants matching the design
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

interface MenuScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  user: User | null;
}

export default function MenuScreen({ onNavigate, onLogout, user }: MenuScreenProps) {
  const [nickname, setNickname] = useState('');
  const glowAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [enterAnim]);

  useEffect(() => {
    if (!user) {
      setNickname('');
      return;
    }

    let isMounted = true;

    const loadNickname = async () => {
      try {
        const nicknameRef = ref(database, `users/${user.uid}/nickname`);
        const snapshot = await get(nicknameRef);
        if (isMounted) {
          setNickname(snapshot.exists() ? String(snapshot.val() || '') : '');
        }
      } catch (error) {
        console.error('Nickname load error:', error);
      }
    };

    loadNickname();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const saveNickname = async () => {
    if (!user) return;

    const trimmed = nickname.trim();

    try {
      const nicknameRef = ref(database, `users/${user.uid}/nickname`);
      await set(nicknameRef, trimmed || null);

      const scoreRef = ref(database, `scores/${user.uid}`);
      const scoreSnapshot = await get(scoreRef);
      if (scoreSnapshot.exists()) {
        await update(scoreRef, { nickname: trimmed || null });
      }
    } catch (error) {
      console.error('Nickname save error:', error);
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: DEEP_NAVY }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
      {/* Cyber Grid Background */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
        }}
      >
        {/* Grid lines */}
        {[...Array(15)].map((_, i) => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: i * 60,
              height: 1,
              backgroundColor: NEON_CYAN,
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: i * 60,
              width: 1,
              backgroundColor: NEON_CYAN,
            }}
          />
        ))}
      </View>

      {/* Mesh Gradient Overlay */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'transparent',
          opacity: 0.8,
        }}
      />

      {/* Decorative circles */}
      <View
        style={{
          position: 'absolute',
          top: '25%',
          left: -80,
          width: 256,
          height: 256,
          borderRadius: 128,
          borderWidth: 1,
          borderColor: 'rgba(0, 242, 255, 0.05)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '25%',
          right: -80,
          width: 320,
          height: 320,
          borderRadius: 160,
          borderWidth: 1,
          borderColor: 'rgba(0, 242, 255, 0.05)',
        }}
      />

      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 64,
          paddingBottom: 48,
          opacity: enterAnim,
          transform: [
            {
              translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
            },
          ],
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ width: 48, height: 48 }} />

          {/* Title */}
          <Text
            style={{
              color: NEON_CYAN,
              fontSize: 48,
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: -2,
              textShadowColor: 'rgba(0, 242, 255, 0.8)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }}
          >
            TILT MAZE
          </Text>

          <View style={{ width: 48, height: 48 }} />
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Nickname Input */}
          <View style={{ position: 'relative', width: '100%', maxWidth: 320, marginBottom: 24 }}>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="ENTER NICKNAME"
              placeholderTextColor="rgba(0, 242, 255, 0.25)"
              editable={!!user}
              onEndEditing={saveNickname}
              onSubmitEditing={saveNickname}
              style={{
                width: '100%',
                height: 56,
                backgroundColor: 'rgba(5, 10, 20, 0.8)',
                borderWidth: 2,
                borderColor: 'rgba(0, 242, 255, 0.3)',
                borderRadius: 16,
                paddingHorizontal: 20,
                textAlign: 'center',
                color: NEON_CYAN,
                fontSize: 14,
                fontWeight: '700',
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            />
            {/* Label */}
            <View
              style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: [{ translateX: -40 }],
                backgroundColor: DEEP_NAVY,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  color: 'rgba(0, 242, 255, 0.6)',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontStyle: 'italic',
                }}
              >
                Player Tag
              </Text>
            </View>
          </View>

          {/* Play Button with Glow */}
          <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }}>
            {/* Glow behind button */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 288,
                height: 288,
                borderRadius: 144,
                backgroundColor: 'rgba(0, 242, 255, 0.2)',
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] }),
                transform: [
                  {
                    scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.05] }),
                  },
                ],
              }}
            />

            {/* Play Button */}
            <TouchableOpacity
              onPress={() => onNavigate('Game')}
              activeOpacity={0.85}
              style={{
                width: 224,
                height: 224,
                borderRadius: 112,
                backgroundColor: DEEP_NAVY,
                borderWidth: 12,
                borderColor: 'rgba(0, 242, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.4,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 20,
                elevation: 10,
                overflow: 'hidden',
              }}
            >
              {/* Inner gradient overlay */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 112,
                  backgroundColor: 'rgba(0, 242, 255, 0.05)',
                }}
              />

              <Ionicons
                name="play"
                size={110}
                color={NEON_CYAN}
                style={{
                  textShadowColor: 'rgba(0, 242, 255, 0.8)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 15,
                }}
              />
              <Text
                style={{
                  color: NEON_CYAN,
                  fontSize: 30,
                  fontWeight: '900',
                  letterSpacing: -1,
                  fontStyle: 'italic',
                  marginTop: -8,
                  textShadowColor: 'rgba(0, 242, 255, 0.8)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
                }}
              >
                PLAY
              </Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Buttons */}
          <View style={{ marginTop: 48, width: '100%', maxWidth: 240, gap: 16 }}>
            {/* High Scores Button */}
            <TouchableOpacity
              onPress={() => onNavigate('Highscores')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 242, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(0, 242, 255, 0.3)',
              }}
            >
              <Ionicons name="stats-chart" size={24} color="rgba(0, 242, 255, 0.8)" />
              <Text
                style={{
                  color: 'rgba(0, 242, 255, 0.8)',
                  fontSize: 14,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 4,
                }}
              >
                High Scores
              </Text>
            </TouchableOpacity>

            {/* Options Button */}
            <TouchableOpacity
              onPress={() => onNavigate('Settings')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 242, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(0, 242, 255, 0.3)',
              }}
            >
              <Ionicons name="options" size={24} color="rgba(0, 242, 255, 0.8)" />
              <Text
                style={{
                  color: 'rgba(0, 242, 255, 0.8)',
                  fontSize: 14,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 4,
                }}
              >
                Options
              </Text>
            </TouchableOpacity>

            {/* Logout/Back Button */}
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
                paddingVertical: 12,
                marginTop: 8,
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="rgba(0, 242, 255, 0.4)"
              />
              <Text
                style={{
                  color: 'rgba(0, 242, 255, 0.4)',
                  fontSize: 12,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </Animated.View>
      </SafeAreaView>
    </View>
  );
}

