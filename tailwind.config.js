/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/**/*.{html,js}",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        'solana': '#14F195',
        'solana-dark': '#0E9F63',
        'cyber-black': '#1E1E1E',
        'neon-blue': '#00F0FF',
        'neon-purple': '#FF00FF',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
      },
      textShadow: {
        'neon': '0 0 10px #14F195',
      },
      boxShadow: {
        'neon': '0 0 10px #14F195, 0 0 20px #14F195, 0 0 30px #14F195',
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-neon': {
          textShadow: '0 0 10px #14F195',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
