/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#b9cdff',
          300: '#84a7ff',
          400: '#4d7aff',
          500: '#1a4fd6',
          600: '#1340b8',
          700: '#0f3296',
          800: '#0c2878',
          900: '#091e5e',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b800',
        },
        surface: '#f8f9fc',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(26,79,214,0.15)',
        modal: '0 24px 64px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    }
  },
  plugins: []
};
