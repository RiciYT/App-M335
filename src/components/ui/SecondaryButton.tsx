import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'google' | 'anonymous' | 'default' | 'destructive';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string }> = {
  google: { bg: '#fff', text: '#4285F4' },
  anonymous: { bg: '#fff', text: '#6B7280' },
  default: { bg: '#fff', text: '#374151' },
  destructive: { bg: '#FEE2E2', text: '#DC2626' },
};

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'default',
  style,
  textStyle,
}: SecondaryButtonProps) {
  const colors = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.bg },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color: colors.text }, textStyle]}>
          {icon ? `${icon} ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
