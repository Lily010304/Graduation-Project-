/** Tailwind v3 CommonJS config for compatibility fallback */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        turquoise: '#3BC9DB',
        coral: '#FF6B6B',
        mint: '#A8E6CF',
        desert: '#FDE2B2',
        sun: '#FFD166'
      },
      fontFamily: {
        display: ['Poppins','Nunito','system-ui','sans-serif'],
        body: ['Nunito','Poppins','system-ui','sans-serif']
      },
      boxShadow: {
        soft: '0 4px 16px 0 rgba(0,0,0,0.06)',
        lift: '0 8px 24px -4px rgba(0,0,0,0.12)'
      },
      keyframes: {
        'fade-in-up': { '0%': { opacity: 0, transform: 'translateY(30px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'bounce-soft': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        'float-slow': { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } }
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
