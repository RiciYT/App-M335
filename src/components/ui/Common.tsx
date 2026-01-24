import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className = '' }: DividerProps) {
  const { isDark } = useTheme();
  
  if (!text) {
    return (
      <LinearGradient
        colors={isDark 
          ? ['transparent', '#4C1D95', 'transparent'] 
          : ['transparent', '#DDD6FE', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className={`h-[1px] ${className}`}
      />
    );
  }

  return (
    <View className={`flex-row items-center my-5 ${className}`}>
      <LinearGradient
        colors={isDark 
          ? ['transparent', '#4C1D95'] 
          : ['transparent', '#DDD6FE']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-1 h-[1px]"
      />
      <Text className={`mx-4 text-xs font-bold uppercase tracking-[3px] ${
        isDark ? 'text-ink-muted-light' : 'text-ink-muted'
      }`}>
        {text}
      </Text>
      <LinearGradient
        colors={isDark 
          ? ['#4C1D95', 'transparent'] 
          : ['#DDD6FE', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-1 h-[1px]"
      />
    </View>
  );
}

interface BadgeProps {
  text: string;
  variant?: 'default' | 'warning' | 'success' | 'error' | 'primary' | 'accent';
  icon?: string;
}

export function Badge({ text, variant = 'default', icon }: BadgeProps) {
  const { isDark } = useTheme();

  const variantStyles = {
    default: {
      bg: isDark ? 'bg-surface-muted-dark/70' : 'bg-surface-muted/70',
      border: isDark ? 'border-border-dark' : 'border-border',
      text: isDark ? 'text-ink-muted-light' : 'text-ink-muted',
    },
    warning: {
      bg: 'bg-warning/15',
      border: 'border-warning/40',
      text: 'text-warning',
    },
    success: {
      bg: 'bg-mint/15',
      border: 'border-mint/40',
      text: 'text-mint',
    },
    error: {
      bg: 'bg-error/15',
      border: 'border-error/40',
      text: 'text-error',
    },
    primary: {
      bg: 'bg-primary/15',
      border: 'border-primary/40',
      text: 'text-primary',
    },
    accent: {
      bg: 'bg-accent/15',
      border: 'border-accent/40',
      text: isDark ? 'text-accent' : 'text-accent-dark',
    },
  };

  const styles = variantStyles[variant];

  return (
    <View className={`${styles.bg} ${styles.border} border px-4 py-2 rounded-full flex-row items-center`}>
      {icon && <Text className={`${styles.text} text-sm mr-2`}>{icon}</Text>}
      <Text className={`${styles.text} text-xs font-black uppercase tracking-[2px]`}>
        {text}
      </Text>
    </View>
  );
}

interface ListItemProps {
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
}

export function ListItem({ icon, title, subtitle, rightContent, onPress, showBorder = true }: ListItemProps) {
  const { isDark } = useTheme();
  
  const borderClass = showBorder 
    ? isDark 
      ? 'border-b border-border-dark/30' 
      : 'border-b border-border/50'
    : '';

  const content = (
    <View className={`flex-row items-center py-4 ${borderClass}`}>
      {icon && (
        <View className={`mr-4 w-10 h-10 rounded-xl items-center justify-center ${
          isDark ? 'bg-primary/10' : 'bg-primary-muted'
        }`}>
          {typeof icon === 'string' ? (
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color="#A855F7" />
          ) : (
            icon
          )}
        </View>
      )}
      <View className="flex-1">
        <Text className={`text-base font-bold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-sm mt-1 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent && <View className="ml-3">{rightContent}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
