import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { Screen } from './src/types';
import { useAppSettings } from './src/hooks/useAppSettings';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import HighscoresScreen from './src/screens/HighscoresScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

function AppContent() {
  // Initialize app settings and music
  useAppSettings();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [gameTime, setGameTime] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentScreen('Menu');
      } else {
        setCurrentScreen('Login');
      }
    });
  }, []);

  const handleLogin = () => {
    setCurrentScreen('Menu');
  };

  const handleLogout = () => {
    setUser(null);
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: DEEP_NAVY }}>
        {/* Decorative circles */}
        <View
          style={{
            position: 'absolute',
            width: 288,
            height: 288,
            borderRadius: 144,
            top: '20%',
            left: -60,
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
          }}
        />
        <View 
          style={{
            position: 'absolute',
            width: 256,
            height: 256,
            borderRadius: 128,
            bottom: '20%',
            right: -50,
            backgroundColor: 'rgba(0, 242, 255, 0.05)',
          }}
        />
        
        {/* Loading indicator */}
        <View 
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 242, 255, 0.15)',
            shadowColor: NEON_CYAN,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 20,
          }}
        >
          <ActivityIndicator size="large" color={NEON_CYAN} />
        </View>
        <Text style={{
          marginTop: 16,
          fontWeight: '900',
          fontSize: 14,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'rgba(0, 242, 255, 0.6)',
        }}>
          Loading
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: DEEP_NAVY }}>
      <StatusBar style="light" />

      {currentScreen === 'Login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'Menu' && (
        <MenuScreen 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
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
        />
      )}
      
      {currentScreen === 'Highscores' && (
        <HighscoresScreen onBack={() => handleNavigate('Menu')} />
      )}
      
      {currentScreen === 'Settings' && (
        <SettingsScreen 
          onBack={() => handleNavigate('Menu')} 
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
