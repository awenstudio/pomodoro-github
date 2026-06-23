/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pawodoro warm palette — healing, cozy, animal-themed
        cream: {
          50: '#FFFDF7',
          100: '#FFF9E8',
          200: '#FFF3D1',
          300: '#FFE8B0',
          400: '#FFD97A',
        },
        moss: {
          300: '#A8D5A2',
          400: '#7BC47A',
          500: '#5AAF5E',
          600: '#3D8B41',
          700: '#2D6B30',
        },
        tea: {
          300: '#FFB87A',
          400: '#FF9E4A',
          500: '#FF8520',
          600: '#E06D10',
        },
        mist: {
          300: '#A5C4E0',
          400: '#7BA8D1',
          500: '#5A8FC2',
          600: '#3D72A8',
        },
        blush: {
          300: '#FFB3B3',
          400: '#FF8A8A',
          500: '#FF6B6B',
        },
        surface: {
          0: '#1A1814',
          1: '#22201A',
          2: '#2A2822',
          3: '#33302A',
          4: '#3D3A33',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'sleep-bob': 'sleepBob 2s ease-in-out infinite',
        'heart-pop': 'heartPop 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.8)' },
        },
        sleepBob: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-2px) rotate(2deg)' },
        },
        heartPop: {
          '0%': { opacity: '0', transform: 'scale(0) translateY(0)' },
          '50%': { opacity: '1', transform: 'scale(1.2) translateY(-10px)' },
          '100%': { opacity: '0', transform: 'scale(0.8) translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
