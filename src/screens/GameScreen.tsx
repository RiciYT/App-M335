import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Text, View, Vibration, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Matter from 'matter-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TILT_CONTROLS, lerp } from '../config/tiltControls';
import { startTilt, getTiltX, calibrateTilt, stopTilt } from '../input/tiltInput';
import { formatTime } from '../types';
import { IconButton } from '../components/ui';
import { useAppSettings } from '../hooks/useAppSettings';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

const { width, height } = Dimensions.get('window');

interface GameScreenProps {
  onGameComplete: (time: number) => void;
  onBack: () => void;
}

const SCREEN_WIDTH = width;
const HUD_HEIGHT = 140;
const GAME_AREA_HEIGHT = height - HUD_HEIGHT;
const BALL_RADIUS = 16;
const TARGET_RADIUS = 32;
const WALL_THICKNESS = 20;
const BOTTOM_EDGE_OFFSET = 20;
const BOTTOM_EDGE_GRADIENT = 80;
const FALL_THRESHOLD = 120;
const FALL_RESET_DELAY_MS = 700;
const BALL_INITIAL_POSITION = { x: 60, y: 60 };

// Maze wall configuration - defines horizontal obstacle positions
const MAZE_WALL_CONFIG = {
  WALL_HEIGHT: 12,
  WALLS: [
    { xRatio: 0.28, yRatio: 0.16, widthRatio: 0.56 }, // Zig 1 (left to center)
    { xRatio: 0.72, yRatio: 0.26, widthRatio: 0.56 }, // Zag 1 (right to center)
    { xRatio: 0.28, yRatio: 0.36, widthRatio: 0.56 }, // Zig 2
    { xRatio: 0.72, yRatio: 0.46, widthRatio: 0.56 }, // Zag 2
    { xRatio: 0.28, yRatio: 0.56, widthRatio: 0.56 }, // Zig 3
    { xRatio: 0.72, yRatio: 0.66, widthRatio: 0.56 }, // Zag 3
    { xRatio: 0.28, yRatio: 0.76, widthRatio: 0.56 }, // Zig 4
    { xRatio: 0.72, yRatio: 0.84, widthRatio: 0.56 }, // Zag 4 (near goal)
  ],
};

export default function GameScreen({ onGameComplete, onBack }: GameScreenProps) {
  const [ballPosition, setBallPosition] = useState(BALL_INITIAL_POSITION);
  const [targetPosition] = useState({ 
    x: SCREEN_WIDTH - 90, 
    y: GAME_AREA_HEIGHT - 35 
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [ballFell, setBallFell] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [targetBroken, setTargetBroken] = useState(false);
  const [ballBroken, setBallBroken] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const { vibrationEnabled, sensitivity, invertX, deadzone, smoothingAlpha } = useAppSettings();
  const vibrationEnabledRef = useRef(vibrationEnabled);
  const calibratedRef = useRef(false);
  const displayTiltRef = useRef(0);

  const ballRef = useRef<Matter.Body | null>(null);
  const targetRef = useRef<Matter.Body | null>(null);
  const rafRef = useRef<number | null>(null);
  const gameWonRef = useRef(false);
  const ballFellRef = useRef(false);
  const fallHandledRef = useRef(false);
  const fallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterAnim = useRef(new Animated.Value(0)).current;
  const targetPulse = useRef(new Animated.Value(0)).current;
  const targetBreakAnim = useRef(new Animated.Value(0)).current;
  const ballBreakAnim = useRef(new Animated.Value(0)).current;
  const onGroundRef = useRef(false);
  const lastGroundedAtRef = useRef(0);

  useEffect(() => {
    startTilt({
      invertX,
      smoothingAlpha,
      deadzone,
      curvePower: TILT_CONTROLS.CURVE_POWER,
      updateInterval: TILT_CONTROLS.UPDATE_INTERVAL,
    });

    if (!calibratedRef.current) {
      calibrateTilt();
      calibratedRef.current = true;
    }

    return () => {
      stopTilt();
    };
  }, [invertX, deadzone, smoothingAlpha]);

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

  const applyTiltToBall = useCallback((ball: Matter.Body, tiltValue: number) => {
    if (!ball) return;
    const forceX = tiltValue * TILT_CONTROLS.FORCE * sensitivity;
    if (forceX === 0) return;
    const vx = ball.velocity.x;
    if ((vx > TILT_CONTROLS.MAX_VX && forceX > 0) || (vx < -TILT_CONTROLS.MAX_VX && forceX < 0)) {
      return;
    }
    Matter.Body.applyForce(ball, ball.position, { x: forceX, y: 0 });
  }, [sensitivity]);

  useEffect(() => {
    // Create matter-js engine with constant downward gravity
    const newEngine = Matter.Engine.create({
      gravity: { x: 0, y: TILT_CONTROLS.CONSTANT_GRAVITY_Y, scale: 0.001 },
    });

    // Create the ball
    const ball = Matter.Bodies.circle(BALL_INITIAL_POSITION.x, BALL_INITIAL_POSITION.y, BALL_RADIUS, {
      restitution: TILT_CONTROLS.BALL_RESTITUTION,
      friction: TILT_CONTROLS.BALL_FRICTION,
      frictionAir: TILT_CONTROLS.BALL_FRICTION_AIR,
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
      // Bottom wall
      Matter.Bodies.rectangle(
        SCREEN_WIDTH / 2,
        GAME_AREA_HEIGHT - BOTTOM_EDGE_OFFSET,
        SCREEN_WIDTH + WALL_THICKNESS * 2,
        WALL_THICKNESS,
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

    const updateGrounded = (pairs: Matter.Pair[]) => {
      let grounded = false;
      pairs.forEach(({ bodyA, bodyB }) => {
        const ballBody = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
        const otherBody = ballBody === bodyA ? bodyB : ballBody === bodyB ? bodyA : null;
        if (!ballBody || !otherBody) return;
        if (otherBody.label !== 'wall' && otherBody.label !== 'maze-wall') return;
        const dy = otherBody.position.y - ballBody.position.y;
        if (dy >= BALL_RADIUS * 0.5) {
          grounded = true;
        }
      });
      onGroundRef.current = grounded;
      if (grounded) {
        lastGroundedAtRef.current = Date.now();
      }
    };

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
            setTargetBroken(true);
            setBallBroken(true);
            if (vibrationEnabledRef.current) {
              Vibration.vibrate(150);
            }
            const finalTime = Date.now() - startTime;
            setTimeout(() => {
              onGameComplete(finalTime);
            }, 900);
          }
        }
      });
      updateGrounded(event.pairs);
    });

    Matter.Events.on(newEngine, 'collisionActive', (event) => {
      updateGrounded(event.pairs);
    });

    Matter.Events.on(newEngine, 'collisionEnd', (event) => {
      updateGrounded(event.pairs);
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

    // Manual game loop with fixed timestep (16.667 ms)
    let lastTs = 0;
    let accumulator = 0;
    const fixedDt = TILT_CONTROLS.MAX_DT_MS;
    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const rawDt = ts - lastTs;
      lastTs = ts;
      accumulator += Math.min(rawDt || fixedDt, fixedDt * 4);

      const currentTilt = getTiltX();
      displayTiltRef.current = lerp(displayTiltRef.current, currentTilt, 0.6);
      setTiltX(displayTiltRef.current);

      if (ballRef.current && !gameWonRef.current) {
        applyTiltToBall(ballRef.current, currentTilt);
      }

      while (accumulator >= fixedDt) {
        Matter.Engine.update(newEngine, fixedDt);
        accumulator -= fixedDt;
      }

      if (ballRef.current) {
        setBallPosition({
          x: ballRef.current.position.x,
          y: ballRef.current.position.y,
        });
      }

      if (!gameWonRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (fallTimeoutRef.current) {
        clearTimeout(fallTimeoutRef.current);
      }
      Matter.Events.off(newEngine, 'afterUpdate', handleAfterUpdate);
      Matter.Events.off(newEngine, 'collisionStart');
      Matter.Events.off(newEngine, 'collisionActive');
      Matter.Events.off(newEngine, 'collisionEnd');
      Matter.Engine.clear(newEngine);
    };
  }, [applyTiltToBall, onGameComplete, resetBall, startTime]);

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [enterAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(targetPulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(targetPulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [targetPulse]);

  useEffect(() => {
    if (!targetBroken) return;
    Animated.timing(targetBreakAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [targetBroken, targetBreakAnim]);

  useEffect(() => {
    if (!ballBroken) return;
    Animated.timing(ballBreakAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [ballBroken, ballBreakAnim]);

  // Timer update
  useEffect(() => {
    if (!gameWon && !isPaused) {
      let rafId = 0;
      let last = 0;
      const tick = (ts: number) => {
        if (!last || ts - last >= 33) {
          last = ts;
          setElapsedTime(Date.now() - startTime);
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, [gameWon, isPaused, startTime]);

  // Calculate maze wall positions for rendering using config
  const mazeWalls = MAZE_WALL_CONFIG.WALLS.map(wall => ({
    x: SCREEN_WIDTH * wall.xRatio - (SCREEN_WIDTH * wall.widthRatio) / 2,
    y: GAME_AREA_HEIGHT * wall.yRatio - MAZE_WALL_CONFIG.WALL_HEIGHT / 2,
    width: SCREEN_WIDTH * wall.widthRatio,
    height: MAZE_WALL_CONFIG.WALL_HEIGHT,
  }));

  // Neon arcade grid for game area
  const GameGrid = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {/* Horizontal scanlines */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.02 }}>
        {[...Array(Math.ceil(GAME_AREA_HEIGHT / 30))].map((_, i) => (
          <View 
            key={`h-${i}`} 
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 1,
              top: i * 30,
              backgroundColor: NEON_CYAN,
            }}
          />
        ))}
      </View>
      {/* Vertical lines */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.015 }}>
        {[...Array(Math.ceil(SCREEN_WIDTH / 40))].map((_, i) => (
          <View 
            key={`v-${i}`} 
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 1,
              left: i * 40,
              backgroundColor: NEON_CYAN,
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: DEEP_NAVY }}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={[DEEP_NAVY, '#0a1520', DEEP_NAVY]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Glow effects */}
      <View 
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: 160,
          top: -80,
          left: -60,
          backgroundColor: 'rgba(0, 242, 255, 0.08)',
        }}
      />
      <View 
        style={{
          position: 'absolute',
          width: 288,
          height: 288,
          borderRadius: 144,
          top: GAME_AREA_HEIGHT * 0.3,
          right: -80,
          backgroundColor: 'rgba(0, 242, 255, 0.05)',
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: enterAnim,
            transform: [
              {
                translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
              },
            ],
          }}
        >
        {/* Header Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: 'rgba(0, 242, 255, 0.3)',
              backgroundColor: 'rgba(0, 242, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 28,
                height: 2,
                borderRadius: 2,
                backgroundColor: NEON_CYAN,
                transform: [{ rotate: `${tiltX * 25}deg` }],
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 6,
              }}
            />
          </View>
          
          {/* Timer with neon glow */}
          <View 
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 16,
              backgroundColor: 'rgba(0, 242, 255, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(0, 242, 255, 0.3)',
              shadowColor: NEON_CYAN,
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="stopwatch" size={20} color={NEON_CYAN} style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontWeight: '900',
                  fontSize: 20,
                  color: NEON_CYAN,
                  fontVariant: ['tabular-nums'],
                  letterSpacing: -1
                }}
              >
                {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
          
          <IconButton
            icon={<Ionicons name="pause" size={24} color={NEON_CYAN} />}
            onPress={() => setIsPaused(true)}
            size="md"
          />
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{ height: GAME_AREA_HEIGHT, width: SCREEN_WIDTH, position: 'relative' }}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {
              if (isPaused || gameWon || !ballRef.current) return;
              const now = Date.now();
              const recentlyGrounded = now - lastGroundedAtRef.current < 80;
              const slowVertical = Math.abs(ballRef.current.velocity.y) < 0.2;
              if (!(onGroundRef.current && recentlyGrounded && slowVertical)) return;
              Matter.Body.applyForce(ballRef.current, ballRef.current.position, { x: 0, y: -0.015 });
              if (vibrationEnabledRef.current) {
                Vibration.vibrate(30);
              }
            }}
          >
            <GameGrid />
            
            {/* Bottom edge/void indicator */}
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(5, 10, 20, 1)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: BOTTOM_EDGE_GRADIENT }}
            />
            <View 
              style={{
                position: 'absolute',
                bottom: BOTTOM_EDGE_OFFSET,
                left: 16,
                right: 16,
                height: 2,
                backgroundColor: 'rgba(0, 242, 255, 0.3)',
              }}
            />

            {/* Maze Walls with neon glow */}
            {mazeWalls.map((wall, index) => (
              <LinearGradient
                key={`wall-${index}`}
                colors={[NEON_CYAN, 'rgba(0, 242, 255, 0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  borderRadius: 9999,
                  left: wall.x,
                  top: wall.y,
                  width: wall.width,
                  height: wall.height,
                  shadowColor: NEON_CYAN,
                  shadowOpacity: 0.5,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 8,
                }}
              />
            ))}

            {/* Target with neon cyan glow */}
            <Animated.View
              style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
                left: targetPosition.x - TARGET_RADIUS,
                top: targetPosition.y - TARGET_RADIUS,
                width: TARGET_RADIUS * 2,
                height: TARGET_RADIUS * 2,
                opacity: targetBroken
                  ? targetBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                  : targetPulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
                transform: [
                  {
                    scale: targetBroken
                      ? targetBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] })
                      : targetPulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.05] }),
                  },
                ],
              }}
            >
              {/* Outer glow ring */}
              <View 
                style={{
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: 9999,
                  borderWidth: 2,
                  borderColor: 'rgba(0, 242, 255, 0.3)',
                }}
              />
              <View 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(0, 242, 255, 0.15)',
                  borderWidth: 2,
                  borderColor: NEON_CYAN,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: NEON_CYAN,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 16,
                  shadowOpacity: 0.7,
                }}
              >
                <Ionicons name="flag" size={22} color={NEON_CYAN} />
              </View>
            </Animated.View>

            {/* Target break burst */}
            {targetBroken && (
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: targetPosition.x - TARGET_RADIUS,
                  top: targetPosition.y - TARGET_RADIUS,
                  width: TARGET_RADIUS * 2,
                  height: TARGET_RADIUS * 2,
                  borderRadius: TARGET_RADIUS,
                  borderWidth: 2,
                  borderColor: 'rgba(0, 242, 255, 0.8)',
                  opacity: targetBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                  transform: [
                    {
                      scale: targetBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }),
                    },
                  ],
                }}
              />
            )}

            {/* Ball with cyan gradient and glow */}
            <AnimatedLinearGradient
              colors={[NEON_CYAN, 'rgba(0, 242, 255, 0.7)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                borderRadius: 9999,
                left: ballPosition.x - BALL_RADIUS,
                top: ballPosition.y - BALL_RADIUS,
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2,
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                opacity: ballBroken ? ballBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : 1,
                transform: [
                  {
                    scale: ballBroken ? ballBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) : 1,
                  },
                ],
              }}
            >
              {/* Inner highlight */}
              <View 
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                }}
              />
            </AnimatedLinearGradient>

            {/* Ball break burst */}
            {ballBroken && (
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: ballPosition.x - BALL_RADIUS,
                  top: ballPosition.y - BALL_RADIUS,
                  width: BALL_RADIUS * 2,
                  height: BALL_RADIUS * 2,
                  borderRadius: BALL_RADIUS,
                  borderWidth: 2,
                  borderColor: 'rgba(0, 242, 255, 0.9)',
                  opacity: ballBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                  transform: [
                    {
                      scale: ballBreakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }),
                    },
                  ],
                }}
              />
            )}

            {gameWon && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                <View
                  style={{
                    alignItems: 'center',
                    padding: 32,
                    borderRadius: 24,
                    backgroundColor: DEEP_NAVY,
                    borderWidth: 2,
                    borderColor: NEON_CYAN,
                    shadowColor: NEON_CYAN,
                    shadowOpacity: 0.5,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 24,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={80} color={NEON_CYAN} style={{ marginBottom: 16 }} />
                  <Text style={{ color: NEON_CYAN, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>Victory!</Text>
                </View>
              </View>
            )}

            {ballFell && !gameWon && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View
                  style={{
                    alignItems: 'center',
                    padding: 24,
                    borderRadius: 24,
                    backgroundColor: DEEP_NAVY,
                    borderWidth: 2,
                    borderColor: '#F472B6',
                    shadowColor: '#F472B6',
                    shadowOpacity: 0.5,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 20,
                  }}
                >
                  <Ionicons name="alert-circle" size={60} color="#F472B6" style={{ marginBottom: 8 }} />
                  <Text style={{ color: '#F472B6', fontSize: 20, fontWeight: '900' }}>Oops!</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        </Animated.View>

        {/* Pause Modal */}
        <Modal
          visible={isPaused}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsPaused(false)}
        >
          {/* Maze Pattern Background with Blur Effect */}
          <View style={{ flex: 1, backgroundColor: 'rgba(10, 24, 24, 0.95)' }}>
            {/* Glowing Ball Decoration */}
            <View
              style={{
                position: 'absolute',
                top: '45%',
                left: '30%',
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: NEON_CYAN,
                opacity: 0.3,
                shadowColor: NEON_CYAN,
                shadowOpacity: 0.8,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 20,
              }}
            />

            {/* Content */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
              {/* Title Section */}
              <View style={{ alignItems: 'center', marginBottom: 64 }}>
                <Text
                  style={{
                    color: NEON_CYAN,
                    fontSize: 56,
                    fontWeight: '900',
                    letterSpacing: 12,
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    textShadowColor: 'rgba(37, 244, 244, 0.8)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 10,
                  }}
                >
                  Paused
                </Text>
                <View
                  style={{
                    width: 96,
                    height: 4,
                    backgroundColor: 'rgba(37, 244, 244, 0.3)',
                    marginTop: 16,
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Buttons */}
              <View style={{ width: '100%', maxWidth: 320, gap: 24 }}>
                {/* Resume Button - Primary */}
                <TouchableOpacity
                  onPress={() => setIsPaused(false)}
                  activeOpacity={0.9}
                  style={{
                    width: '100%',
                    height: 80,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 12,
                    backgroundColor: NEON_CYAN,
                    shadowColor: NEON_CYAN,
                    shadowOpacity: 0.5,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 30,
                  }}
                >
                  <Ionicons name="play" size={32} color={DEEP_NAVY} />
                  <Text
                    style={{
                      color: DEEP_NAVY,
                      fontSize: 24,
                      fontWeight: '900',
                      letterSpacing: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    Resume
                  </Text>
                </TouchableOpacity>

                {/* Restart Button - Secondary */}
                <TouchableOpacity
                  onPress={() => {
                    setIsPaused(false);
                    // Reset ball position and timer
                    if (ballRef.current) {
                      Matter.Body.setPosition(ballRef.current, BALL_INITIAL_POSITION);
                      Matter.Body.setVelocity(ballRef.current, { x: 0, y: 0 });
                    }
                  }}
                  activeOpacity={0.8}
                  style={{
                    width: '100%',
                    height: 64,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 12,
                    backgroundColor: 'rgba(37, 244, 244, 0.05)',
                    borderWidth: 2,
                    borderColor: 'rgba(37, 244, 244, 0.5)',
                  }}
                >
                  <Ionicons name="refresh" size={24} color={NEON_CYAN} />
                  <Text
                    style={{
                      color: NEON_CYAN,
                      fontSize: 18,
                      fontWeight: '700',
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    Restart
                  </Text>
                </TouchableOpacity>

                {/* Quit to Menu Button - Secondary */}
                <TouchableOpacity
                  onPress={() => {
                    setIsPaused(false);
                    onBack();
                  }}
                  activeOpacity={0.8}
                  style={{
                    width: '100%',
                    height: 64,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 12,
                    backgroundColor: 'rgba(37, 244, 244, 0.05)',
                    borderWidth: 2,
                    borderColor: 'rgba(37, 244, 244, 0.5)',
                  }}
                >
                  <Ionicons name="home" size={24} color={NEON_CYAN} />
                  <Text
                    style={{
                      color: NEON_CYAN,
                      fontSize: 18,
                      fontWeight: '700',
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    Quit to Menu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Handle */}
            <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' }}>
              <View
                style={{
                  width: 128,
                  height: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

