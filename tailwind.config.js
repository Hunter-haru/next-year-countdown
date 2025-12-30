/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 50px rgba(255, 255, 255, 0.2)',
          },
        },
        'glow-intense': {
          '0%, 100%': {
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)',
          },
          '50%': {
            textShadow: '0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.8), 0 0 90px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.4)',
          },
        },
        'zoom-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'zoom-intense': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        flash: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        'glow-intense': 'glow-intense 1s ease-in-out infinite',
        'zoom-pulse': 'zoom-pulse 2s ease-in-out infinite',
        'zoom-intense': 'zoom-intense 0.5s ease-in-out infinite',
        flash: 'flash 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
