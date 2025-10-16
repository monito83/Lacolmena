/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores para La Colmena - Pedagogía Waldorf
        primary: {
          50: '#F7E7E7',   // Rosa pastel suave
          100: '#F0D1D1',
          200: '#E1A3A3',
          300: '#D27575',
          400: '#C34747',
          500: '#B41919',
          600: '#901414',
          700: '#6C0F0F',
          800: '#480A0A',
          900: '#240505',
        },
        secondary: {
          50: '#E8F5E8',   // Verde salvia
          100: '#D1EBD1',
          200: '#A3D7A3',
          300: '#75C375',
          400: '#47AF47',
          500: '#199B19',
          600: '#147C14',
          700: '#0F5D0F',
          800: '#0A3E0A',
          900: '#051F05',
        },
        accent: {
          50: '#E6F3FF',   // Azul cielo
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#0087FF',
          600: '#006CCC',
          700: '#005199',
          800: '#003666',
          900: '#001B33',
        },
        warm: {
          50: '#FEFEFE',   // Blanco crema
          100: '#FDFDFD',
          200: '#FBFBFB',
          300: '#F9F9F9',
          400: '#F7F7F7',
          500: '#F5F5F5',
          600: '#C4C4C4',
          700: '#939393',
          800: '#626262',
          900: '#313131',
        },
        earth: {
          50: '#F5F4F2',   // Tonos tierra
          100: '#EBE9E5',
          200: '#D7D3CB',
          300: '#C3BDB1',
          400: '#AFA797',
          500: '#9B917D',
          600: '#7C7464',
          700: '#5D574B',
          800: '#3E3A32',
          900: '#1F1D19',
        },
        text: {
          primary: '#6B5B73',   // Marrón cálido
          secondary: '#8B7B93',
          muted: '#A99BB3',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'warm': '0 4px 6px -1px rgba(107, 91, 115, 0.1), 0 2px 4px -1px rgba(107, 91, 115, 0.06)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}


