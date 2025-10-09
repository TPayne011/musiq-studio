/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pi brand vibe
        piPurple: "#8e44ad",
        piGlow: "#a855f7",
      },
      backgroundImage: {
        // gradients & neon patterns
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        pulseSlow: "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
