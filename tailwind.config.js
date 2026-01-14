/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linen: '#f6efe6',
        cocoa: '#3b2f2f',
        gold: '#d4af37',
        goldDark: '#b68b2e',
        sand: '#efe6d6',
        pearl: '#fffdf8',
        taupe: '#8b7b73',
        borderSoft: '#e7e0d6',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(17,24,39,0.06)',
        card: '0 10px 30px rgba(17,24,39,0.08)',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
