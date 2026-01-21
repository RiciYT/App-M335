import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { height: 'h-10', text: 'text-sm', padding: 'px-4', iconSize: 16 },
  md: { height: 'h-14', text: 'text-base', padding: 'px-6', iconSize: 20 },
  lg: { height: 'h-16', text: 'text-lg', padding: 'px-8', iconSize: 24 },
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
}: ButtonProps) {
  const { isDark } = useTheme();
  const sizeStyle = sizeStyles[size];

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#2EC4C6' : '#FFFFFF'} />;
    }

    return (
      <View className="flex-row items-center justify-center">
        {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
        <Text
          className={`font-bold tracking-wide ${sizeStyle.text} ${
            variant === 'primary' || variant === 'secondary' 
              ? 'text-white' 
              : isDark ? 'text-ink-light' : 'text-ink'
          }`}
        >
          {children}
        </Text>
        {icon && iconPosition === 'right' && <View className="ml-2">{icon}</View>}
      </View>
    );
  };

  const baseClasses = `${sizeStyle.height} ${sizeStyle.padding} rounded-3xl items-center justify-center ${
    fullWidth ? 'w-full' : ''
  } ${disabled || loading ? 'opacity-50' : ''} ${className}`;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        className={fullWidth ? 'w-full' : ''}
      >
        <LinearGradient
          colors={['#2EC4C6', '#1FA8AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${baseClasses} shadow-lg`}
          style={{ shadowColor: '#2EC4C6', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        className={fullWidth ? 'w-full' : ''}
      >
        <LinearGradient
          colors={['#F59C7A', '#E87A52']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${baseClasses} shadow-lg`}
          style={{ shadowColor: '#F59C7A', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled || loading}
        className={`${baseClasses} ${
          isDark 
            ? 'bg-surface-dark border border-border-dark' 
            : 'bg-surface-light border border-border'
        } shadow-sm`}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} bg-transparent`}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
