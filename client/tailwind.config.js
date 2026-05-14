/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── CLYRO color tokens ──────────────────────────
        'clyro-cream':   '#F4F2ED', // main background
        'clyro-card':    '#ECEAE3', // card / secondary bg
        'clyro-soft':    '#E2DED5', // tertiary / image bg
        'clyro-muted':   '#D5D0C5', // thumbnails / quaternary
        'clyro-border':  '#DEDAD1', // subtle borders (0.5px)
        'clyro-border2': '#C8C4B8', // secondary borders
        // ── Ink scale ──────────────────────────────────
        'ink':   '#1A1918', // primary text + dark buttons
        'ink-2': '#38372F', // secondary text
        'ink-3': '#5C5A52', // tertiary text
        'ink-4': '#9A9888', // muted / labels
        // ── Accent ─────────────────────────────────────
        'sage':  '#8FA88A', // success badges, active states
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        // CLYRO radius scale
        'clyro-sm': '14px', // inputs, small cards
        'clyro-lg': '24px', // product cards, modals
        'clyro-pill': '40px', // pill buttons, chips, search bar
      },
      transitionTimingFunction: {
        'clyro': 'cubic-bezier(.16,1,.3,1)',
      },
      backdropBlur: {
        'clyro': '20px',
      },
      boxShadow: {
        'clyro-card': '0 20px 48px rgba(26,25,24,.10)',
        'clyro-nav':  '0 1px 20px rgba(26,25,24,.05)',
        'clyro-btn':  '0 8px 24px rgba(26,25,24,.15)',
      },
    },
  },
  plugins: [],
}
