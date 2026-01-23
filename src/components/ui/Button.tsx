import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

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
  sm: { height: 'h-11', text: 'text-sm', padding: 'px-5', iconSize: 16, letterSpacing: 1 },
  md: { height: 'h-14', text: 'text-base', padding: 'px-7', iconSize: 20, letterSpacing: 1.5 },
  lg: { height: 'h-16', text: 'text-lg', padding: 'px-8', iconSize: 24, letterSpacing: 2 },
  xl: { height: 'h-20', text: 'text-xl', padding: 'px-10', iconSize: 28, letterSpacing: 3 },
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

  const getLoadingColor = () => {
    if (variant === 'outline' || variant === 'ghost') return '#A855F7';
    return '#FFFFFF';
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getLoadingColor()} />;
    }

    const textColorClass = (() => {
      switch (variant) {
        case 'primary':
        case 'secondary':
        case 'accent':
          return 'text-white';
        case 'outline':
          return isDark ? 'text-primary-light' : 'text-primary-dark';
        case 'ghost':
          return isDark ? 'text-ink-light' : 'text-ink';
        default:
          return 'text-white';
      }
    })();

    return (
      <View className="flex-row items-center justify-center">
        {icon && iconPosition === 'left' && <View className="mr-3">{icon}</View>}
        <Text
          className={`font-black uppercase ${sizeStyle.text} ${textColorClass}`}
          style={{ letterSpacing: sizeStyle.letterSpacing }}
        >
          {children}
        </Text>
        {icon && iconPosition === 'right' && <View className="ml-3">{icon}</View>}
      </View>
    );
  };

  const baseClasses = `${sizeStyle.height} ${sizeStyle.padding} items-center justify-center ${
    fullWidth ? 'w-full' : ''
  } ${disabled || loading ? 'opacity-50' : ''} ${className}`;

  // Primary: Electric Violet gradient with glow
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        className={fullWidth ? 'w-full' : ''}
      >
        <LinearGradient
          colors={['#A855F7', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${baseClasses} rounded-2xl`}
          style={{
            shadowColor: '#A855F7',
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Inner glow effect */}
          <View
            className="absolute inset-0 rounded-2xl"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary: Hot Pink gradient with glow
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        className={fullWidth ? 'w-full' : ''}
      >
        <LinearGradient
          colors={['#F472B6', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${baseClasses} rounded-2xl`}
          style={{
            shadowColor: '#F472B6',
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View
            className="absolute inset-0 rounded-2xl"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Accent: Cyber Yellow with dark text
  if (variant === 'accent') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        className={fullWidth ? 'w-full' : ''}
      >
        <LinearGradient
          colors={['#FACC15', '#EAB308']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${baseClasses} rounded-2xl`}
          style={{
            shadowColor: '#FACC15',
            shadowOpacity: 0.4,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View
            className="absolute inset-0 rounded-2xl"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />
          <View className="flex-row items-center justify-center">
            {icon && iconPosition === 'left' && <View className="mr-3">{icon}</View>}
            <Text
              className={`font-black uppercase ${sizeStyle.text} text-[#1E1B4B]`}
              style={{ letterSpacing: sizeStyle.letterSpacing }}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && <View className="ml-3">{icon}</View>}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outline: Glassmorphism with neon border
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        className={`${baseClasses} rounded-2xl ${
          isDark 
            ? 'bg-surface-dark/80 border-2 border-primary/40' 
            : 'bg-surface-light/90 border-2 border-primary/30'
        }`}
        style={{
          shadowColor: '#A855F7',
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
        }}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Ghost: Minimal with hover state
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} bg-transparent rounded-2xl`}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
