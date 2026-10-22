export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { obsidian:'#080808', luxe:'#101010', charcoal:'#1A1A1A', gold:'#C9A45C', champagne:'#E4C98A', bronze:'#8C6A36', ivory:'#F5F0E7' },
    fontFamily: { serif:['"Cormorant Garamond"','Georgia','serif'], sans:['Manrope','system-ui','sans-serif'] },
    backgroundImage: { 'gold-metal':'linear-gradient(135deg,#8C6A36 0%,#C9A45C 35%,#E4C98A 55%,#C9A45C 75%,#8C6A36 100%)' }
  } }, plugins: []
}
