import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';
const DEEP_NAVY = '#050a14';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  duration?: number;
  onHide: () => void;
}

export function Toast({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(0, 242, 255, 0.15)', border: NEON_CYAN, text: NEON_CYAN, icon: '✓' };
      case 'error':
        return { bg: 'rgba(248, 113, 113, 0.15)', border: '#F87171', text: '#F87171', icon: '✕' };
      case 'warning':
        return { bg: 'rgba(251, 146, 60, 0.15)', border: '#FB923C', text: '#FB923C', icon: '⚠' };
      default:
        return { bg: 'rgba(0, 242, 255, 0.15)', border: NEON_CYAN, text: NEON_CYAN, icon: '!' };
    }
  };

  const colors = getToastColors();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY }, { scale }],
          opacity,
          position: 'absolute',
          top: 64,
          left: 20,
          right: 20,
          zIndex: 1000,
        }
      ]}
    >
      <View 
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 2,
          padding: 20,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: colors.border,
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: colors.border,
          }}
        >
          <Text style={{ color: DEEP_NAVY, fontWeight: '900', fontSize: 14 }}>{colors.icon}</Text>
        </View>
        <Text style={{ color: colors.text, flex: 1, fontSize: 16, fontWeight: '700' }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
