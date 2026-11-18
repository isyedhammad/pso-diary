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
        dgmm: {
          dark: '#080d16',
          navy: '#0c1626',
          card: '#111e33',
          cardHover: '#162640',
          border: '#1e3250',
          emerald: '#0c3d25',
          emeraldLight: '#125c38',
          gold: '#c8a355',
          goldHover: '#d9b363',
          goldMuted: '#967839',
          goldLight: '#f5e8c4',
          textMuted: '#8b9bb4',
          textMain: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
