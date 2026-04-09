/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'saqqara-dark':      '#080808',
        'saqqara-card':      '#0d0d0d',
        'saqqara-gold':      '#C9A84C',
        'saqqara-gold-soft': '#D4B96A',
        'saqqara-light':     '#EDEDED',
        'saqqara-border':    '#1e1e1e',
        'saqqara-rose':      '#B8956A',
        'saqqara-mist':      'rgba(201, 168, 76, 0.06)',
      },
      fontFamily: {
        cinzel:     ['Cinzel', 'serif'],
        cormorant:  ['Cormorant Garamond', 'Georgia', 'serif'],
        script:     ['Great Vibes', 'cursive'],
        sans:       ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderWidth: {
        'hair': '0.5px',
      },
      boxShadow: {
        'royal':  '0 8px 40px rgba(0,0,0,0.45), 0 0 60px rgba(201,168,76,0.05)',
        'gold':   '0 4px 20px rgba(201,168,76,0.25)',
        'glow':   '0 0 40px rgba(201,168,76,0.18)',
      },
    },
  },
  plugins: [],
}
