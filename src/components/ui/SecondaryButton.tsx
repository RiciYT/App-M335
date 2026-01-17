import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

type ButtonVariant = 'google' | 'anonymous' | 'default' | 'destructive';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  variant?: ButtonVariant;
  className?: string;
  textClassName?: string;
}

const variantClasses: Record<ButtonVariant, { button: string; text: string }> = {
  google: { button: 'bg-surface-light border-border', text: 'text-primary' },
  anonymous: { button: 'bg-surface-light border-border', text: 'text-ink-muted' },
  default: { button: 'bg-surface-light border-border', text: 'text-ink' },
  destructive: { button: 'bg-red-50 border-red-100', text: 'text-red-600' },
};

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'default',
  className = "",
  textClassName = "",
}: SecondaryButtonProps) {
  const classes = variantClasses[variant];

  return (
    <TouchableOpacity
      className={`w-full h-14 rounded-[24px] justify-center items-center border ${classes.button} ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'destructive' ? '#DC2626' : '#4B5563'} size="small" />
      ) : (
        <Text className={`text-base font-semibold tracking-tight ${classes.text} ${textClassName}`}>
          {icon ? `${icon}  ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
