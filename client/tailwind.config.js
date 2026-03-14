/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          orange: '#FF9E00',
          pumpkin: '#FF6D00',
          cyan: '#00B4D8',
          blue: '#0077B6',
          'blue-deep': '#023E8A',
          ivory: '#FFF8E1',
        },
        bg: {
          base: '#0D0D0D',
          surface: '#141414',
          elevated: '#1C1C1C',
          overlay: '#242424',
        },
        border: {
          DEFAULT: '#2A2A2A',
          subtle: '#1F1F1F',
          strong: '#3A3A3A',
        },
        text: {
          primary: '#F0EDE6',
          secondary: '#888880',
          muted: '#555550',
          inverted: '#0D0D0D',
        }
      },
    },
  },
  plugins: [],
}
