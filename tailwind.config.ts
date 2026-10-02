import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050507",
        surface: "#0C0C12",
        "surface-2": "#141420",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        syne: ["Syne", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
