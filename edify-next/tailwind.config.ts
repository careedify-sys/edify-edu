import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0B1D35',
        amber:   '#D4922A',
        sage:    '#2E7D64',
        teal:    '#0E8A78',
        surface: '#FFFFFF',
        bg:      '#F7F8FA',
        ink:     '#0B1D35',
        ink2:    '#3B5068',
        ink3:    '#64788A',
        border:  '#E2E8F4',
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
