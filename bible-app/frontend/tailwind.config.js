/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif"', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};
