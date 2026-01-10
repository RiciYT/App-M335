import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import HighscoresScreen from './src/screens/HighscoresScreen';

type Screen = 'Login' | 'Menu' | 'Game' | 'Result' | 'Highscores';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [gameTime, setGameTime] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentScreen('Menu');
      } else {
        setCurrentScreen('Login');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    setCurrentScreen('Menu');
  };

  const handleLogout = () => {
    setUser(null);
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {currentScreen === 'Login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'Menu' && (
        <MenuScreen onNavigate={handleNavigate} onLogout={handleLogout} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
