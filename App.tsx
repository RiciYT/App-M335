import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import HighscoresScreen from './src/screens/HighscoresScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Screen = 'Login' | 'Menu' | 'Game' | 'Result' | 'Highscores' | 'Settings';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [gameTime, setGameTime] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setIsGuest(false);
        setCurrentScreen('Menu');
      } else if (!isGuest) {
        setCurrentScreen('Login');
      }
    });

    return unsubscribe;
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

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleGameComplete = (time: number) => {
    setGameTime(time);
    setCurrentScreen('Result');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
});
