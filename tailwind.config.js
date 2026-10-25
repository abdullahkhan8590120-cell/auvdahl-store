// Royal Obsidian palette. Legacy token names (luxe, charcoal, gold-metal, bronze) are kept so
// admin/account/auth pages keep working, but they now resolve to the new flat palette.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      obsidian:'#080808', midnight:'#151310', luxe:'#151310', charcoal:'#151310',
      gold:'#C9A96A', champagne:'#E8D3A2', ivory:'#F4EDE0', taupe:'#A89B88', bronze:'#A89B88',
    },
    fontFamily: { serif:['"Cormorant Garamond"','Georgia','serif'], sans:['Jost','system-ui','sans-serif'] },
    backgroundImage: { 'gold-metal':'linear-gradient(#C9A96A,#C9A96A)' },
    maxWidth: { page:'88rem' },
  } }, plugins: []
}
