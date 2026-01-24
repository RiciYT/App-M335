import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { tokens, createGlow, createBorder } from '../../theme/tokens';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'neon';
  glowColor?: 'primary' | 'secondary' | 'mint' | 'accent';
  className?: string;
  style?: ViewStyle;
}

export function GlassCard({ 
  children, 
  variant = 'default', 
  glowColor = 'primary',
  className = '', 
  style 
}: GlassCardProps) {
  const { isDark } = useTheme();

  const baseStyle: ViewStyle = {
    borderRadius: tokens.radius['2xl'],
    padding: tokens.spacing.lg,
    backgroundColor: isDark ? 'rgba(26, 10, 46, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    ...createBorder('#A855F7', isDark, 'thin'),
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...createGlow(glowColor, isDark ? 'dark' : 'light'),
        };
      case 'neon':
        return {
          ...baseStyle,
          borderWidth: 2,
          borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : 'rgba(168, 85, 247, 0.4)',
          ...createGlow(glowColor, 'strong'),
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[getVariantStyle(), style]}>
      {children}
    </View>
  );
}
