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

const lightColors = {
  primary: '#2EC4C6',
  primaryLight: '#5DD3D5',
  primaryDark: '#1FA8AA',
  primaryMuted: '#D4F4F4',
  secondary: '#F59C7A',
  secondaryLight: '#F7B499',
  secondaryDark: '#E87A52',
  secondaryMuted: '#FDEDE7',
  accent: '#7FB5FF',
  accentLight: '#A3CBFF',
  accentDark: '#5A9AEF',
  accentMuted: '#E8F2FF',
  mint: '#56D1B7',
  mintLight: '#7EDCC9',
  mintDark: '#3BB89D',
  mintMuted: '#E0F7F1',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F7',
  ink: '#1F2937',
  inkMuted: '#6B7280',
  border: '#E3E8F0',
};

const darkColors = {
  ...lightColors,
  background: '#0F172A',
  surface: '#1E293B',
  surfaceMuted: '#334155',
  ink: '#F8FAFC',
  inkMuted: '#94A3B8',
  border: '#334155',
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
