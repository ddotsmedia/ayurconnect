/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kerala palette — calibrated to the AyurConnect logo (deep forest tree
        // + bright leaf bands). 700 is the wordmark colour, 500 is the soil
        // band colour. Use 700 for headings/CTAs, 500 for accents.
        kerala: {
          50:  '#ecfdf3',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#3da041', // logo "leaf" / soil band — vivid lime
          600: '#1d7c2f',
          700: '#155228', // logo wordmark + tree dark forest
          800: '#0d3d1a',
          900: '#06200a',
        },
        leaf: { // alias for the bright soil-band colour, makes intent clear
          50:  '#ecfdf3',
          400: '#5fc063',
          500: '#3da041',
          600: '#2c8230',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
        },
        cream:  '#fafaf7',
        ink:    '#1a1a1a',
        muted:  '#6b7280',
        subtle: '#9ca3af',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)',     'Inter',              'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        xl:   '22px',
      },
      boxShadow: {
        card:   '0 2px 20px rgba(0,0,0,.07)',
        cardLg: '0 8px 32px rgba(0,0,0,.12)',
        cardXl: '0 20px 60px rgba(0,0,0,.2)',
      },
      backgroundImage: {
        'hero-green':   'linear-gradient(135deg, #0d3d1a 0%, #155228 50%, #1d7c2f 100%)',
        'hero-tourism': 'linear-gradient(135deg, #0d3d1a 0%, #155228 100%)',
        'hero-forum':   'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
        'hero-jobs':    'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        'hero-bot':     'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #155228 100%)',
        'hero-hospital':'linear-gradient(135deg, #0c2340 0%, #1a3a6b 100%)',
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'slide-up': 'slide-up 200ms ease-out',
      },
    },
  },
  plugins: [],
}
