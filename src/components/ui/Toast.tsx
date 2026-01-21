import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useTheme } from '../../theme';

type ToastType = 'success' | 'error' | 'info';

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
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const toastClasses: Record<ToastType, string> = {
    success: 'bg-mint',
    error: 'bg-error',
    info: 'bg-primary',
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
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
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[{ transform: [{ translateY }], opacity }]}
      className={`absolute top-16 left-5 right-5 p-5 rounded-2xl items-center shadow-lg z-[1000] ${toastClasses[type]} ${className}`}
    >
      <Text className="text-white text-base font-bold text-center">{message}</Text>
    </Animated.View>
  );
}
