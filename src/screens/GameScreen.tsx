import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Matter from 'matter-js';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_TILT_SETTINGS, TiltSettings, useTiltControl } from '../hooks/useTiltControl';
import { clamp, roundToDecimals, TILT_CONTROLS } from '../config/tiltControls';
import { formatTime, AppSettings } from '../types';
import { IconButton, Card, Button } from '../components/ui';
import { useTheme } from '../theme';

const { width, height } = Dimensions.get('window');

interface GameScreenProps {
  onGameComplete: (time: number) => void;
  onBack: () => void;
}

const SCREEN_WIDTH = width;
const GAME_AREA_HEIGHT = height - 220; // Adjusted for new header/footer
const BALL_RADIUS = 15;
const TARGET_RADIUS = 30;
const WALL_THICKNESS = 20;
const FALL_THRESHOLD = 120; // Distance below GAME_AREA_HEIGHT before treating the ball as fallen
const FALL_RESET_DELAY_MS = 700;
const SETTINGS_KEY = '@tiltmaze_settings';

export default function GameScreen({ onGameComplete, onBack }: GameScreenProps) {
  const { isDark } = useTheme();
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
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
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  const [settings, setSettings] = useState<TiltSettings>({
    ...DEFAULT_TILT_SETTINGS,
  });
  
  const ballRef = useRef<Matter.Body | null>(null);
  const targetRef = useRef<Matter.Body | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const fallHandledRef = useRef(false);
  const gameWonRef = useRef(false);
  const ballFellRef = useRef(false);
  const vibrationEnabledRef = useRef(true);
  const fallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetBall = useCallback(() => {
    if (!ballRef.current) return;
    Matter.Body.setPosition(ballRef.current, { x: 50, y: 50 });
    Matter.Body.setVelocity(ballRef.current, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(ballRef.current, 0);
  }, []);

  useTiltControl({
    engine,
    enabled: !gameWon && !ballFell && engine !== null,
    settings,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings) as AppSettings;
          const enabled = parsed.vibrationEnabled ?? true;
          setVibrationEnabled(enabled);
          vibrationEnabledRef.current = enabled;
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    gameWonRef.current = gameWon;
  }, [gameWon]);

  useEffect(() => {
    ballFellRef.current = ballFell;
  }, [ballFell]);

  useEffect(() => {
    vibrationEnabledRef.current = vibrationEnabled;
  }, [vibrationEnabled]);

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

  // Get maze wall positions for rendering
  const mazeWalls = [
    { x: SCREEN_WIDTH * 0.25 - (SCREEN_WIDTH * 0.4) / 2, y: GAME_AREA_HEIGHT * 0.3 - 5, width: SCREEN_WIDTH * 0.4, height: 10 },
    { x: SCREEN_WIDTH * 0.75 - (SCREEN_WIDTH * 0.4) / 2, y: GAME_AREA_HEIGHT * 0.5 - 5, width: SCREEN_WIDTH * 0.4, height: 10 },
    { x: SCREEN_WIDTH * 0.3 - (SCREEN_WIDTH * 0.5) / 2, y: GAME_AREA_HEIGHT * 0.7 - 5, width: SCREEN_WIDTH * 0.5, height: 10 },
  ];

  const GridBackground = () => (
    <View className="absolute inset-0 z-0" pointerEvents="none">
      <View className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}>
        {[...Array(20)].map((_, i) => (
          <View 
            key={`v-${i}`} 
            className={`absolute top-0 bottom-0 w-[1px] ${isDark ? 'bg-ink-light' : 'bg-ink'}`} 
            style={{ left: i * (width / 10) }} 
          />
        ))}
        {[...Array(40)].map((_, i) => (
          <View 
            key={`h-${i}`} 
            className={`absolute left-0 right-0 h-[1px] ${isDark ? 'bg-ink-light' : 'bg-ink'}`} 
            style={{ top: i * (width / 10) }} 
          />
        ))}
      </View>
    </View>
  );

  const glowOpacity = isDark ? 'opacity-10' : 'opacity-20';

  return (
    <View className={`flex-1 relative overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GridBackground />
      
      {/* Glow effects */}
      <View className={`absolute -top-[10%] -left-[15%] w-72 h-72 bg-primary ${glowOpacity} rounded-full`} />
      <View className={`absolute top-[20%] -right-[20%] w-64 h-64 bg-secondary ${glowOpacity} rounded-full`} />
      <View className={`absolute -bottom-[15%] -right-[10%] w-80 h-80 bg-accent ${glowOpacity} rounded-full`} />

      <SafeAreaView className="flex-1">
        {/* Header Section */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <IconButton
            icon={<Text className={`text-2xl ${isDark ? 'text-ink-light' : 'text-ink'}`}>←</Text>}
            onPress={onBack}
            size="md"
          />
          
          <Card variant="default" className="px-4 py-2 rounded-3xl">
            <View className="flex-row items-center">
              <Text className="mr-2 text-lg">⏱</Text>
              <Text className={`font-bold text-lg ${isDark ? 'text-ink-light' : 'text-ink'}`} style={{ fontVariant: ['tabular-nums'] }}>
                {formatTime(elapsedTime)}
              </Text>
            </View>
          </Card>
          
          <IconButton
            icon={<Text className="text-xl">⚙️</Text>}
            onPress={() => setShowSettings(true)}
            size="md"
          />
        </View>

        <View className="flex-1">
          <View style={{ height: GAME_AREA_HEIGHT, width: SCREEN_WIDTH, position: 'relative' }}>
            <View className={`absolute bottom-0 left-0 right-0 h-8 ${isDark ? 'bg-slate-700/70' : 'bg-slate-200/70'}`} />
            <View className={`absolute bottom-6 left-0 right-0 h-[2px] ${isDark ? 'bg-slate-600/60' : 'bg-slate-300/60'}`} />

            {/* Maze Walls */}
            {mazeWalls.map((wall, index) => (
              <View
                key={`wall-${index}`}
                className={`absolute rounded-full shadow-lg ${isDark ? 'bg-slate-500' : 'bg-slate-300'}`}
                style={{
                  left: wall.x,
                  top: wall.y,
                  width: wall.width,
                  height: wall.height,
                }}
              />
            ))}

            {/* Target */}
            <View
              className="absolute items-center justify-center"
              style={{
                left: targetPosition.x - TARGET_RADIUS,
                top: targetPosition.y - TARGET_RADIUS,
                width: TARGET_RADIUS * 2,
                height: TARGET_RADIUS * 2,
              }}
            >
              <View 
                className="w-full h-full rounded-full bg-mint/20 border-2 border-mint items-center justify-center"
                style={{
                  shadowColor: '#56D1B7',
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 12,
                  shadowOpacity: 0.6,
                }}
              >
                <View className="w-4 h-4 rounded-full bg-mint" />
              </View>
            </View>

            {/* Ball */}
            <LinearGradient
              colors={['#2EC4C6', '#7FB5FF']}
              className="absolute rounded-full shadow-lg"
              style={{
                left: ballPosition.x - BALL_RADIUS,
                top: ballPosition.y - BALL_RADIUS,
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2,
                shadowColor: '#2EC4C6',
                shadowOpacity: 0.5,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
              }}
            />

            {gameWon && (
              <View className="absolute inset-0 items-center justify-center bg-black/50">
                <Card variant="elevated" className="items-center p-8">
                  <Text className="text-6xl mb-3">🎉</Text>
                  <Text className="text-mint text-2xl font-black">You Won!</Text>
                </Card>
              </View>
            )}

            {ballFell && !gameWon && (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <Card variant="elevated" className="items-center p-6">
                  <Text className="text-5xl mb-2">💥</Text>
                  <Text className="text-primary text-xl font-black">You Fell!</Text>
                </Card>
              </View>
            )}
          </View>
        </View>

        {/* Footer Info */}
        <View className="px-5 pb-5">
          <Card variant="default" className="p-4">
            <View className="flex-row items-center mb-2">
              <Text className="mr-2 text-primary">📱</Text>
              <Text className={`text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-ink-muted-light' : 'text-ink-muted'
              }`}>
                Tilt to move the ball
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-mint">🎯</Text>
              <Text className={`text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-ink-muted-light' : 'text-ink-muted'
              }`}>
                Reach the emerald target
              </Text>
            </View>
          </Card>
        </View>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettings(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className={`rounded-4xl p-6 w-full max-h-[75%] shadow-2xl ${
              isDark ? 'bg-surface-dark border border-border-dark' : 'bg-surface-light border border-border'
            }`}>
              <Text className={`text-2xl font-black text-center mb-1 ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                Tilt Settings
              </Text>
              <Text className={`text-sm text-center mb-6 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                Adjust horizontal controls
              </Text>
              
              <ScrollView className="max-h-[280px]" showsVerticalScrollIndicator={false}>
                {/* Inversion Setting */}
                <View className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-border-dark' : 'border-border'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Invert Direction
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      Swap left/right movement
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={toggleInvertX}
                    className={`px-5 py-2.5 rounded-full ${settings.invertX ? 'bg-mint' : isDark ? 'bg-surface-muted-dark' : 'bg-surface-muted'}`}
                  >
                    <Text className={`font-bold text-sm ${settings.invertX ? 'text-white' : isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.invertX ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sensitivity */}
                <View className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-border-dark' : 'border-border'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Sensitivity
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.sensitivity.toFixed(1)}x
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center"
                      onPress={() => adjustSetting('sensitivity', -0.1, 0.3, 3.0, 1)}
                    >
                      <Text className="text-primary font-bold text-lg">−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center"
                      onPress={() => adjustSetting('sensitivity', 0.1, 0.3, 3.0, 1)}
                    >
                      <Text className="text-primary font-bold text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Deadzone */}
                <View className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-border-dark' : 'border-border'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Deadzone
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.deadzone.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center"
                      onPress={() => adjustSetting('deadzone', -0.01, 0.01, 0.15, 2)}
                    >
                      <Text className="text-primary font-bold text-lg">−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center"
                      onPress={() => adjustSetting('deadzone', 0.01, 0.01, 0.15, 2)}
                    >
                      <Text className="text-primary font-bold text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Smoothing */}
                <View className={`flex-row justify-between items-center py-4 ${
                  isDark ? 'border-border-dark' : 'border-border'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                      Smoothing
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
                      {settings.smoothingAlpha.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center"
                      onPress={() => adjustSetting('smoothingAlpha', -0.05, 0.1, 0.8, 2)}
                    >
                      <Text className="text-primary font-bold text-lg">−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center"
                      onPress={() => adjustSetting('smoothingAlpha', 0.05, 0.1, 0.8, 2)}
                    >
                      <Text className="text-primary font-bold text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View className="flex-row gap-4 mt-6">
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

