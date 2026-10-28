import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    screens: {
      sm: "560px",
      md: "760px",
      lg: "820px",
      xl: "1000px",
      "2xl": "1120px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        ink: "var(--ink)",
        mute: "var(--mute)",
        line: "var(--line)",
        icg: "var(--icg)",
        icp: "var(--icp)",
        onink: "var(--onink)",
        green: {
          DEFAULT: "var(--g)",
          primary: "#16C24A",
        },
        pink: {
          DEFAULT: "var(--p)",
          accent: "#F0559A",
          cta: "#F8439A",
        },
      },
      fontFamily: {
        pixelify: ["var(--font-pixelify)", "Courier New", "monospace"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        jetbrains: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        caveat: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        hard: "3px 3px 0 var(--ink)",
        "hard-sm": "2px 2px 0 var(--ink)",
        "hard-lg": "6px 6px 0 var(--ink)",
      },
    },
  },
  plugins: [],
};

export default config;

