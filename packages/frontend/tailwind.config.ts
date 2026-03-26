import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:not(.light *) }',
      '&:is(.dark *)',
    ],
  ],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@eveworld/ui-components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': '0.625rem',
      },
      screens: {
        mobile: { max: '580px' },
        xs: '375px',
        sm: '390px',
        md: '810px',
        lg: '1200px',
      },
      colors: {
        'sds-light': 'var(--sds-light)',
        'sds-dark': 'var(--sds-dark)',
        'sds-pink': 'var(--sds-pink)',
        'sds-blue': 'var(--sds-blue)',
        'sds-accent-a11': 'var(--accent-a11)',
        neutral: {
          DEFAULT: 'hsla(60, 100%, 92%, 1)',
          20: 'hsla(60, 100%, 92%, 0.2)',
        },
        crude: {
          DEFAULT: 'hsla(20, 65%, 5%, 1)',
          btn: 'hsla(220, 5%, 12%, 0.7)',
          2: 'hsla(223, 7%, 58%, 1)',
          3: 'hsla(222, 5%, 52%, 1)',
          5: 'hsla(20, 65%, 5%, 0.5)',
          7: 'hsla(225, 5%, 16%, 1)',
          9: 'hsla(210, 5%, 8%, 1)',
        },
        quantum: {
          DEFAULT: 'hsl(43, 100%, 59%)',
          2: 'hsla(43, 100%, 59%, 70%)',
          8: 'hsla(23, 95%, 40%, 0.8)',
          btn: 'hsla(43, 100%, 59%, 30%)',
        },
        brightquantum: {
          DEFAULT: 'hsla(26, 85%, 58%, 1)',
          5: 'hsla(26, 85%, 58%, 0.5)',
        },
        blue: {
          warn: 'hsla(232, 89%, 45%, 0.8)',
        },
        grayneutral: {
          DEFAULT: 'hsla(55, 9%, 51%, 1)',
        },
      },
      fontFamily: {
        inter: 'var(--sds-font-inter)',
        display: 'var(--sds-font-display)',
        mono: 'var(--sds-font-mono)',
      },
      boxShadow: {
        toast: 'inset 0 0 0 1px var(--accent-a7)',
      },
    },
  },
  plugins: [],
}

export default config
