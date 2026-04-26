/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
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
=======
        primary: '#0ea5e9',
        'primary-dark': '#0284c7',
        secondary: '#64748b',
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-hover': '#f1f5f9',
        border: '#e2e8f0',
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',
        accent: '#06b6d4',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
