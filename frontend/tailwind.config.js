/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#171B20',
        'canvas-subtle': '#1A1F25',
        sidebar: '#1C2127',
        header: '#1C2127',
        panel: '#222830',
        elevated: '#272E37',
        inset: '#1E232A',
        surface: {
          DEFAULT: '#222830',
          hover: '#262D36',
          active: '#2A323D',
          elevated: '#272E37',
          subtle: '#1E232A',
          border: '#39414B',
          'border-subtle': '#2D3540',
          'border-active': '#4A5462',
        },
        'text-primary': '#E0E5EB',
        'text-secondary': '#A2ABB7',
        'text-muted': '#7F8996',
        'text-dim': '#56606D',
        accent: {
          DEFAULT: '#78AFA9',
          hover: '#8DBFB9',
          subtle: 'rgba(120, 175, 169, 0.12)',
          border: 'rgba(120, 175, 169, 0.3)',
        },
        'accent-secondary': {
          DEFAULT: '#6F9EBA',
          hover: '#84B2CE',
          subtle: 'rgba(111, 158, 186, 0.12)',
          border: 'rgba(111, 158, 186, 0.3)',
        },
        'status-normal': '#7FA68A',
        'status-normal-subtle': 'rgba(127, 166, 138, 0.12)',
        'status-normal-border': 'rgba(127, 166, 138, 0.28)',
        'status-anomaly': '#C4A36A',
        'status-anomaly-subtle': 'rgba(196, 163, 106, 0.12)',
        'status-anomaly-border': 'rgba(196, 163, 106, 0.28)',
        'status-threat': '#C17D7D',
        'status-threat-subtle': 'rgba(193, 125, 125, 0.12)',
        'status-threat-border': 'rgba(193, 125, 125, 0.28)',
        'status-simulated': '#8B9EB7',
        'status-simulated-subtle': 'rgba(139, 158, 183, 0.12)',
        'status-simulated-border': 'rgba(139, 158, 183, 0.28)',
        // Retain legacy keys for backwards compatibility
        darkNavy: '#171B20',
        charcoal: '#222830',
        accentCyan: '#78AFA9',
        accentRed: '#C17D7D',
        accentYellow: '#C4A36A',
        accentGreen: '#7FA68A',
        textMain: '#E0E5EB',
        textMuted: '#A2ABB7',
        borderSubtle: '#39414B'
      },
      borderColor: {
        DEFAULT: '#39414B',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'elevated': '0 3px 8px 0 rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
