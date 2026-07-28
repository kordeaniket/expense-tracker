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
          DEFAULT: "rgb(var(--primary-DEFAULT) / <alpha-value>)",
          50: "rgb(var(--primary-50) / <alpha-value>)",
          100: "rgb(var(--primary-100) / <alpha-value>)",
          200: "rgb(var(--primary-200) / <alpha-value>)",
          300: "rgb(var(--primary-300) / <alpha-value>)",
          400: "rgb(var(--primary-400) / <alpha-value>)",
          500: "rgb(var(--primary-500) / <alpha-value>)",
          600: "rgb(var(--primary-600) / <alpha-value>)",
          700: "rgb(var(--primary-700) / <alpha-value>)",
          800: "rgb(var(--primary-800) / <alpha-value>)",
          900: "rgb(var(--primary-900) / <alpha-value>)",
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
