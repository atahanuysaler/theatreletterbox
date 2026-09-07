/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Backgrounds & Surfaces (IBM Carbon Light)
        canvas: '#FFFFFF',
        'surface-canvas': '#FFFFFF',
        'layer-01': '#F4F4F4',
        'layer-1': '#F4F4F4',
        'surface-layer-01': '#F4F4F4',
        'layer-02': '#E0E0E0',
        'layer-2': '#E0E0E0',
        'surface-layer-02': '#E0E0E0',
        overlay: 'rgba(22, 22, 22, 0.45)',
        'surface-overlay': 'rgba(22, 22, 22, 0.45)',

        // Text & Contrast Hierarchy
        primary: '#161616',
        'text-primary': '#161616',
        secondary: '#525252',
        'text-secondary': '#525252',
        tertiary: '#8D8D8D',
        'text-tertiary': '#8D8D8D',
        'text-inverse': '#FFFFFF',

        // Theatrical Accents & Carbon Interactive Tokens
        'theatre-curtain': '#BA1B23',
        'theatre-curtain-hover': '#A2191F',
        'theatre-gold': '#F1C21B',
        'stage-spotlight': '#F1C21B',
        'interactive-primary': '#0F62FE',
        'interactive-hover': '#0353E9',
        'interactive-active': '#002D9C',
        'success-mint': '#198038',

        // Architectural Borders
        subtle: '#E0E0E0',
        'border-subtle': '#E0E0E0',
        strong: '#8D8D8D',
        'border-strong': '#8D8D8D',

        // Leaderboard Top-3 Accents
        'rank-gold': '#F1C21B',
        'rank-silver': '#A8A8A8',
        'rank-bronze': '#BA4E00',

        // Carbon Reference Palette
        carbon: {
          white: '#FFFFFF',
          gray10: '#F4F4F4',
          gray20: '#E0E0E0',
          gray30: '#C6C6C6',
          gray50: '#8D8D8D',
          gray70: '#525252',
          gray100: '#161616',
          blue60: '#0F62FE',
          blue70: '#0353E9',
          blue80: '#002D9C',
          red60: '#BA1B23',
          red70: '#A2191F',
          gold: '#F1C21B',
          green60: '#198038',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        display: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'Menlo', 'Monaco', 'Cascadia Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
        lg: '4px',
        full: '9999px',
      },
      aspectRatio: {
        poster: '2 / 3',
        story: '9 / 16',
        og: '16 / 9',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
        '16/9': '16 / 9',
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
      transitionDuration: {
        fast: '100ms',
        DEFAULT: '150ms',
        normal: '150ms',
      },
      boxShadow: {
        flat: 'none',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        hover: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        modal: '0 12px 32px 0 rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
};
