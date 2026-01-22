import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'highlight' | 'glass' | 'neon';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  style?: ViewStyle;
  glowColor?: string;
}

export function Card({ children, variant = 'default', className = '', style, glowColor }: CardProps) {
  const { isDark } = useTheme();

  // Glassmorphism base for dark mode
  const glassBase = isDark
    ? 'bg-surface-dark/70 border-border-dark/50'
    : 'bg-surface-light/90 border-border/50';

  const baseClasses = isDark 
    ? 'bg-surface-dark border-border-dark' 
    : 'bg-surface-light border-border';

  const getVariantClasses = (): string => {
    switch (variant) {
      case 'default':
        return `${glassBase} border rounded-3xl p-5`;
      case 'elevated':
        return `${glassBase} border rounded-3xl p-5`;
      case 'outlined':
        return `border-2 rounded-3xl p-5 ${isDark ? 'border-primary/30 bg-transparent' : 'border-primary/20 bg-transparent'}`;
      case 'highlight':
        return `${isDark ? 'bg-primary/15 border-primary/40' : 'bg-primary-muted border-primary/25'} border rounded-3xl p-5`;
      case 'glass':
        return `${isDark ? 'bg-white/5' : 'bg-white/70'} border border-white/20 rounded-3xl p-5 backdrop-blur-xl`;
      case 'neon':
        return `${isDark ? 'bg-surface-dark/80' : 'bg-surface-light/95'} border-2 border-primary rounded-3xl p-5`;
      default:
        return `${baseClasses} border rounded-3xl p-5`;
    }
  };

  const getElevatedStyle = (): ViewStyle => {
    if (variant === 'elevated') {
      return {
        shadowColor: isDark ? '#A855F7' : '#000',
        shadowOpacity: isDark ? 0.25 : 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 12,
      };
    }
    if (variant === 'neon') {
      const color = glowColor || '#A855F7';
      return {
        shadowColor: color,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 8,
      };
    }
    return {};
  };

  // Special treatment for neon variant with gradient border effect
  if (variant === 'neon') {
    return (
      <View
        className={`${getVariantClasses()} ${className}`}
        style={[getElevatedStyle(), style]}
      >
        {/* Subtle inner gradient overlay */}
        <View
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{ opacity: isDark ? 0.05 : 0.02 }}
        >
          <LinearGradient
            colors={['#A855F7', '#F472B6', '#22D3EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />
        </View>
        {children}
      </View>
    );
  }

  return (
    <View 
      className={`${getVariantClasses()} ${className}`} 
      style={[getElevatedStyle(), style]}
    >
      {children}
    </View>
  );
}
