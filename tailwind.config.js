/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Backgrounds & Surfaces (Dynamic with Alpha Support)
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        'surface-canvas': 'rgb(var(--color-canvas) / <alpha-value>)',
        'layer-01': 'rgb(var(--color-layer-01) / <alpha-value>)',
        'layer-1': 'rgb(var(--color-layer-01) / <alpha-value>)',
        'surface-layer-01': 'rgb(var(--color-layer-01) / <alpha-value>)',
        'layer-02': 'rgb(var(--color-layer-02) / <alpha-value>)',
        'layer-2': 'rgb(var(--color-layer-02) / <alpha-value>)',
        'surface-layer-02': 'rgb(var(--color-layer-02) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        'surface-overlay': 'rgb(var(--color-overlay) / <alpha-value>)',

        // Text & Contrast Hierarchy
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        'text-inverse': 'rgb(var(--color-text-inverse) / <alpha-value>)',

        // Theatrical Accents & Carbon Interactive Tokens
        'theatre-curtain': 'rgb(var(--color-theatre-curtain) / <alpha-value>)',
        'theatre-curtain-hover': 'rgb(var(--color-theatre-curtain-hover) / <alpha-value>)',
        'theatre-gold': 'rgb(var(--color-theatre-gold) / <alpha-value>)',
        'stage-spotlight': 'rgb(var(--color-stage-spotlight) / <alpha-value>)',
        'interactive-primary': 'rgb(var(--color-interactive-primary) / <alpha-value>)',
        'interactive-hover': 'rgb(var(--color-interactive-hover) / <alpha-value>)',
        'interactive-active': 'rgb(var(--color-interactive-active) / <alpha-value>)',
        'success-mint': 'rgb(var(--color-success-mint) / <alpha-value>)',

        // Architectural Borders
        subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
        'border-subtle': 'rgb(var(--color-border-subtle) / <alpha-value>)',
        strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        'border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',



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
        spotlight: '0 0 16px rgba(229, 169, 27, 0.45)',
        'spotlight-lg': '0 0 28px rgba(229, 169, 27, 0.65)',
        'theatre-glow': '0 0 20px rgba(158, 27, 34, 0.3)',
      },
    },
  },
  plugins: [],
};
