/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-green': '#2D6A4F', // O verde da sua logo
        'duo-light': '#D8F3DC',
        'duo-accent': '#FFB347', // A cor de destaque/laranja
      },
    },
  },
  plugins: [],
}