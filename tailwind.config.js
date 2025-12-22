/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nex-orange': '#FF6B35',
        'nex-pink': '#FF1493',
        'nex-blue': '#1a237e', // Dark navy blue
        'nex-dark': '#0d1440',
      },
      backgroundImage: {
        'gradient-nex': 'linear-gradient(to right, #FF6B35, #FF1493)',
        'gradient-nex-vertical': 'linear-gradient(to bottom, #FF6B35, #FF1493)',
      },
    },
  },
  plugins: [],
}

