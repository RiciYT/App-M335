import React, { ReactNode } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  size?: IconButtonSize;
  disabled?: boolean;
}

const sizeValues = {
  sm: { size: 40, borderRadius: 12 },
  md: { size: 48, borderRadius: 16 },
  lg: { size: 56, borderRadius: 16 },
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  disabled = false,
}: IconButtonProps) {
  const sizeStyle = sizeValues[size];

  const buttonStyle: ViewStyle = {
    width: sizeStyle.size,
    height: sizeStyle.size,
    borderRadius: sizeStyle.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 242, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 255, 0.3)',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={buttonStyle}
    >
      {icon}
    </TouchableOpacity>
  );
}
