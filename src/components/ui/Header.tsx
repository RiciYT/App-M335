import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  variant?: 'transparent' | 'surface' | 'gradient';
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

  const getBgClass = () => {
    switch (variant) {
      case 'surface':
        return isDark 
          ? 'bg-surface-dark/80 border-b border-border-dark/30' 
          : 'bg-surface-light/90 border-b border-border/30';
      case 'gradient':
        return '';
      default:
        return 'bg-transparent';
    }
  };

  const content = (
    <View className={`flex-row items-center justify-between px-5 py-4 ${getBgClass()}`}>
      {/* Left section */}
      <View className="w-12">
        {leftIcon && onLeftPress && (
          <IconButton
            icon={leftIcon}
            onPress={onLeftPress}
            size="md"
            variant="default"
          />
        )}
      </View>

      {/* Center section */}
      <View className="flex-1 items-center">
        {centerContent || (
          <>
            {title && (
              <Text 
                className={`text-xl font-black tracking-tight ${isDark ? 'text-ink-light' : 'text-ink'}`}
                style={{
                  textShadowColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: isDark ? 8 : 0,
                }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className={`text-xs font-medium uppercase tracking-[2px] mt-1 ${
                isDark ? 'text-ink-muted-light' : 'text-ink-muted'
              }`}>
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
            variant="default"
          />
        )}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={isDark 
          ? ['rgba(168, 85, 247, 0.15)', 'transparent'] 
          : ['rgba(168, 85, 247, 0.08)', 'transparent']
        }
        className="pb-2"
      >
        {content}
      </LinearGradient>
    );
  }

  return content;
}
