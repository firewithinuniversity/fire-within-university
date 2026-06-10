import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FDF6EC",
          dark: "#F5EBDA",
        },
        brown: {
          DEFAULT: "#3D1F0A",
          light: "#6B3A1F",
          deep: "#1a0f05",
          card: "#4A2A12",
          modal: "#2a1a0e",
          50: "#FDF6EC",
          100: "#F5E6CC",
          200: "#E8D1AB",
        },
        orange: {
          DEFAULT: "#A34D14",
          hover: "#8B4012",
          light: "#D97A3E",
          bright: "#C45E1A",
        },
        gold: {
          DEFAULT: "#E8A020",
          light: "#F0BD58",
          dark: "#C48A18",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(61,31,10,0.07), 0 1px 2px -1px rgba(61,31,10,0.05)",
        glow: "0 0 24px 4px rgba(232,160,32,0.18)",
        "glow-lg": "0 0 48px 8px rgba(232,160,32,0.22)",
        // Kindled hover for cards on dark ground: elevation as light, not shadow
        // (dark drop shadows are invisible on the near-black page ground)
        kindle: "0 10px 40px -10px rgba(232,160,32,0.22)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
