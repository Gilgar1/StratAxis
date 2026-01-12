/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0B0D10',
          charcoal: '#161A1F',
          darkGrey: '#1F2933',
          mediumGrey: '#6B7280',
          lightGrey: '#D1D5DB',
          gold: '#D4AF37',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
}
