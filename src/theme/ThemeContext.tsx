import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

// NEON ARCADE BRUTALISM PALETTE
const lightColors = {
  // Primary: Electric Violet
  primary: '#A855F7',
  primaryLight: '#C084FC',
  primaryDark: '#7C3AED',
  primaryMuted: '#F3E8FF',
  primaryGlow: 'rgba(168, 85, 247, 0.5)',
  // Secondary: Hot Cyber Pink  
  secondary: '#F472B6',
  secondaryLight: '#F9A8D4',
  secondaryDark: '#DB2777',
  secondaryMuted: '#FCE7F3',
  secondaryGlow: 'rgba(244, 114, 182, 0.5)',
  // Accent: Cyber Yellow
  accent: '#FACC15',
  accentLight: '#FDE047',
  accentDark: '#EAB308',
  accentMuted: '#FEF9C3',
  accentGlow: 'rgba(250, 204, 21, 0.5)',
  // Mint: Neon Cyan
  mint: '#22D3EE',
  mintLight: '#67E8F9',
  mintDark: '#06B6D4',
  mintMuted: '#CFFAFE',
  mintGlow: 'rgba(34, 211, 238, 0.5)',
  // Semantic
  success: '#4ADE80',
  warning: '#FB923C',
  error: '#F87171',
  info: '#60A5FA',
  // Light theme surfaces
  background: '#FAF5FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F3E8FF',
  ink: '#1E1B4B',
  inkMuted: '#6B7280',
  border: '#DDD6FE',
  // Neon effects
  neonViolet: '#8B5CF6',
  neonPink: '#EC4899',
  neonCyan: '#06B6D4',
  neonYellow: '#EAB308',
};

const darkColors = {
  ...lightColors,
  // Deep space background with purple tint
  background: '#0C0118',
  surface: '#1A0A2E',
  surfaceMuted: '#2D1B4E',
  ink: '#FAF5FF',
  inkMuted: '#A78BFA',
  border: '#4C1D95',
};

const THEME_STORAGE_KEY = '@tiltmaze_theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeModeState(stored as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
