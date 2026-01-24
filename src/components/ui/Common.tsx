import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  if (!text) {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: 'rgba(0, 242, 255, 0.2)',
        }}
      />
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: 'rgba(0, 242, 255, 0.2)',
        }}
      />
      <Text
        style={{
          marginHorizontal: 16,
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 3,
          color: 'rgba(0, 242, 255, 0.4)',
        }}
      >
        {text}
      </Text>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: 'rgba(0, 242, 255, 0.2)',
        }}
      />
    </View>
  );
}
