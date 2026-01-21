import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'highlight';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', className = '', style }: CardProps) {
  const { isDark } = useTheme();

  const baseClasses = isDark 
    ? 'bg-surface-dark border-border-dark' 
    : 'bg-surface-light border-border';

  const variantClasses: Record<CardVariant, string> = {
    default: `${baseClasses} border rounded-3xl p-5`,
    elevated: `${baseClasses} border rounded-3xl p-5 shadow-lg`,
    outlined: `border-2 rounded-3xl p-5 ${isDark ? 'border-border-dark bg-transparent' : 'border-border bg-transparent'}`,
    highlight: `${isDark ? 'bg-primary/10 border-primary/30' : 'bg-primary-muted border-primary/20'} border rounded-3xl p-5`,
  };

  return (
    <View className={`${variantClasses[variant]} ${className}`} style={style}>
      {children}
    </View>
  );
}
