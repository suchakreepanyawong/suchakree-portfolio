/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'var(--font-thai)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        vercel: {
          canvas: '#000000',
          'canvas-subtle': '#0a0a0c',
          'canvas-card': '#111114',
          'canvas-card-hover': '#18181c',
          ink: '#171717',
          hairline: 'rgba(255, 255, 255, 0.08)',
          'hairline-strong': 'rgba(255, 255, 255, 0.15)',
          develop: '#007cf0',
          developEnd: '#00dfd8',
          preview: '#7928ca',
          previewEnd: '#ff0080',
          ship: '#ff4d4d',
          shipEnd: '#f9cb28',
          cyan: '#50e3c2',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        cyber: {
          blue: '#00f0ff',
          green: '#10b981',
          purple: '#8b5cf6',
          dark: '#0a0f1d',
          card: '#111827',
        }
      },
      letterSpacing: {
        'display-xl': '-0.05em',
        'display-lg': '-0.04em',
        'display-md': '-0.03em',
        'display-sm': '-0.02em',
      },
      animation: {
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

