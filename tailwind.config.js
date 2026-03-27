/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#09090f',
          secondary: '#0d0d18',
          card: '#111120',
          border: '#1e1e2e',
          hover: '#1a1a28',
        },
        brand: {
          purple: '#7c3aed',
          violet: '#4f46e5',
          light: '#c4b5fd',
          muted: '#a78bfa',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#475569',
          accent: '#c4b5fd',
        },
        status: {
          green: '#34d399',
          red: '#f87171',
          yellow: '#fbbf24',
          blue: '#60a5fa',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
