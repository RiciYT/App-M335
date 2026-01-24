/**
 * Design Tokens for Neon Arcade/Glow Style
 * Centralized constants for consistent styling across the app
 */

export const tokens = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },

  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Border Width
  borderWidth: {
    thin: 1,
    normal: 2,
    thick: 3,
  },

  // Border Opacity
  borderOpacity: {
    light: {
      normal: 0.2,
      hover: 0.3,
      active: 0.4,
    },
    dark: {
      normal: 0.3,
      hover: 0.4,
      active: 0.5,
    },
  },

  // Glow/Shadow Presets
  glow: {
    // Primary violet glow
    primary: {
      color: '#A855F7',
      light: {
        opacity: 0.3,
        radius: 12,
      },
      dark: {
        opacity: 0.5,
        radius: 16,
      },
      strong: {
        opacity: 0.6,
        radius: 20,
      },
    },
    // Secondary pink glow
    secondary: {
      color: '#F472B6',
      light: {
        opacity: 0.25,
        radius: 12,
      },
      dark: {
        opacity: 0.4,
        radius: 16,
      },
      strong: {
        opacity: 0.5,
        radius: 20,
      },
    },
    // Cyan/mint glow
    mint: {
      color: '#22D3EE',
      light: {
        opacity: 0.3,
        radius: 12,
      },
      dark: {
        opacity: 0.5,
        radius: 16,
      },
      strong: {
        opacity: 0.7,
        radius: 24,
      },
    },
    // Yellow accent glow
    accent: {
      color: '#FACC15',
      light: {
        opacity: 0.25,
        radius: 12,
      },
      dark: {
        opacity: 0.4,
        radius: 16,
      },
    },
  },

  // Typography
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Letter Spacing for neon text
  letterSpacing: {
    tight: -1,
    normal: 0,
    wide: 1,
    wider: 2,
    widest: 3,
    superWide: 4,
  },

  // Animation Duration
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

// Helper to create shadow style objects
export const createGlow = (
  glowType: 'primary' | 'secondary' | 'mint' | 'accent',
  intensity: 'light' | 'dark' | 'strong' = 'dark'
) => {
  const glow = tokens.glow[glowType];
  const config = glow[intensity];
  
  return {
    shadowColor: glow.color,
    shadowOpacity: config.opacity,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: config.radius,
    elevation: Math.ceil(config.radius / 2),
  };
};

// Helper to create border with opacity
export const createBorder = (
  color: string,
  isDark: boolean,
  width: keyof typeof tokens.borderWidth = 'thin',
  opacityLevel: 'normal' | 'hover' | 'active' = 'normal'
) => {
  const opacity = isDark 
    ? tokens.borderOpacity.dark[opacityLevel]
    : tokens.borderOpacity.light[opacityLevel];
  
  return {
    borderWidth: tokens.borderWidth[width],
    borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  };
};
