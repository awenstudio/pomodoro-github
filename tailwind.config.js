/* ─────────────────────────────────────────────────────
 *  Tailwind Config — Pawodoro Design System
 *
 *  Design Direction: Warm, cozy, nature-inspired.
 *  Signature: Warm glow halos + paper texture +
 *  playful Quicksand typography.
 * ───────────────────────────────────────────────────── */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      /* ── Color System ─────────────────────────────── */

      colors: {
        // Core surfaces — warmer, less cold
        'surface-1': '#1F1C18',
        'surface-2': '#28251F',
        'surface-3': '#33302A',
        'surface-4': '#3D3A34',

        // Cream text — warm off-whites
        cream: {
          50:  '#FFFDF5',
          100: '#FFF8E6',
          200: '#FFEDCC',
          300: '#E8D5B5',
          400: '#B8A890',
          500: '#8A7D6D',
          600: '#5C544A',
        },

        // Moss — earthy green (nature, not tech)
        moss: {
          50:  '#F0F7ED',
          100: '#D8EDCF',
          200: '#B5D9A8',
          300: '#8FC07E',
          400: '#6FA85C',
          500: '#4D8B3E',
          600: '#3D7030',
          700: '#2F5726',
          800: '#23401D',
          900: '#182D15',
        },

        // Tea — warm amber accent
        tea: {
          50:  '#FFF8F0',
          100: '#FFE8CC',
          200: '#FFD4A3',
          300: '#F5B87A',
          400: '#E89B52',
          500: '#D4803A',
          600: '#B0662E',
          700: '#8C4F24',
          800: '#6B3D1C',
          900: '#4A2B14',
        },

        // Mist — cool contrast for variety
        mist: {
          50:  '#F0F4F8',
          100: '#D9E2EC',
          200: '#B6C7D8',
          300: '#8FAABF',
          400: '#6B8FA6',
          500: '#4D7590',
          600: '#3A5C75',
          700: '#2D475C',
          800: '#213444',
          900: '#16232E',
        },

        // Blush — warm pink for pet mood
        blush: {
          50:  '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFAAAA',
          400: '#FF8888',
          500: '#E86868',
          600: '#CC4D4D',
          700: '#A33838',
          800: '#7A2828',
          900: '#521A1A',
        },

        // Honey — golden accent for XP/rewards
        honey: {
          50:  '#FFFBF0',
          100: '#FFF3D4',
          200: '#FFE6A3',
          300: '#FFD970',
          400: '#FFCC3D',
          500: '#E6B800',
          600: '#CC9F00',
          700: '#A37A00',
          800: '#7A5C00',
          900: '#523D00',
        },
      },

      /* ── Typography ───────────────────────────────── */

      fontFamily: {
        display: ['Quicksand', 'Nunito', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },

      fontSize: {
        // Refined type scale for popup
        'display': ['1.75rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline': ['1.25rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'subhead': ['1rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'tiny': ['0.625rem', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '0.02em' }],
      },

      /* ── Border Radius ────────────────────────────── */

      borderRadius: {
        'card': '1rem',
        'pill': '9999px',
        'soft': '0.75rem',
      },

      /* ── Shadows — warm-tinted ────────────────────── */

      boxShadow: {
        'glow-sm': '0 0 12px rgba(90,175,94,0.12)',
        'glow': '0 0 24px rgba(90,175,94,0.18)',
        'glow-lg': '0 0 48px rgba(90,175,94,0.24)',
        'warm': '0 4px 24px rgba(255,159,74,0.08)',
        'warm-lg': '0 8px 40px rgba(255,159,74,0.12)',
        'card': '0 2px 12px rgba(0,0,0,0.3), 0 0 1px rgba(255,248,230,0.05)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4), 0 0 1px rgba(255,248,230,0.08)',
      },

      /* ── Animations ───────────────────────────────── */

      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow': 'glowPulse 2.5s ease-in-out infinite',
        'glow-warm': 'glowWarm 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'spring-in': 'springIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'wiggle': 'wiggle 0.4s ease-in-out',
        'confetti-0': 'confettiFall0 1.5s ease-out forwards',
        'confetti-1': 'confettiFall1 1.5s ease-out forwards',
        'confetti-2': 'confettiFall2 1.5s ease-out forwards',
        'confetti-3': 'confettiFall3 1.5s ease-out forwards',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.08)' },
          '60%': { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(90,175,94,0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(90,175,94,0.3)' },
        },
        glowWarm: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(255,159,74,0.1), 0 0 24px rgba(90,175,94,0.08)' },
          '50%': { boxShadow: '0 0 20px rgba(255,159,74,0.15), 0 0 40px rgba(90,175,94,0.12)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        springIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(20px)' },
          '50%': { transform: 'scale(1.05) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        confettiFall0: {
          from: { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: '1' },
          to: { transform: 'translateY(500px) translateX(-60px) rotate(720deg)', opacity: '0' },
        },
        confettiFall1: {
          from: { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: '1' },
          to: { transform: 'translateY(480px) translateX(50px) rotate(-540deg)', opacity: '0' },
        },
        confettiFall2: {
          from: { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: '1' },
          to: { transform: 'translateY(520px) translateX(-30px) rotate(600deg)', opacity: '0' },
        },
        confettiFall3: {
          from: { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: '1' },
          to: { transform: 'translateY(460px) translateX(40px) rotate(-480deg)', opacity: '0' },
        },
      },

      /* ── Backdrop Blur ────────────────────────────── */

      backdropBlur: {
        'xs': '2px',
      },

      /* ── Spacing ──────────────────────────────────── */

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
