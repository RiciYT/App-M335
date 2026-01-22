import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
          colors={isDark 
            ? ['#0C0118', '#150726', '#0C0118'] 
            : ['#FAF5FF', '#F3E8FF', '#FAF5FF']
          }
          className="absolute inset-0"
        />
        {/* Glow effects */}
        <View 
          className="absolute w-72 h-72 rounded-full"
          style={{
            top: '20%',
            left: -60,
            backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
          }}
        />
        <View 
          className="absolute w-64 h-64 rounded-full"
          style={{
            bottom: '20%',
            right: -50,
            backgroundColor: isDark ? 'rgba(244, 114, 182, 0.1)' : 'rgba(244, 114, 182, 0.06)',
          }}
        />
        
        {/* Loading indicator */}
        <View 
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)',
            shadowColor: '#A855F7',
            shadowOpacity: isDark ? 0.5 : 0.3,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 20,
          }}
        >
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
        <Text className={`mt-4 font-black text-sm tracking-[2px] uppercase ${
          isDark ? 'text-ink-muted-light' : 'text-ink-muted'
        }`}>
          Loading
        </Text>
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
