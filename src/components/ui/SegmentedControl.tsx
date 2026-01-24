import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { tokens } from '../../theme/tokens';

interface SegmentedControlProps {
  options: Array<{ label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }>;
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const { isDark } = useTheme();

  return (
    <View 
      className="flex-row rounded-2xl p-1"
      style={{
        backgroundColor: isDark ? 'rgba(76, 29, 149, 0.3)' : 'rgba(168, 85, 247, 0.1)',
      }}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1"
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: tokens.radius.lg,
              backgroundColor: isSelected 
                ? '#A855F7' 
                : 'transparent',
              marginLeft: index > 0 ? 4 : 0,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            {option.icon && (
              <Ionicons 
                name={option.icon} 
                size={16} 
                color={isSelected ? '#FFFFFF' : isDark ? '#A78BFA' : '#7C3AED'} 
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              style={{
                color: isSelected ? '#FFFFFF' : isDark ? '#A78BFA' : '#7C3AED',
                fontSize: 13,
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
