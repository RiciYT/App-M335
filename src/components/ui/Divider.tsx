import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className = "" }: DividerProps) {
  if (!text) {
    return <View className={`h-[1px] bg-border my-5 w-full ${className}`} />;
  }

  return (
    <View className={`flex-row items-center my-8 w-full ${className}`}>
      <View className="flex-1 h-[1px] bg-border" />
      <Text className="mx-5 text-ink-muted text-sm font-medium tracking-widest uppercase">{text}</Text>
      <View className="flex-1 h-[1px] bg-border" />
    </View>
  );
}
