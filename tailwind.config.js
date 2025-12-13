/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Green Nature Theme
        primary: '#426B48',      // Deep Natural Green (matching standard "Góc Hoa Xinh" shade)
        secondary: '#F3F4F6',    // Light Gray Background
        accent: '#FFD700',       // Gold accent for badges/highlights
        dark: '#1F2937',         // Dark Gray text
        light: '#FFFFFF',        // Pure White

        // Specific Category Colors
        'rose': '#E91E63',
        'leaf': '#66BB6A',
        'gold': '#FFA000',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Quicksand"', 'sans-serif'], // Quicksand is very popular for "cute" shops
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};
