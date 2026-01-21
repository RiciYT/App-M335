import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { IconButton } from './IconButton';
import { useTheme } from '../../theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  centerContent?: ReactNode;
  variant?: 'transparent' | 'surface';
}

export function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  centerContent,
  variant = 'transparent',
}: HeaderProps) {
  const { isDark } = useTheme();

  const bgClass = variant === 'surface' 
    ? isDark 
      ? 'bg-surface-dark border-b border-border-dark' 
      : 'bg-surface-light border-b border-border'
    : 'bg-transparent';

  return (
    <View className={`flex-row items-center justify-between px-5 py-3 ${bgClass}`}>
      {/* Left section */}
      <View className="w-12">
        {leftIcon && onLeftPress && (
          <IconButton
            icon={leftIcon}
            onPress={onLeftPress}
            size="md"
          />
        )}
      </View>

      {/* Center section */}
      <View className="flex-1 items-center">
        {centerContent || (
          <>
            {title && (
              <Text className={`text-xl font-bold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className={`text-xs ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'} mt-0.5`}>
                {subtitle}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Right section */}
      <View className="w-12">
        {rightIcon && onRightPress && (
          <IconButton
            icon={rightIcon}
            onPress={onRightPress}
            size="md"
          />
        )}
      </View>
    </View>
  );
}
