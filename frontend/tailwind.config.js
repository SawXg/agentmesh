/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mesh: {
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          primary: "#3b82f6",
          accent: "#10b981",
          burn: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
