import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className = '' }: DividerProps) {
  const { isDark } = useTheme();
  const lineColor = isDark ? 'bg-border-dark' : 'bg-border';
  const textColor = isDark ? 'text-ink-muted-light' : 'text-ink-muted';

  if (!text) {
    return <View className={`h-[1px] ${lineColor} ${className}`} />;
  }

  return (
    <View className={`flex-row items-center my-4 ${className}`}>
      <View className={`flex-1 h-[1px] ${lineColor}`} />
      <Text className={`mx-4 text-xs font-semibold uppercase tracking-widest ${textColor}`}>
        {text}
      </Text>
      <View className={`flex-1 h-[1px] ${lineColor}`} />
    </View>
  );
}

interface BadgeProps {
  text: string;
  variant?: 'default' | 'warning' | 'success' | 'error';
  icon?: string;
}

export function Badge({ text, variant = 'default', icon }: BadgeProps) {
  const { isDark } = useTheme();

  const variantStyles = {
    default: isDark ? 'bg-surface-muted-dark border-border-dark' : 'bg-surface-muted border-border',
    warning: 'bg-secondary/15 border-secondary/30',
    success: 'bg-mint/15 border-mint/30',
    error: 'bg-error/15 border-error/30',
  };

  const textStyles = {
    default: isDark ? 'text-ink-muted-light' : 'text-ink-muted',
    warning: 'text-secondary',
    success: 'text-mint',
    error: 'text-error',
  };

  return (
    <View className={`${variantStyles[variant]} border px-3 py-1.5 rounded-full flex-row items-center`}>
      {icon && <Text className={`${textStyles[variant]} text-xs mr-1.5`}>{icon}</Text>}
      <Text className={`${textStyles[variant]} text-2xs font-bold uppercase tracking-wider`}>
        {text}
      </Text>
    </View>
  );
}

interface ListItemProps {
  icon?: string | React.ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
}

export function ListItem({ icon, title, subtitle, rightContent, onPress, showBorder = true }: ListItemProps) {
  const { isDark } = useTheme();
  const borderClass = showBorder ? (isDark ? 'border-b border-border-dark' : 'border-b border-border') : '';

  const content = (
    <View className={`flex-row items-center py-4 ${borderClass}`}>
      {icon && (
        <View className="mr-3.5">
          {typeof icon === 'string' ? <Text className="text-xl">{icon}</Text> : icon}
        </View>
      )}
      <View className="flex-1">
        <Text className={`text-base font-semibold ${isDark ? 'text-ink-light' : 'text-ink'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-sm mt-0.5 ${isDark ? 'text-ink-muted-light' : 'text-ink-muted'}`}>
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
