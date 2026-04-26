/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3F7994',
        'primary-dark': '#2A5674',
        secondary: '#599BAE',
        background: '#D1EEEA',
        surface: '#ffffff',
        'surface-hover': '#A1D7D6',
        border: '#A1D7D6',
        'text-primary': '#2A5674',
        'text-secondary': '#3F7994',
        'text-muted': '#599BAE',
        accent: '#79B8C3',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
