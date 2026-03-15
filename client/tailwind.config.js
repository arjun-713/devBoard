/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
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
          base: '#0F0F11',
          surface: '#121214',
          elevated: '#17171A',
          overlay: '#1F1F23',
        },
        border: {
          DEFAULT: '#2A2A2E',
          subtle: '#1C1C20',
          strong: '#34343A',
        },
        text: {
          primary: '#E8E8EC',
          secondary: '#A2A2AE',
          muted: '#6D6D78',
          inverted: '#0F0F11',
        }
      },
    },
  },
  plugins: [],
}
