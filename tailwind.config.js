/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Work Sans', 'Noto Sans', 'Roboto', 'system-ui', 'sans-serif'],
        'work': ['Work Sans', 'sans-serif'],
        'noto': ['Noto Sans', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
