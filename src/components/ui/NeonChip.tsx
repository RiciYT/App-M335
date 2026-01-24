import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { tokens, createBorder } from '../../theme/tokens';

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
  const { isDark } = useTheme();

  const sizeConfig = {
    sm: { height: 32, paddingH: 12, fontSize: 11, iconSize: 14, letterSpacing: 1.5 },
    md: { height: 40, paddingH: 16, fontSize: 12, iconSize: 16, letterSpacing: 2 },
  };

  const config = sizeConfig[size];

  const getColors = () => {
    const colors = {
      primary: { bg: '#A855F7', text: '#FFFFFF', border: '#A855F7' },
      secondary: { bg: '#F472B6', text: '#FFFFFF', border: '#F472B6' },
      mint: { bg: '#22D3EE', text: '#FFFFFF', border: '#22D3EE' },
      accent: { bg: '#FACC15', text: '#1E1B4B', border: '#FACC15' },
    };
    return colors[variant];
  };

  const colors = getColors();

  const chipStyle = active 
    ? {
        backgroundColor: colors.bg,
        ...createBorder(colors.border, isDark, 'thin'),
      }
    : {
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
        ...createBorder(colors.border, isDark, 'thin'),
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
          color={active ? colors.text : colors.bg} 
          style={{ marginRight: 6 }} 
        />
      )}
      <Text
        style={{
          color: active ? colors.text : colors.bg,
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
