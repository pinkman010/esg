/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 2px 12px rgba(15, 23, 42, 0.05)',
      },
      colors: {
        'envision-green': '#0f9f75',
      },
    },
  },
  plugins: [],
}
