import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from '../../theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  duration?: number;
  onHide: () => void;
  className?: string;
}

export function Toast({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onHide,
  className = "",
}: ToastProps) {
  const { isDark } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { 
      bg: isDark ? 'bg-mint/20' : 'bg-mint/15', 
      border: 'border-mint',
      icon: '✓'
    },
    error: { 
      bg: isDark ? 'bg-error/20' : 'bg-error/15', 
      border: 'border-error',
      icon: '✕'
    },
    info: { 
      bg: isDark ? 'bg-primary/20' : 'bg-primary/15', 
      border: 'border-primary',
      icon: '!'
    },
    warning: { 
      bg: isDark ? 'bg-warning/20' : 'bg-warning/15', 
      border: 'border-warning',
      icon: '⚠'
    },
  };

  const textColors: Record<ToastType, string> = {
    success: 'text-mint',
    error: 'text-error',
    info: 'text-primary',
    warning: 'text-warning',
  };

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

  const styles = toastStyles[type];

  return (
    <Animated.View
      style={[{ transform: [{ translateY }, { scale }], opacity }]}
      className={`absolute top-16 left-5 right-5 z-[1000] ${className}`}
    >
      <View 
        className={`${styles.bg} ${styles.border} border-2 p-5 rounded-2xl flex-row items-center`}
        style={{
          shadowColor: type === 'success' ? '#22D3EE' : type === 'error' ? '#F87171' : '#A855F7',
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
        }}
      >
        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
          type === 'success' ? 'bg-mint' : 
          type === 'error' ? 'bg-error' : 
          type === 'warning' ? 'bg-warning' : 'bg-primary'
        }`}>
          <Text className="text-white font-black text-sm">{styles.icon}</Text>
        </View>
        <Text className={`${textColors[type]} flex-1 text-base font-bold`}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
