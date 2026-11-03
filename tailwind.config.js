/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        thrift: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          red: '#E50914',
          accent: '#FF2E4D',
          dark: '#140004',
          card: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 50% -20%, rgba(229,9,20,0.22) 0%, rgba(255,255,255,0) 70%)',
        'red-mesh': 'radial-gradient(at 0% 0%, rgba(255, 46, 77, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(229, 9, 20, 0.12) 0px, transparent 50%)',
        'badge-gradient': 'linear-gradient(135deg, #FF2E4D 0%, #E50914 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
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

