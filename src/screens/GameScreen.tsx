import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Matter from 'matter-js';
import { useTiltControl, DEFAULT_TILT_SETTINGS, TiltSettings } from '../hooks/useTiltControl';
import { TILT_CONTROLS, clamp, roundToDecimals } from '../config/tiltControls';

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
  const [showSettings, setShowSettings] = useState(false);
  const [engine, setEngine] = useState<Matter.Engine | null>(null);
  
  // Tilt control settings (X-axis only)
  const [settings, setSettings] = useState<TiltSettings>({
    ...DEFAULT_TILT_SETTINGS,
  });
  
  const ballRef = useRef<Matter.Body | null>(null);
  const targetRef = useRef<Matter.Body | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  // Use the tilt control hook (X-axis only)
  useTiltControl({
    engine,
    enabled: !gameWon && engine !== null,
    settings,
  });

  useEffect(() => {
    // Create matter-js engine with constant downward gravity
    const newEngine = Matter.Engine.create({
      gravity: { x: 0, y: TILT_CONTROLS.CONSTANT_GRAVITY_Y, scale: 0.001 },
    });

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
    Matter.Composite.add(newEngine.world, [ball, target, ...walls]);

    // Collision detection for winning
    Matter.Events.on(newEngine, 'collisionStart', (event) => {
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
    Matter.Runner.run(runner, newEngine);
    
    // Set engine state to trigger tilt control hook
    setEngine(newEngine);

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

    return () => {
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      Matter.Engine.clear(newEngine);
      setEngine(null);
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

  // Settings adjustment helpers (X-axis only)
  const adjustSetting = useCallback((key: keyof TiltSettings, delta: number, min: number, max: number, decimals: number = 2) => {
    setSettings(prev => ({
      ...prev,
      [key]: roundToDecimals(clamp((prev[key] as number) + delta, min, max), decimals)
    }));
  }, []);

  const toggleInvertX = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      invertX: !prev.invertX
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_TILT_SETTINGS });
  }, []);

  // Get maze wall positions for rendering
  const mazeWalls = [
    { x: SCREEN_WIDTH * 0.25 - (SCREEN_WIDTH * 0.4) / 2, y: GAME_AREA_HEIGHT * 0.3 - 5, width: SCREEN_WIDTH * 0.4, height: 10 },
    { x: SCREEN_WIDTH * 0.75 - (SCREEN_WIDTH * 0.4) / 2, y: GAME_AREA_HEIGHT * 0.5 - 5, width: SCREEN_WIDTH * 0.4, height: 10 },
    { x: SCREEN_WIDTH * 0.3 - (SCREEN_WIDTH * 0.5) / 2, y: GAME_AREA_HEIGHT * 0.7 - 5, width: SCREEN_WIDTH * 0.5, height: 10 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header with Timer Pill */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {/* Timer as prominent pill/chip */}
        <View style={styles.timerPill}>
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
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
            <Text style={styles.winText}>🎉</Text>
            <Text style={styles.winSubtext}>You Won!</Text>
          </View>
        )}
      </View>

      {/* Modern Help Card */}
      <View style={styles.helpCard}>
        <View style={styles.helpRow}>
          <Text style={styles.helpIcon}>📱</Text>
          <Text style={styles.helpText}>Tilt left/right to move the ball</Text>
        </View>
        <View style={styles.helpRow}>
          <Text style={styles.helpIcon}>🎯</Text>
          <Text style={styles.helpText}>Reach the green target!</Text>
        </View>
      </View>

      {/* Settings Modal - X-axis only */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tilt Settings</Text>
            <Text style={styles.modalSubtitle}>Adjust horizontal (left/right) controls</Text>
            
            <ScrollView style={styles.settingsList}>
              {/* Inversion Setting - X-axis only */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Invert Direction</Text>
                  <Text style={styles.settingHint}>Swap left/right movement</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.toggleButton, settings.invertX && styles.toggleButtonActive]}
                  onPress={toggleInvertX}
                >
                  <Text style={styles.toggleButtonText}>{settings.invertX ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>

              {/* Sensitivity */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sensitivity</Text>
                  <Text style={styles.settingHint}>{settings.sensitivity.toFixed(1)}x</Text>
                </View>
                <View style={styles.adjustButtons}>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustSetting('sensitivity', -0.1, 0.3, 3.0, 1)}>
                    <Text style={styles.adjustButtonText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustSetting('sensitivity', 0.1, 0.3, 3.0, 1)}>
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Deadzone */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Deadzone</Text>
                  <Text style={styles.settingHint}>{settings.deadzone.toFixed(2)}</Text>
                </View>
                <View style={styles.adjustButtons}>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustSetting('deadzone', -0.01, 0.01, 0.15, 2)}>
                    <Text style={styles.adjustButtonText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustSetting('deadzone', 0.01, 0.01, 0.15, 2)}>
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Smoothing */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Smoothing</Text>
                  <Text style={styles.settingHint}>{settings.smoothingAlpha.toFixed(2)}</Text>
                </View>
                <View style={styles.adjustButtons}>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustSetting('smoothingAlpha', -0.05, 0.1, 0.8, 2)}>
                    <Text style={styles.adjustButtonText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustSetting('smoothingAlpha', 0.05, 0.1, 0.8, 2)}>
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSettings(false)}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
    fontVariant: ['tabular-nums'],
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 20,
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  target: {
    position: 'absolute',
    backgroundColor: '#10B981',
    opacity: 0.6,
    borderWidth: 3,
    borderColor: '#059669',
  },
  mazeWall: {
    position: 'absolute',
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  winMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -60 }],
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  winText: {
    fontSize: 48,
    marginBottom: 8,
  },
  winSubtext: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '700',
  },
  helpCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helpIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  settingsList: {
    maxHeight: 280,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  settingHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    minWidth: 70,
  },
  toggleButtonActive: {
    backgroundColor: '#10B981',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 16,
  },
  closeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
