/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f6f7f2',
          100: '#e8ede0',
          200: '#d3ddd0',
          300: '#b8c8b4',
          400: '#9ab095',
          500: '#7d9777',
          600: '#657d5f',
          700: '#52664d',
          800: '#44553f',
          900: '#3a4635',
        }
      }
    },
  },
  plugins: [],
}
