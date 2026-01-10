import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface MenuScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function MenuScreen({ onNavigate, onLogout }: MenuScreenProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tilt Maze</Text>
      <Text style={styles.subtitle}>Guide the ball to the target!</Text>

      <TouchableOpacity style={styles.button} onPress={() => onNavigate('Game')}>
        <Text style={styles.buttonText}>Play Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => onNavigate('Highscores')}>
        <Text style={styles.buttonText}>Highscores</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 60,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
