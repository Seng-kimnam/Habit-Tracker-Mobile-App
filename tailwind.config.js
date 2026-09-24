/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#ffffff',
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#F0F0F3',
          selected: '#E0E1E6',
          dark: '#212225',
          darkSelected: '#2E3135',
        },
        muted: {
          DEFAULT: '#60646C',
          dark: '#B0B4BA',
        },
      },
    },
  },
  plugins: [],
};