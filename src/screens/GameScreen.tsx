import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Matter from 'matter-js';

interface GameScreenProps {
  onGameComplete: (time: number) => void;
  onBack: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT - 200; // Subtract header and footer
const BALL_RADIUS = 15;
const TARGET_RADIUS = 30;
const WALL_THICKNESS = 20;

export default function GameScreen({ onGameComplete, onBack }: GameScreenProps) {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [targetPosition] = useState({ 
    x: SCREEN_WIDTH - 80, 
    y: GAME_AREA_HEIGHT - 80 
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const targetRef = useRef<Matter.Body | null>(null);
  const subscription = useRef<any>(null);
  const runnerRef = useRef<any>(null);

  useEffect(() => {
    // Create matter-js engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0.001 }, // No default gravity, we control it
    });
    engineRef.current = engine;

    // Create the ball
    const ball = Matter.Bodies.circle(50, 50, BALL_RADIUS, {
      restitution: 0.7, // Bounciness
      friction: 0.05,
      frictionAir: 0.02,
      label: 'ball',
    });
    ballRef.current = ball;

    // Create the target (static sensor)
    const target = Matter.Bodies.circle(
      SCREEN_WIDTH - 80,
      GAME_AREA_HEIGHT - 80,
      TARGET_RADIUS,
      {
        isStatic: true,
        isSensor: true, // It doesn't collide physically
        label: 'target',
      }
    );
    targetRef.current = target;

    // Create walls
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(
        SCREEN_WIDTH / 2,
        -WALL_THICKNESS / 2,
        SCREEN_WIDTH + WALL_THICKNESS * 2,
        WALL_THICKNESS,
        { isStatic: true, label: 'wall' }
      ),
      // Bottom wall
      Matter.Bodies.rectangle(
        SCREEN_WIDTH / 2,
        GAME_AREA_HEIGHT + WALL_THICKNESS / 2,
        SCREEN_WIDTH + WALL_THICKNESS * 2,
        WALL_THICKNESS,
        { isStatic: true, label: 'wall' }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        -WALL_THICKNESS / 2,
        GAME_AREA_HEIGHT / 2,
        WALL_THICKNESS,
        GAME_AREA_HEIGHT + WALL_THICKNESS * 2,
        { isStatic: true, label: 'wall' }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        SCREEN_WIDTH + WALL_THICKNESS / 2,
        GAME_AREA_HEIGHT / 2,
        WALL_THICKNESS,
        GAME_AREA_HEIGHT + WALL_THICKNESS * 2,
        { isStatic: true, label: 'wall' }
      ),
      // Inner maze walls - horizontal
      Matter.Bodies.rectangle(
        SCREEN_WIDTH * 0.25,
        GAME_AREA_HEIGHT * 0.3,
        SCREEN_WIDTH * 0.4,
        10,
        { isStatic: true, label: 'maze-wall' }
      ),
      Matter.Bodies.rectangle(
        SCREEN_WIDTH * 0.75,
        GAME_AREA_HEIGHT * 0.5,
        SCREEN_WIDTH * 0.4,
        10,
        { isStatic: true, label: 'maze-wall' }
      ),
      Matter.Bodies.rectangle(
        SCREEN_WIDTH * 0.3,
        GAME_AREA_HEIGHT * 0.7,
        SCREEN_WIDTH * 0.5,
        10,
        { isStatic: true, label: 'maze-wall' }
      ),
    ];

    // Add all bodies to the world
    Matter.Composite.add(engine.world, [ball, target, ...walls]);

    // Collision detection for winning
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if (
          (bodyA.label === 'ball' && bodyB.label === 'target') ||
          (bodyA.label === 'target' && bodyB.label === 'ball')
        ) {
          if (!gameWon) {
            setGameWon(true);
            const finalTime = Date.now() - startTime;
            setTimeout(() => {
              onGameComplete(finalTime);
            }, 500);
          }
        }
      });
    });

    // Start the physics engine
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // Update ball position for rendering
    const updatePosition = () => {
      if (ballRef.current) {
        setBallPosition({
          x: ballRef.current.position.x,
          y: ballRef.current.position.y,
        });
      }
      if (!gameWon) {
        requestAnimationFrame(updatePosition);
      }
    };
    requestAnimationFrame(updatePosition);

    // Subscribe to accelerometer
    subscription.current = Accelerometer.addListener((accelerometerData) => {
      const { x, y } = accelerometerData;
      
      if (ballRef.current && engineRef.current) {
        // Apply force based on device tilt
        const forceMagnitude = 0.0015;
        Matter.Body.applyForce(ballRef.current, ballRef.current.position, {
          x: x * forceMagnitude,
          y: -y * forceMagnitude, // Inverted Y axis
        });
      }
    });

    Accelerometer.setUpdateInterval(16); // ~60fps

    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, [gameWon, onGameComplete, startTime]);

  // Timer update
  useEffect(() => {
    if (!gameWon) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameWon, startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  // Get maze wall positions for rendering
  const mazeWalls = [
    { x: SCREEN_WIDTH * 0.25 - (SCREEN_WIDTH * 0.4) / 2, y: GAME_AREA_HEIGHT * 0.3 - 5, width: SCREEN_WIDTH * 0.4, height: 10 },
    { x: SCREEN_WIDTH * 0.75 - (SCREEN_WIDTH * 0.4) / 2, y: GAME_AREA_HEIGHT * 0.5 - 5, width: SCREEN_WIDTH * 0.4, height: 10 },
    { x: SCREEN_WIDTH * 0.3 - (SCREEN_WIDTH * 0.5) / 2, y: GAME_AREA_HEIGHT * 0.7 - 5, width: SCREEN_WIDTH * 0.5, height: 10 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      </View>

      <View style={[styles.gameArea, { height: GAME_AREA_HEIGHT }]}>
        {/* Maze Walls */}
        {mazeWalls.map((wall, index) => (
          <View
            key={`wall-${index}`}
            style={[
              styles.mazeWall,
              {
                left: wall.x,
                top: wall.y,
                width: wall.width,
                height: wall.height,
              },
            ]}
          />
        ))}

        {/* Target */}
        <View
          style={[
            styles.target,
            {
              left: targetPosition.x - TARGET_RADIUS,
              top: targetPosition.y - TARGET_RADIUS,
              width: TARGET_RADIUS * 2,
              height: TARGET_RADIUS * 2,
              borderRadius: TARGET_RADIUS,
            },
          ]}
        />

        {/* Ball */}
        <View
          style={[
            styles.ball,
            {
              left: ballPosition.x - BALL_RADIUS,
              top: ballPosition.y - BALL_RADIUS,
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
        <Text style={styles.instructionText}>Navigate through the maze to the green target!</Text>
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
  mazeWall: {
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: 2,
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
