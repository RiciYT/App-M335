/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2EC4C6",
        secondary: "#F59C7A",
        accent: "#7FB5FF",
        mint: "#56D1B7",
        "background-light": "#F5F7FB",
        "background-dark": "#101827",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1D2736",
        "surface-muted": "#EEF2F7",
        ink: "#1F2937",
        "ink-muted": "#6B7280",
        border: "#E3E8F0",
      },
    },
  },
  plugins: [],
}

