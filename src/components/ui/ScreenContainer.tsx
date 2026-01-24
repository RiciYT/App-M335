import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


// Neon Cyan color constants
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

interface ScreenContainerProps {
  children: ReactNode;
  showGrid?: boolean;
  showGlowEffects?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

// Cyber grid pattern
function CyberGrid() {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03 }} pointerEvents="none">
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
  );
}

// Decorative glow elements
function NeonGlows() {
  return (
    <>
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

      {/* Vertical accent lines */}
    </>
  );
}

export function ScreenContainer({
  children,
  showGrid = true,
  showGlowEffects = true,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) {
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [enterAnim]);

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: DEEP_NAVY }}>
      <StatusBar style="light" />

      {showGlowEffects && <NeonGlows />}
      {showGrid && <CyberGrid />}

      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        <Animated.View
          style={{
            flex: 1,
            opacity: enterAnim,
            transform: [
              {
                translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
