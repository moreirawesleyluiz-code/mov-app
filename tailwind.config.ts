import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mov: {
          bg: "#0a0908",
          surface: "#121110",
          border: "#2a2826",
          muted: "#8a8580",
          cream: "#f5f0e8",
          accent: "#c45c4a",
          accentHover: "#d47262",
          gold: "#c9a227",
          onboardingCream: "#f9f7f2",
          onboardingInk: "#0a0a0a",
          onboardingMuted: "#757575",
        },
        /** App autenticado — base clara premium (marketing/onboarding mantêm `mov.*` escuro). */
        movApp: {
          bg: "#faf8f5",
          paper: "#ffffff",
          subtle: "#f3efe8",
          border: "#e6e2db",
          muted: "#5f5a55",
          ink: "#1c1917",
          accent: "#c45c4a",
          accentHover: "#b54a38",
          accentSoft: "#fde8e4",
          gold: "#8b6914",
          success: "#166534",
          warn: "#b45309",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "grid-pattern-light":
          "linear-gradient(to right, rgba(28,25,23,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(28,25,23,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
