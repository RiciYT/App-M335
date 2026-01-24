import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Matter from 'matter-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_TILT_SETTINGS, TiltSettings, useTiltControl } from '../hooks/useTiltControl';
import { clamp, roundToDecimals, TILT_CONTROLS } from '../config/tiltControls';
import { formatTime } from '../types';
import { IconButton, Button, NeonChip } from '../components/ui';
import { useTheme } from '../theme';
import { useAppSettings } from '../hooks/useAppSettings';

const { width, height } = Dimensions.get('window');

interface GameScreenProps {
  onGameComplete: (time: number) => void;
  onBack: () => void;
}

const SCREEN_WIDTH = width;
const GAME_AREA_HEIGHT = height - 240;
const BALL_RADIUS = 16;
const TARGET_RADIUS = 32;
const WALL_THICKNESS = 20;
const FALL_THRESHOLD = 120;
const FALL_RESET_DELAY_MS = 700;
const BALL_INITIAL_POSITION = { x: 50, y: 50 };

// Maze wall configuration - defines horizontal obstacle positions
const MAZE_WALL_CONFIG = {
  WALL_HEIGHT: 12,
  WALLS: [
    { xRatio: 0.25, yRatio: 0.3, widthRatio: 0.4 },  // Top-left wall
    { xRatio: 0.75, yRatio: 0.5, widthRatio: 0.4 },  // Middle-right wall
    { xRatio: 0.3, yRatio: 0.7, widthRatio: 0.5 },   // Bottom-left wall
  ],
};

export default function GameScreen({ onGameComplete, onBack }: GameScreenProps) {
  const { isDark } = useTheme();
  const [ballPosition, setBallPosition] = useState(BALL_INITIAL_POSITION);
  const [targetPosition] = useState({ 
    x: SCREEN_WIDTH - 80, 
    y: GAME_AREA_HEIGHT - 55 
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [ballFell, setBallFell] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [engine, setEngine] = useState<Matter.Engine | null>(null);
  const { vibrationEnabled } = useAppSettings();
  const vibrationEnabledRef = useRef(vibrationEnabled);
  
  const [settings, setSettings] = useState<TiltSettings>({
    ...DEFAULT_TILT_SETTINGS,
  });
  
  const ballRef = useRef<Matter.Body | null>(null);
  const targetRef = useRef<Matter.Body | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const gameWonRef = useRef(false);
  const ballFellRef = useRef(false);
  const fallHandledRef = useRef(false);
  const fallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useTiltControl({
    engine,
    enabled: !gameWon && engine !== null,
    settings,
  });

  useEffect(() => {
    vibrationEnabledRef.current = vibrationEnabled;
  }, [vibrationEnabled]);

  // Keep refs in sync with state
  useEffect(() => {
    gameWonRef.current = gameWon;
  }, [gameWon]);

  useEffect(() => {
    ballFellRef.current = ballFell;
  }, [ballFell]);

  // Function to reset ball position
  const resetBall = useCallback(() => {
    if (ballRef.current) {
      Matter.Body.setPosition(ballRef.current, BALL_INITIAL_POSITION);
      Matter.Body.setVelocity(ballRef.current, { x: 0, y: 0 });
    }
  }, []);

  useEffect(() => {
    // Create matter-js engine with constant downward gravity
    const newEngine = Matter.Engine.create({
      gravity: { x: 0, y: TILT_CONTROLS.CONSTANT_GRAVITY_Y, scale: 0.001 },
    });

    // Create the ball
    const ball = Matter.Bodies.circle(BALL_INITIAL_POSITION.x, BALL_INITIAL_POSITION.y, BALL_RADIUS, {
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
      // Inner maze walls - generated from config
      ...MAZE_WALL_CONFIG.WALLS.map(wall => 
        Matter.Bodies.rectangle(
          SCREEN_WIDTH * wall.xRatio,
          GAME_AREA_HEIGHT * wall.yRatio,
          SCREEN_WIDTH * wall.widthRatio,
          MAZE_WALL_CONFIG.WALL_HEIGHT,
          { isStatic: true, label: 'maze-wall' }
        )
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
            if (vibrationEnabledRef.current) {
              Vibration.vibrate(150);
            }
            const finalTime = Date.now() - startTime;
            setTimeout(() => {
              onGameComplete(finalTime);
            }, 500);
          }
        }
      });
    });

    const handleAfterUpdate = () => {
      if (!ballRef.current || gameWonRef.current || ballFellRef.current) return;
      if (ballRef.current.position.y > GAME_AREA_HEIGHT + FALL_THRESHOLD) {
        if (fallHandledRef.current) return;
        fallHandledRef.current = true;
        setBallFell(true);
        if (vibrationEnabledRef.current) {
          Vibration.vibrate(100);
        }
        fallTimeoutRef.current = setTimeout(() => {
          resetBall();
          setBallFell(false);
          fallHandledRef.current = false;
        }, FALL_RESET_DELAY_MS);
      }
    };

    Matter.Events.on(newEngine, 'afterUpdate', handleAfterUpdate);

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
      if (fallTimeoutRef.current) {
        clearTimeout(fallTimeoutRef.current);
      }
      Matter.Events.off(newEngine, 'afterUpdate', handleAfterUpdate);
      Matter.Engine.clear(newEngine);
      setEngine(null);
    };
  }, [onGameComplete, resetBall, startTime]);

  // Timer update
  useEffect(() => {
    if (!gameWon) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameWon, startTime]);


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

  // Calculate maze wall positions for rendering using config
  const mazeWalls = MAZE_WALL_CONFIG.WALLS.map(wall => ({
    x: SCREEN_WIDTH * wall.xRatio - (SCREEN_WIDTH * wall.widthRatio) / 2,
    y: GAME_AREA_HEIGHT * wall.yRatio - MAZE_WALL_CONFIG.WALL_HEIGHT / 2,
    width: SCREEN_WIDTH * wall.widthRatio,
    height: MAZE_WALL_CONFIG.WALL_HEIGHT,
  }));

  // Neon arcade grid for game area
  const GameGrid = () => (
    <View className="absolute inset-0 z-0" pointerEvents="none">
      {/* Horizontal scanlines */}
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.02 : 0.015 }}>
        {[...Array(Math.ceil(GAME_AREA_HEIGHT / 30))].map((_, i) => (
          <View 
            key={`h-${i}`} 
            className="absolute left-0 right-0 h-[1px]"
            style={{ 
              top: i * 30,
              backgroundColor: '#A855F7',
            }} 
          />
        ))}
      </View>
      {/* Vertical lines */}
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.015 : 0.01 }}>
        {[...Array(Math.ceil(SCREEN_WIDTH / 40))].map((_, i) => (
          <View 
            key={`v-${i}`} 
            className="absolute top-0 bottom-0 w-[1px]"
            style={{ 
              left: i * 40,
              backgroundColor: '#A855F7',
            }} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <View className={`flex-1 relative overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={isDark 
          ? ['#0C0118', '#150726', '#0C0118'] 
          : ['#FAF5FF', '#F3E8FF', '#FAF5FF']
        }
        className="absolute inset-0"
      />
      
      {/* Glow effects */}
      <View 
        className="absolute w-80 h-80 rounded-full"
        style={{
          top: -80,
          left: -60,
          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.08)',
        }}
      />
      <View 
        className="absolute w-72 h-72 rounded-full"
        style={{
          top: GAME_AREA_HEIGHT * 0.3,
          right: -80,
          backgroundColor: isDark ? 'rgba(244, 114, 182, 0.1)' : 'rgba(244, 114, 182, 0.06)',
        }}
      />
      <View 
        className="absolute w-96 h-96 rounded-full"
        style={{
          bottom: -100,
          left: -50,
          backgroundColor: isDark ? 'rgba(34, 211, 238, 0.08)' : 'rgba(34, 211, 238, 0.05)',
        }}
      />

      <SafeAreaView className="flex-1">
        {/* Header Section */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <IconButton
            icon={<Ionicons name="arrow-back" size={24} color={isDark ? '#FAF5FF' : '#1E1B4B'} />}
            onPress={onBack}
            size="md"
          />
          
          {/* Timer with neon glow */}
          <View 
            className={`px-5 py-2.5 rounded-2xl ${isDark ? 'bg-surface-dark/80' : 'bg-surface-light/90'}`}
            style={{
              borderWidth: 1,
              borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.25)',
              shadowColor: '#A855F7',
              shadowOpacity: isDark ? 0.3 : 0.15,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="stopwatch" size={20} color="#A855F7" style={{ marginRight: 8 }} />
              <Text 
                className={`font-black text-xl ${isDark ? 'text-ink-light' : 'text-ink'}`} 
                style={{ fontVariant: ['tabular-nums'], letterSpacing: -1 }}
              >
                {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
          
          <IconButton
            icon={<Ionicons name="pause" size={24} color={isDark ? '#FAF5FF' : '#1E1B4B'} />}
            onPress={() => setShowSettings(true)}
            size="md"
          />
        </View>

        <View className="flex-1">
          <View style={{ height: GAME_AREA_HEIGHT, width: SCREEN_WIDTH, position: 'relative' }}>
            <GameGrid />
            
            {/* Bottom edge/void indicator */}
            <LinearGradient
              colors={isDark 
                ? ['transparent', 'rgba(168, 85, 247, 0.15)'] 
                : ['transparent', 'rgba(168, 85, 247, 0.08)']
              }
              className="absolute bottom-0 left-0 right-0 h-12"
            />
            <View 
              className="absolute bottom-8 left-4 right-4 h-[2px]"
              style={{
                backgroundColor: isDark ? 'rgba(244, 114, 182, 0.4)' : 'rgba(244, 114, 182, 0.3)',
              }}
            />

            {/* Maze Walls with neon glow */}
            {mazeWalls.map((wall, index) => (
              <LinearGradient
                key={`wall-${index}`}
                colors={isDark ? ['#4C1D95', '#7C3AED'] : ['#DDD6FE', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute rounded-full"
                style={{
                  left: wall.x,
                  top: wall.y,
                  width: wall.width,
                  height: wall.height,
                  shadowColor: '#A855F7',
                  shadowOpacity: isDark ? 0.5 : 0.3,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 8,
                }}
              />
            ))}

            {/* Target with neon cyan glow */}
            <View
              className="absolute items-center justify-center"
              style={{
                left: targetPosition.x - TARGET_RADIUS,
                top: targetPosition.y - TARGET_RADIUS,
                width: TARGET_RADIUS * 2,
                height: TARGET_RADIUS * 2,
              }}
            >
              {/* Outer glow ring */}
              <View 
                className="absolute inset-[-4px] rounded-full"
                style={{
                  borderWidth: 2,
                  borderColor: 'rgba(34, 211, 238, 0.3)',
                }}
              />
              <View 
                className="w-full h-full rounded-full bg-mint/15 border-2 border-mint items-center justify-center"
                style={{
                  shadowColor: '#22D3EE',
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 16,
                  shadowOpacity: 0.7,
                }}
              >
                <View className="w-5 h-5 rounded-full bg-mint" />
              </View>
            </View>

            {/* Ball with violet/pink gradient and glow */}
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute rounded-full"
              style={{
                left: ballPosition.x - BALL_RADIUS,
                top: ballPosition.y - BALL_RADIUS,
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2,
                shadowColor: '#A855F7',
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
              }}
            >
              {/* Inner highlight */}
              <View 
                className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/40"
              />
            </LinearGradient>

            {gameWon && (
              <View className="absolute inset-0 items-center justify-center bg-black/60">
                <View 
                  className={`items-center p-8 rounded-3xl ${isDark ? 'bg-surface-dark/90' : 'bg-surface-light/95'}`}
                  style={{
                    borderWidth: 2,
                    borderColor: '#22D3EE',
                    shadowColor: '#22D3EE',
                    shadowOpacity: 0.5,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 24,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={80} color="#22D3EE" style={{ marginBottom: 16 }} />
                  <Text className="text-mint text-3xl font-black tracking-tight">Victory!</Text>
                </View>
              </View>
            )}

            {ballFell && !gameWon && (
              <View className="absolute inset-0 items-center justify-center bg-black/50">
                <View 
                  className={`items-center p-6 rounded-3xl ${isDark ? 'bg-surface-dark/90' : 'bg-surface-light/95'}`}
                  style={{
                    borderWidth: 2,
                    borderColor: '#F472B6',
                    shadowColor: '#F472B6',
                    shadowOpacity: 0.5,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 20,
                  }}
                >
                  <Ionicons name="alert-circle" size={60} color="#F472B6" style={{ marginBottom: 8 }} />
                  <Text className="text-secondary text-xl font-black">Oops!</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer Info - Compact with Neon Chips */}
        <View className="px-5 pb-3">
          <View
            className={`px-2 py-1.5 rounded-xl flex-row justify-around items-center ${isDark ? 'bg-surface-dark/60' : 'bg-surface-light/80'}`}
            style={{
              borderWidth: 1,
              borderColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)',
              height: 44,
            }}
          >
            <NeonChip icon="phone-portrait" variant="primary" size="sm">
              Tilt
            </NeonChip>
            <View className="w-[1px] h-6 bg-primary/20" />
            <NeonChip icon="locate" variant="mint" size="sm">
              Target
            </NeonChip>
          </View>
        </View>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettings(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View 
              className={`rounded-3xl p-6 w-full max-h-[75%] ${
                isDark ? 'bg-surface-dark' : 'bg-surface-light'
              }`}
              style={{
                borderWidth: 2,
                borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
                shadowColor: '#A855F7',
                shadowOpacity: isDark ? 0.4 : 0.2,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 24,
              }}
            >
              <Text 
                className={`text-2xl font-black text-center mb-1 tracking-tight ${isDark ? 'text-ink-light' : 'text-ink'}`}
                style={{
                  textShadowColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                }}
              >
                Controls
              </Text>
              <Text className={`text-xs font-bold text-center mb-6 uppercase tracking-[2px] ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                Customize tilt sensitivity
              </Text>
              
              <ScrollView className="max-h-[280px]" showsVerticalScrollIndicator={false}>
                {/* Inversion Setting */}
                <View className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-border-dark/30' : 'border-border/30'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Invert Direction
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      Swap left/right
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={toggleInvertX}
                    className={`px-5 py-2.5 rounded-2xl ${settings.invertX ? 'bg-primary' : isDark ? 'bg-surface-muted-dark' : 'bg-surface-muted'}`}
                    style={{
                      shadowColor: settings.invertX ? '#A855F7' : 'transparent',
                      shadowOpacity: 0.4,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 8,
                    }}
                  >
                    <Text className={`font-black text-sm ${settings.invertX ? 'text-white' : isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.invertX ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sensitivity */}
                <View className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-border-dark/30' : 'border-border/30'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Sensitivity
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.sensitivity.toFixed(1)}x
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-xl bg-primary/20 items-center justify-center"
                      onPress={() => adjustSetting('sensitivity', -0.1, 0.3, 3.0, 1)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Ionicons name="remove" size={20} color="#A855F7" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-xl bg-primary/20 items-center justify-center"
                      onPress={() => adjustSetting('sensitivity', 0.1, 0.3, 3.0, 1)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Ionicons name="add" size={20} color="#A855F7" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Deadzone */}
                <View className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-border-dark/30' : 'border-border/30'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Deadzone
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.deadzone.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-xl bg-primary/20 items-center justify-center"
                      onPress={() => adjustSetting('deadzone', -0.01, 0.01, 0.15, 2)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Ionicons name="remove" size={20} color="#A855F7" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-xl bg-primary/20 items-center justify-center"
                      onPress={() => adjustSetting('deadzone', 0.01, 0.01, 0.15, 2)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Ionicons name="add" size={20} color="#A855F7" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Smoothing */}
                <View className={`flex-row justify-between items-center py-4 ${
                  isDark ? 'border-border-dark/30' : 'border-border/30'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Smoothing
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.smoothingAlpha.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-xl bg-primary/20 items-center justify-center"
                      onPress={() => adjustSetting('smoothingAlpha', -0.05, 0.1, 0.8, 2)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Ionicons name="remove" size={20} color="#A855F7" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-xl bg-primary/20 items-center justify-center"
                      onPress={() => adjustSetting('smoothingAlpha', 0.05, 0.1, 0.8, 2)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Ionicons name="add" size={20} color="#A855F7" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View className="flex-row gap-3 mt-6">
                <View className="flex-1">
                  <Button
                    variant="outline"
                    size="md"
                    onPress={resetSettings}
                  >
                    Reset
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    variant="primary"
                    size="md"
                    onPress={() => setShowSettings(false)}
                  >
                    Done
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

