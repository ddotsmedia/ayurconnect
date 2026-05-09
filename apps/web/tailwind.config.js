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
        kerala: {
          50:  '#f0fdf4',
          100: '#e8f5e9',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#1b5e20',
          700: '#155724',
          800: '#0a2e0f',
          900: '#06200a',
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
        'hero-green':   'linear-gradient(135deg, #0a2e0f 0%, #1b5e20 50%, #2d6a4f 100%)',
        'hero-tourism': 'linear-gradient(135deg, #0a2e0f 0%, #1b5e20 100%)',
        'hero-forum':   'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
        'hero-jobs':    'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        'hero-bot':     'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #1b5e20 100%)',
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
