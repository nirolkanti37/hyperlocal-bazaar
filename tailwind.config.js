/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans Bengali', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22C55E',
          600: '#16a34a',
          700: '#15803d',
        },
        secondary: {
          500: '#3B82F6',
          600: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
