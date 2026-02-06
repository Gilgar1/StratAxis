/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // StratAxis Brand Colors - Minimal, Professional
                primary: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                accent: {
                    gold: '#D4AF37',
                    'gold-light': '#E5C158',
                    'gold-dark': '#B8941F',
                },
                cream: {
                    50: '#fdfcfb',
                    100: '#faf8f5',
                    200: '#f5f1ea',
                    300: '#ede7dc',
                },
                semantic: {
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#3b82f6',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
                'hard': '0 8px 24px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [],
}
