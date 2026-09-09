/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: "#0b1329",
          sidebar: "#0f172a",
          card: "#1e293b",
          cardHover: "#283548",
          border: "#334155",
          borderLight: "#475569",
          textPrimary: "#f8fafc",
          textSecondary: "#94a3b8",
          textMuted: "#64748b",
          saffron: "#ea580c",
          saffronLight: "#f97316",
          green: "#059669",
          greenLight: "#10b981",
          crimson: "#dc2626",
          crimsonLight: "#ef4444",
          amber: "#d97706",
          amberLight: "#f59e0b"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
