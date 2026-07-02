/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Frutiger Aero + GitHub avatar-inspired palette (exact hexes finalized after avatar inspection in impl step)
        'aero-bg': '#7cc4f2',        // frutiger sky
        'aero-panel': 'rgba(255, 255, 255, 0.62)',
        'aero-border': 'rgba(255, 255, 255, 0.85)',
        'aero-primary': '#0099e0',   // aqua cyan
        'aero-accent': '#7FC400',    // grass lime
        'aero-gloss': '#ffffff',
        'aero-text': '#0d3a5c',      // deep sky navy
        'aero-muted': '#48749c',
        'aero-matched': '#3fc45f',   // glossy grass green
        'aero-unmatched': '#a9bfd2', // hazy sky gray
      },
      backdropBlur: {
        'aero': '20px',
      },
      borderRadius: {
        'aero': '16px',
      },
    },
  },
  plugins: [],
}

