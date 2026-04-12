/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0faf6',
          100: '#d5f0e5',
          200: '#aae0cb',
          300: '#6ec9a8',
          400: '#3aad85',
          500: '#0d9488',
          600: '#0f766e',
          700: '#084f3f',
          800: '#063d31',
          900: '#042e25',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b800',
        },
        surface: '#f5f7f9',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover':'0 8px 28px rgba(13,122,95,0.15)',
        modal:      '0 24px 64px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    }
  },
  plugins: []
};
