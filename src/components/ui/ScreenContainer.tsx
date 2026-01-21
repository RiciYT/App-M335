import React, { ReactNode } from 'react';
import { View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

interface ScreenContainerProps {
  children: ReactNode;
  showGrid?: boolean;
  showGlowEffects?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

function GridBackground({ isDark }: { isDark: boolean }) {
  return (
    <View className="absolute inset-0 z-0" pointerEvents="none">
      <View className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}>
        {[...Array(20)].map((_, i) => (
          <View
            key={`v-${i}`}
            className={`absolute top-0 bottom-0 w-[1px] ${isDark ? 'bg-ink-light' : 'bg-ink'}`}
            style={{ left: i * (width / 10) }}
          />
        ))}
        {[...Array(40)].map((_, i) => (
          <View
            key={`h-${i}`}
            className={`absolute left-0 right-0 h-[1px] ${isDark ? 'bg-ink-light' : 'bg-ink'}`}
            style={{ top: i * (width / 10) }}
          />
        ))}
      </View>
    </View>
  );
}

function GlowEffects({ isDark }: { isDark: boolean }) {
  const opacity = isDark ? 'opacity-10' : 'opacity-20';
  return (
    <>
      <View className={`absolute -top-[10%] -left-[15%] w-72 h-72 bg-primary ${opacity} rounded-full`} />
      <View className={`absolute top-[20%] -right-[20%] w-64 h-64 bg-secondary ${opacity} rounded-full`} />
      <View className={`absolute -bottom-[15%] -right-[10%] w-80 h-80 bg-accent ${opacity} rounded-full`} />
    </>
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
      {showGrid && <GridBackground isDark={isDark} />}
      {showGlowEffects && <GlowEffects isDark={isDark} />}
      <SafeAreaView className="flex-1" edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}
