import React, { ReactNode } from 'react';
import { View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

const { width, height } = Dimensions.get('window');

interface ScreenContainerProps {
  children: ReactNode;
  showGrid?: boolean;
  showGlowEffects?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

// Geometric grid with neon arcade aesthetic
function ArcadeGrid({ isDark }: { isDark: boolean }) {
  const dotColor = isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)';
  
  return (
    <View className="absolute inset-0 z-0" pointerEvents="none">
      {/* Diagonal scanlines effect */}
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.03 : 0.02 }}>
        {[...Array(40)].map((_, i) => (
          <View
            key={`scan-${i}`}
            className="absolute left-0 right-0 h-[1px]"
            style={{
              top: i * 20,
              backgroundColor: isDark ? '#A855F7' : '#7C3AED',
            }}
          />
        ))}
      </View>
      
      {/* Dot matrix pattern */}
      <View className="absolute inset-0">
        {[...Array(12)].map((_, row) => (
          [...Array(8)].map((_, col) => (
            <View
              key={`dot-${row}-${col}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: col * (width / 7) + 20,
                top: row * 60 + 30,
                backgroundColor: dotColor,
              }}
            />
          ))
        ))}
      </View>
    </View>
  );
}

// Dramatic neon glow orbs
function NeonGlows({ isDark }: { isDark: boolean }) {
  return (
    <>
      {/* Primary violet glow - top left */}
      <View
        className="absolute w-80 h-80 rounded-full"
        style={{
          top: -100,
          left: -80,
          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
          transform: [{ scale: 1.2 }],
        }}
      />
      
      {/* Secondary pink glow - top right */}
      <View
        className="absolute w-72 h-72 rounded-full"
        style={{
          top: height * 0.15,
          right: -100,
          backgroundColor: isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(244, 114, 182, 0.08)',
        }}
      />
      
      {/* Accent cyan glow - bottom */}
      <View
        className="absolute w-96 h-96 rounded-full"
        style={{
          bottom: -150,
          right: -50,
          backgroundColor: isDark ? 'rgba(34, 211, 238, 0.1)' : 'rgba(34, 211, 238, 0.06)',
        }}
      />
      
      {/* Yellow accent spark - center left */}
      <View
        className="absolute w-48 h-48 rounded-full"
        style={{
          top: height * 0.4,
          left: -60,
          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(250, 204, 21, 0.05)',
        }}
      />
    </>
  );
}

// Noise texture overlay for depth
function NoiseOverlay({ isDark }: { isDark: boolean }) {
  return (
    <View
      className="absolute inset-0 z-10"
      pointerEvents="none"
      style={{
        opacity: isDark ? 0.02 : 0.015,
        backgroundColor: 'transparent',
      }}
    />
  );
}

export function ScreenContainer({
  children,
  showGrid = true,
  showGlowEffects = true,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) {
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 relative overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Subtle gradient base */}
      <LinearGradient
        colors={isDark 
          ? ['#0C0118', '#150726', '#0C0118'] 
          : ['#FAF5FF', '#F3E8FF', '#FAF5FF']
        }
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />
      
      {showGlowEffects && <NeonGlows isDark={isDark} />}
      {showGrid && <ArcadeGrid isDark={isDark} />}
      <NoiseOverlay isDark={isDark} />
      
      <SafeAreaView className="flex-1" edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}
