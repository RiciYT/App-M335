import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  className?: string;
  textClassName?: string;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  className = "",
  textClassName = "",
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className={`w-full h-16 bg-secondary rounded-[28px] justify-center items-center shadow-lg shadow-secondary/30 ${disabled ? 'opacity-60' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className={`text-white text-lg font-bold tracking-wide ${textClassName}`}>
          {icon ? `${icon}  ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
