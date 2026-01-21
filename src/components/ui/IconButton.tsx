import React, { ReactNode } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../theme';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'ghost';

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

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary';
      case 'ghost':
        return 'bg-transparent';
      default:
        return isDark 
          ? 'bg-surface-dark border border-border-dark' 
          : 'bg-surface-light border border-border';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`${sizeStyle.container} ${getVariantClasses()} items-center justify-center shadow-sm ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
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
