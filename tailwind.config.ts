import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Core brand palette (from dashboard reference)
        primary: {
          DEFAULT: "#6C5CE7", // main purple/indigo
          50: "#F3F1FE",
          100: "#E6E1FD",
          200: "#C7BCFA",
          300: "#A796F6",
          400: "#8A79EF",
          500: "#6C5CE7",
          600: "#5646C9",
          700: "#4234A0",
          800: "#302677",
          900: "#1D1750",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F1F2F6",
          foreground: "#1E1B2E",
        },
        success: {
          DEFAULT: "#00B894", // Food & Grocery green
          light: "#E4FBF4",
        },
        warning: {
          DEFAULT: "#FDCB6E", // Shopping orange/yellow
          light: "#FFF6E0",
        },
        danger: {
          DEFAULT: "#FF6B81", // expenses/negative red-pink
          light: "#FFE9EC",
        },
        info: {
          DEFAULT: "#54A0FF", // Travelling blue
          light: "#E8F1FF",
        },
        accentPink: "#FD79A8",
        accentTeal: "#00CEC9",
        muted: {
          DEFAULT: "#F5F6FA",
          foreground: "#8A8D9F",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "#FF6B81",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(108, 92, 231, 0.06)",
        soft: "0 2px 12px rgba(0, 0, 0, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
