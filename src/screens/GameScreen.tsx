import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ball, Target } from '../types';

interface GameScreenProps {
  onGameComplete: (time: number) => void;
  onBack: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const BALL_RADIUS = 15;
const TARGET_RADIUS = 30;
const FRICTION = 0.95;
const SENSITIVITY = 20;

export default function GameScreen({ onGameComplete, onBack }: GameScreenProps) {
  const [ball, setBall] = useState<Ball>({
    x: 50,
    y: 50,
    vx: 0,
    vy: 0,
  });
  const [target] = useState<Target>({
    x: SCREEN_WIDTH - 80,
    y: SCREEN_HEIGHT - 150,
    radius: TARGET_RADIUS,
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const subscription = useRef<any>(null);

  useEffect(() => {
    // Subscribe to accelerometer
    subscription.current = Accelerometer.addListener((accelerometerData) => {
      const { x, y } = accelerometerData;
      
      setBall((prevBall) => {
        let newVx = prevBall.vx + x * SENSITIVITY;
        let newVy = prevBall.vy - y * SENSITIVITY; // Inverted Y axis

        // Apply friction
        newVx *= FRICTION;
        newVy *= FRICTION;

        let newX = prevBall.x + newVx;
        let newY = prevBall.y + newVy;

        // Boundary collision
        if (newX - BALL_RADIUS < 0) {
          newX = BALL_RADIUS;
          newVx = -newVx * 0.7;
        } else if (newX + BALL_RADIUS > SCREEN_WIDTH) {
          newX = SCREEN_WIDTH - BALL_RADIUS;
          newVx = -newVx * 0.7;
        }

        if (newY - BALL_RADIUS < 0) {
          newY = BALL_RADIUS;
          newVy = -newVy * 0.7;
        } else if (newY + BALL_RADIUS > SCREEN_HEIGHT - 100) {
          newY = SCREEN_HEIGHT - 100 - BALL_RADIUS;
          newVy = -newVy * 0.7;
        }

        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });
    });

    Accelerometer.setUpdateInterval(16); // ~60fps

    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, []);

  // Timer update
  useEffect(() => {
    if (!gameWon) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameWon, startTime]);

  // Check for collision with target
  useEffect(() => {
    if (!gameWon) {
      const distance = Math.sqrt(
        Math.pow(ball.x - target.x, 2) + Math.pow(ball.y - target.y, 2)
      );

      if (distance < BALL_RADIUS + target.radius) {
        setGameWon(true);
        const finalTime = Date.now() - startTime;
        setTimeout(() => {
          onGameComplete(finalTime);
        }, 500);
      }
    }
  }, [ball, target, gameWon, startTime, onGameComplete]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      </View>

      <View style={styles.gameArea}>
        {/* Target */}
        <View
          style={[
            styles.target,
            {
              left: target.x - target.radius,
              top: target.y - target.radius,
              width: target.radius * 2,
              height: target.radius * 2,
              borderRadius: target.radius,
            },
          ]}
        />

        {/* Ball */}
        <View
          style={[
            styles.ball,
            {
              left: ball.x - BALL_RADIUS,
              top: ball.y - BALL_RADIUS,
              width: BALL_RADIUS * 2,
              height: BALL_RADIUS * 2,
              borderRadius: BALL_RADIUS,
            },
          ]}
        />

        {gameWon && (
          <View style={styles.winMessage}>
            <Text style={styles.winText}>You Won!</Text>
          </View>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>Tilt your device to move the ball</Text>
        <Text style={styles.instructionText}>Guide it into the green target!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  target: {
    position: 'absolute',
    backgroundColor: '#34C759',
    opacity: 0.5,
    borderWidth: 3,
    borderColor: '#34C759',
  },
  winMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: 200,
  },
  winText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructions: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});
