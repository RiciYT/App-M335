import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme';

// Neon Cyan colors
const NEON_CYAN = '#00f2ff';

interface NeonChipProps {
  children: ReactNode;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'mint' | 'accent';
  size?: 'sm' | 'md';
  active?: boolean;
}

export function NeonChip({ 
  children, 
  onPress, 
  icon,
  variant = 'primary',
  size = 'md',
  active = false,
}: NeonChipProps) {
  const sizeConfig = {
    sm: { height: 32, paddingH: 12, fontSize: 11, iconSize: 14, letterSpacing: 1.5 },
    md: { height: 40, paddingH: 16, fontSize: 12, iconSize: 16, letterSpacing: 2 },
  };

  const config = sizeConfig[size];

  const getColors = () => {
    const colors = {
      primary: { bg: NEON_CYAN, text: '#050a14', border: NEON_CYAN },
      secondary: { bg: '#F472B6', text: '#FFFFFF', border: '#F472B6' },
      mint: { bg: NEON_CYAN, text: '#050a14', border: NEON_CYAN },
      accent: { bg: '#FACC15', text: '#050a14', border: '#FACC15' },
    };
    return colors[variant];
  };

  const colors = getColors();

  const chipStyle = active 
    ? {
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
      }
    : {
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.3)',
      };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        height: config.height,
        paddingHorizontal: config.paddingH,
        borderRadius: tokens.radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...chipStyle,
      }}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={config.iconSize} 
          color={active ? colors.text : NEON_CYAN}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        style={{
          color: active ? colors.text : NEON_CYAN,
          fontSize: config.fontSize,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: config.letterSpacing,
        }}
      >
        {children}
      </Text>
    </Component>
  );
}
