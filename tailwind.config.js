/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // NEON ARCADE BRUTALISM PALETTE
        // Primary: Electric Violet - the signature arcade glow
        primary: {
          DEFAULT: "#A855F7",
          light: "#C084FC",
          dark: "#7C3AED",
          muted: "#F3E8FF",
          glow: "rgba(168, 85, 247, 0.5)",
        },
        // Secondary: Hot Cyber Pink - energy and excitement
        secondary: {
          DEFAULT: "#F472B6",
          light: "#F9A8D4",
          dark: "#DB2777",
          muted: "#FCE7F3",
          glow: "rgba(244, 114, 182, 0.5)",
        },
        // Accent: Cyber Yellow - highlights and CTAs
        accent: {
          DEFAULT: "#FACC15",
          light: "#FDE047",
          dark: "#EAB308",
          muted: "#FEF9C3",
          glow: "rgba(250, 204, 21, 0.5)",
        },
        // Mint: Neon Cyan - success states and targets
        mint: {
          DEFAULT: "#22D3EE",
          light: "#67E8F9",
          dark: "#06B6D4",
          muted: "#CFFAFE",
          glow: "rgba(34, 211, 238, 0.5)",
        },
        // Semantic colors with arcade feel
        success: "#4ADE80",
        warning: "#FB923C",
        error: "#F87171",
        info: "#60A5FA",
        // Background: Deep space black with subtle purple tint
        background: {
          light: "#FAF5FF",
          dark: "#0C0118",
        },
        // Surface colors with glassmorphism
        surface: {
          light: "#FFFFFF",
          dark: "#1A0A2E",
          muted: "#F3E8FF",
          "muted-dark": "#2D1B4E",
        },
        // Text colors
        ink: {
          DEFAULT: "#1E1B4B",
          muted: "#6B7280",
          light: "#FAF5FF",
          "muted-light": "#A78BFA",
        },
        // Border colors with glow potential
        border: {
          DEFAULT: "#DDD6FE",
          dark: "#4C1D95",
          glow: "rgba(168, 85, 247, 0.3)",
        },
        // Special neon effects
        neon: {
          violet: "#8B5CF6",
          pink: "#EC4899",
          cyan: "#06B6D4",
          yellow: "#EAB308",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
        "5xl": ["48px", { lineHeight: "52px" }],
        "6xl": ["60px", { lineHeight: "64px" }],
        "7xl": ["72px", { lineHeight: "76px" }],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
        "5xl": "40px",
      },
    },
  },
  plugins: [],
}

