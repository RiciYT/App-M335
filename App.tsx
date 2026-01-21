import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { Screen } from './src/types';
import { ThemeProvider, useTheme } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import HighscoresScreen from './src/screens/HighscoresScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function AppContent() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [gameTime, setGameTime] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setIsGuest(false);
        setCurrentScreen('Menu');
      } else if (!isGuest) {
        setCurrentScreen('Login');
      }
    });
  }, [isGuest]);

  const handleLogin = () => {
    setIsGuest(false);
    setCurrentScreen('Menu');
  };

  const handleGuestPlay = () => {
    setIsGuest(true);
    setCurrentScreen('Menu');
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    setCurrentScreen('Login');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleGameComplete = (time: number) => {
    setGameTime(time);
    setCurrentScreen('Result');
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <ActivityIndicator size="large" color="#2EC4C6" />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {currentScreen === 'Login' && (
        <LoginScreen onLogin={handleLogin} onGuestPlay={handleGuestPlay} />
      )}
      
      {currentScreen === 'Menu' && (
        <MenuScreen 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          isGuest={isGuest}
          user={user}
        />
      )}
      
      {currentScreen === 'Game' && (
        <GameScreen 
          onGameComplete={handleGameComplete}
          onBack={() => handleNavigate('Menu')}
        />
      )}
      
      {currentScreen === 'Result' && (
        <ResultScreen 
          time={gameTime}
          onNavigate={handleNavigate}
          isGuest={isGuest}
        />
      )}
      
      {currentScreen === 'Highscores' && (
        <HighscoresScreen onBack={() => handleNavigate('Menu')} />
      )}
      
      {currentScreen === 'Settings' && (
        <SettingsScreen 
          onBack={() => handleNavigate('Menu')} 
          isGuest={isGuest}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
