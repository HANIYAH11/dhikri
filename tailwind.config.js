/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // الهوية: أخضر داكن + زمردي + ذهبي هادئ + بيج فاتح
        brand: {
          50: "#eef7f3",
          100: "#d6ece4",
          200: "#aed9cb",
          300: "#7cc0ad",
          400: "#4aa28c",
          500: "#2a8772",
          600: "#16705c",
          700: "#0f6b50",
          800: "#0d5543",
          900: "#0b4537",
          950: "#052820"
        },
        gold: {
          300: "#e4cd8b",
          400: "#d4b462",
          500: "#c9a227",
          600: "#a9861d",
          700: "#7d6216"
        },
        sand: {
          50: "#faf8f2",
          100: "#f5f1e6",
          200: "#ece5d3",
          300: "#ded3b8"
        },
        night: {
          800: "#17201c",
          850: "#131a17",
          900: "#0f1512",
          950: "#0a0e0c"
        }
      },
      fontFamily: {
        // الاسم قابل للتغيير من إعدادات التطبيق (Settings → الخط)
        dhikr: ["var(--font-dhikr)", "Noto Kufi Arabic", "Tahoma", "sans-serif"],
        body: ["var(--font-body)", "Noto Kufi Arabic", "Tahoma", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 107, 80, 0.05), 0 8px 24px -12px rgba(15, 21, 18, 0.12)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.3), 0 10px 30px -14px rgba(0,0,0,0.6)",
        tap: "0 2px 10px -4px rgba(15, 107, 80, 0.45)"
      },
      keyframes: {
        "card-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pop": {
          "0%": { transform: "scale(0.86)", opacity: "0" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "ring-fill": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      animation: {
        "card-in": "card-in 0.35s ease-out both",
        "pop": "pop 0.28s ease-out both"
      }
    }
  },
  plugins: []
};
