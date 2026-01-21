/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#2EC4C6",
          light: "#5DD3D5",
          dark: "#1FA8AA",
          muted: "#D4F4F4",
        },
        secondary: {
          DEFAULT: "#F59C7A",
          light: "#F7B499",
          dark: "#E87A52",
          muted: "#FDEDE7",
        },
        accent: {
          DEFAULT: "#7FB5FF",
          light: "#A3CBFF",
          dark: "#5A9AEF",
          muted: "#E8F2FF",
        },
        mint: {
          DEFAULT: "#56D1B7",
          light: "#7EDCC9",
          dark: "#3BB89D",
          muted: "#E0F7F1",
        },
        // Semantic colors
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Background colors
        background: {
          light: "#F5F7FB",
          dark: "#0F172A",
        },
        // Surface colors (cards, modals)
        surface: {
          light: "#FFFFFF",
          dark: "#1E293B",
          muted: "#EEF2F7",
          "muted-dark": "#334155",
        },
        // Text colors
        ink: {
          DEFAULT: "#1F2937",
          muted: "#6B7280",
          light: "#F8FAFC",
          "muted-light": "#94A3B8",
        },
        // Border colors
        border: {
          DEFAULT: "#E3E8F0",
          dark: "#334155",
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
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
}

