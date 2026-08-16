/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7F9",
        surface: "#FFFFFF",
        ink: "#10151A",
        muted: "#63707D",
        line: "#DFE4E9",
        teal: {
          DEFAULT: "#0B6E6E",
          dark: "#08514F",
          light: "#E4F1F0",
        },
        chart: {
          DEFAULT: "#2451B0",
          light: "#E7EDFA",
        },
        alert: {
          DEFAULT: "#C4432B",
          light: "#FBEAE6",
        },
        ok: {
          DEFAULT: "#2E8B57",
          light: "#E7F5ED",
        },
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,21,26,0.04), 0 1px 12px rgba(16,21,26,0.05)",
      },
    },
  },
  plugins: [],
};
