/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: {
          50: "#f4fffb",
          100: "#dcfff4",
          200: "#baffea",
          300: "#84f9d4",
          400: "#43e9b7",
          500: "#18cd97",
          600: "#0da478",
          700: "#0f8262",
          800: "#12674f",
          900: "#105443"
        }
      }
    }
  },
  plugins: []
};
