import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'glow';

interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: { container: 'w-10 h-10 rounded-xl', icon: 'text-lg' },
  md: { container: 'w-12 h-12 rounded-2xl', icon: 'text-xl' },
  lg: { container: 'w-14 h-14 rounded-2xl', icon: 'text-2xl' },
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  label,
  className = '',
}: IconButtonProps) {
  const { isDark } = useTheme();
  const sizeStyle = sizeStyles[size];

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          className: 'bg-primary',
          style: {
            shadowColor: '#A855F7',
            shadowOpacity: 0.4,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
          },
        };
      case 'glow':
        return {
          className: isDark ? 'bg-surface-dark/80 border border-primary/50' : 'bg-surface-light border border-primary/30',
          style: {
            shadowColor: '#A855F7',
            shadowOpacity: isDark ? 0.4 : 0.2,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 12,
          },
        };
      case 'ghost':
        return {
          className: 'bg-transparent',
          style: {},
        };
      default:
        return {
          className: isDark 
            ? 'bg-surface-dark/70 border border-border-dark/50' 
            : 'bg-surface-light/90 border border-border/50',
          style: {
            shadowColor: isDark ? '#A855F7' : '#000',
            shadowOpacity: isDark ? 0.15 : 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
          },
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      className={`${sizeStyle.container} ${variantStyle.className} items-center justify-center ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      style={variantStyle.style}
      accessibilityLabel={label}
    >
      {typeof icon === 'string' ? (
        <Text className={sizeStyle.icon}>{icon}</Text>
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
}
