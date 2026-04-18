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
        background: "#fcf9f4",
        primary: {
          500: "#7C3AED",
          600: "#3B1FA8",
          700: "#A855F7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
