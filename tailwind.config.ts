import type { Config } from "tailwindcss";

/**
 * Theme tokens for Folio.
 * Section and lean colors live here so every component uses the same values.
 * `lib/` is included in `content` because lib/sources.ts holds class names
 * (like "bg-news") that Tailwind needs to see in order to generate them.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1C1F2A",
        paper: "#F3F4F7",
        card: "#FFFFFF",
        line: "#DDE1E8",
        muted: "#5D6475",
        brand: {
          yellow: "#FFD23F",
        },
        // One accent per section
        news: "#3B5BDB",
        science: "#0E8F80",
        culture: "#D9437A",
        // Media-lean scale, left to right
        lean: {
          left: "#2F6FDB",
          "lean-left": "#86A8E7",
          center: "#9AA0AC",
          "lean-right": "#E8A096",
          right: "#CF4436",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        pixel: ["var(--font-vt323)", "ui-monospace", "monospace"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
