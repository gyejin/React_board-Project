/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue-500
        'primary-hover': '#2563EB', // Blue-600
        secondary: '#6B7280', // Gray-500
        accent: '#10B981', // Emerald-500
        neutral: '#F3F4F6', // Gray-100
        'base-100': '#FFFFFF',
      },
    },
  },
  plugins: [],
};