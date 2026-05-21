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
          50: "#FDF6EC",
          100: "#F5E6CC",
          200: "#E8D1AB",
        },
        orange: {
          DEFAULT: "#C45E1A",
          hover: "#A34D14",
          light: "#D97A3E",
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
        "card-hover": "0 10px 28px -4px rgba(61,31,10,0.14), 0 4px 10px -2px rgba(61,31,10,0.07)",
        glow: "0 0 24px 4px rgba(232,160,32,0.18)",
        "glow-lg": "0 0 48px 8px rgba(232,160,32,0.22)",
        soft: "0 2px 8px 0 rgba(61,31,10,0.05)",
        inner: "inset 0 2px 4px 0 rgba(61,31,10,0.04)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease forwards",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
