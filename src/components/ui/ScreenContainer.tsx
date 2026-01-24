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

// Simplified dot pattern - one layer only
function ArcadeGrid({ isDark }: { isDark: boolean }) {
  const dotColor = isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.06)';
  
  return (
    <View className="absolute inset-0 z-0" pointerEvents="none">
      {/* Dot matrix pattern only */}
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

// Subtle decorative glow orbs - reduced opacity for content focus
function NeonGlows({ isDark }: { isDark: boolean }) {
  return (
    <>
      {/* Primary violet glow - top left */}
      <View
        className="absolute w-80 h-80 rounded-full"
        style={{
          top: -100,
          left: -80,
          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.05)',
        }}
      />
      
      {/* Secondary pink glow - bottom right */}
      <View
        className="absolute w-72 h-72 rounded-full"
        style={{
          bottom: -100,
          right: -80,
          backgroundColor: isDark ? 'rgba(244, 114, 182, 0.06)' : 'rgba(244, 114, 182, 0.04)',
        }}
      />
    </>
  );
}

// Removed noise overlay to simplify - keeping to 2 layers max

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
      
      <SafeAreaView className="flex-1" edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}
