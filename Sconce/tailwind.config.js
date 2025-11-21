/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui style tokens for demo
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        muted: 'hsl(210 40% 96.1%)',
        'muted-foreground': 'hsl(215.4 16.3% 46.9%)',
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(215 20.2% 65.1%)',
        // Legacy playful palette (may still be used in some components)
        turquoise: '#3BC9DB',
        coral: '#FF6B6B',
        mint: '#A8E6CF',
        desert: '#FDE2B2',
        sun: '#FFD166',
        // New brand core
        primary: '#004AAD', // Deep blue
        accent: '#F4B400',  // Bright yellow accent
        dark: '#111111',
        slateish: '#1a1f29',
        brandgray: {
          50: '#f5f7fb',
          100: '#eef2f7',
          200: '#dde3ec',
          300: '#c3cedb',
          400: '#96a4b3',
          500: '#6b7989',
          600: '#4f5a66',
          700: '#3c4550',
          800: '#2e343c',
          900: '#1f2328'
        }
      },
      fontFamily: {
        display: ['Poppins', 'Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'Poppins', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 16px 0 rgba(0,0,0,0.06)',
        lift: '0 8px 24px -4px rgba(0,0,0,0.12)'
      },
      keyframes: {
        'fade-in-up': { 
          '0%': { opacity: '0', transform: 'translateY(30px)' }, 
          '100%': { opacity: '1', transform: 'translateY(0)' } 
        },
        'bounce-soft': { 
          '0%,100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-4px)' } 
        },
        'float-slow': { 
          '0%,100%': { transform:'translateY(0)' }, 
          '50%': { transform:'translateY(-10px)' } 
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(.4,0,.2,1) forwards',
        'bounce-soft': 'bounce-soft 450ms ease-in-out',
        'float-slow': 'float-slow 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
