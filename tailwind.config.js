/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 next-themes dùng class để toggle
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        display: ['var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        base:     'var(--base)',
        surface:  'var(--surface)',
        elevated: 'var(--elevated)',
        border:   'var(--border)',
        muted:    'var(--muted)',
        primary:  'var(--primary)',
        accent:   'var(--accent)',
        danger:   'var(--danger)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        fadeUp:  'fadeUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
