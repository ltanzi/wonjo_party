import type { Config } from "tailwindcss";

// Design language ported from ../xarxa
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#EDE8E0",
        fg: "#1A1A1A",
        muted: "#8A8A8A",
        accent: "#E63B2E",
        soft: "#E0DBD2",
      },
      fontFamily: {
        mono: ["Inconsolata", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
