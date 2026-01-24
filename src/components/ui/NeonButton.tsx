import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { tokens, createGlow } from '../../theme/tokens';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface NeonButtonBaseProps {
  children: ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeConfig = {
  sm: { height: 44, textSize: 12, iconSize: 16, padding: 16, letterSpacing: 1 },
  md: { height: 56, textSize: 14, iconSize: 20, padding: 24, letterSpacing: 1.5 },
  lg: { height: 64, textSize: 16, iconSize: 24, padding: 28, letterSpacing: 2 },
  xl: { height: 80, textSize: 18, iconSize: 28, padding: 32, letterSpacing: 3 },
};

// Primary Button: Gradient with strong glow (for PLAY, PLAY AGAIN)
export function NeonPrimaryButton({
  children,
  onPress,
  size = 'lg',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
}: NeonButtonBaseProps) {
  const { isDark } = useTheme();
  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={{ width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.5 : 1 }}
    >
      <LinearGradient
        colors={['#F472B6', '#DB2777']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: config.height,
          paddingHorizontal: config.padding,
          borderRadius: tokens.radius['2xl'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          ...createGlow('secondary', 'strong'),
        }}
      >
        {/* Inner border glow */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: tokens.radius['2xl'],
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        />
        
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={config.iconSize} color="#FFFFFF" style={{ marginRight: 12 }} />
            )}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: config.textSize,
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: config.letterSpacing,
              }}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={config.iconSize} color="#FFFFFF" style={{ marginLeft: 12 }} />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Secondary Button: Glass with subtle glow (for SCORES, SETTINGS, LEADERBOARD)
export function NeonSecondaryButton({
  children,
  onPress,
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
}: NeonButtonBaseProps) {
  const { isDark } = useTheme();
  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={{ width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.5 : 1 }}
    >
      <View
        style={{
          height: config.height,
          paddingHorizontal: config.padding,
          borderRadius: tokens.radius['2xl'],
          backgroundColor: isDark ? 'rgba(26, 10, 46, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          borderWidth: 2,
          borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.3)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          ...createGlow('primary', isDark ? 'dark' : 'light'),
        }}
      >
        {loading ? (
          <ActivityIndicator color="#A855F7" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon && iconPosition === 'left' && (
              <Ionicons 
                name={icon} 
                size={config.iconSize} 
                color={isDark ? '#C084FC' : '#7C3AED'} 
                style={{ marginRight: 12 }} 
              />
            )}
            <Text
              style={{
                color: isDark ? '#C084FC' : '#7C3AED',
                fontSize: config.textSize,
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: config.letterSpacing,
              }}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons 
                name={icon} 
                size={config.iconSize} 
                color={isDark ? '#C084FC' : '#7C3AED'} 
                style={{ marginLeft: 12 }} 
              />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Ghost Button: Minimal tertiary (for MENU, BACK)
export function NeonGhostButton({
  children,
  onPress,
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: NeonButtonBaseProps) {
  const { isDark } = useTheme();
  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={{ 
        width: fullWidth ? '100%' : undefined, 
        opacity: disabled ? 0.5 : 1,
        paddingVertical: 16,
        alignItems: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? '#A78BFA' : '#6B7280'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={config.iconSize} 
              color={isDark ? '#A78BFA' : '#6B7280'} 
              style={{ marginRight: 8 }} 
            />
          )}
          <Text
            style={{
              color: isDark ? '#A78BFA' : '#6B7280',
              fontSize: config.textSize,
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: config.letterSpacing + 1,
            }}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={config.iconSize} 
              color={isDark ? '#A78BFA' : '#6B7280'} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
