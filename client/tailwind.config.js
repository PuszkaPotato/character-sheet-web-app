/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dnd: {
          red: '#c41e3a',
          gold: '#c9a84c',
          parchment: '#f4edd8',
        },
      },
    },
  },
  plugins: [],
}
