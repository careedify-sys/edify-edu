import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0B1D35',
        amber: {
          DEFAULT: '#D4922A',
          50:  '#FFF9EC',
          100: '#FEF3DC',
          200: '#FDE8B4',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        'amber-bright': '#E09520',
        'amber-text':   '#A0650F',
        'amber-light':  '#FEF3DC',
        sage:    '#2E7D64',
        'sage-bright':  '#3AA17F',
        'sage-light':   '#E4F5EF',
        teal:    '#0E8A78',
        surface:    '#FFFFFF',
        'surface-2': '#F0F3F8',
        'surface-3': '#E7EDF6',
        bg:      '#F7F8FA',
        ink:     '#0B1D35',
        'ink-2': '#344A62',
        'ink-3': '#607B96',
        'ink-4': '#6B7E92',
        ink2:    '#344A62',
        ink3:    '#607B96',
        border:  '#E2E8F4',
        'border-light': '#EDF1F8',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm:    '0 1px 4px rgba(11,29,53,0.08)',
        md:    '0 4px 16px rgba(11,29,53,0.10)',
        lg:    '0 8px 32px rgba(11,29,53,0.12)',
        xl:    '0 20px 60px rgba(11,29,53,0.16)',
        amber: '0 4px 20px rgba(212,146,42,0.35)',
      },
    },
  },
  plugins: [],
}
export default config
