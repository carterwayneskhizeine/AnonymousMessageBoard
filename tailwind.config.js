/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  darkMode: 'class', // Enable dark mode using a class
  theme: {
    extend: {
      colors: {
        // 确保纯黑色可用
        black: '#000000',
      },
      ringOffsetColor: {
        'black': '#000000',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
