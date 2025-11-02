import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // FoundersForge Brand Colors
        ocean: {
          50: '#e6f4ff',
          100: '#b3dcff',
          200: '#80c4ff',
          300: '#4dacff',
          400: '#2d9cdb',
          500: '#2080c0',
          600: '#1a6ba3',
          700: '#135686',
          800: '#0d4169',
          900: '#062c4c',
        },
        flame: {
          50: '#fff4ed',
          100: '#ffe0cc',
          200: '#ffccaa',
          300: '#ffb88',
          400: '#ffa466',
          500: '#ff6b22',
          600: '#e65100',
          700: '#cc4700',
          800: '#b33d00',
          900: '#993300',
        },
        gold: {
          50: '#fffbeb',
          100: '#fff3c1',
          200: '#ffeb97',
          300: '#ffe36d',
          400: '#ffdb43',
          500: '#ffc400',
          600: '#e6b000',
          700: '#cc9c00',
          800: '#b38800',
          900: '#997400',
        },
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #ff6b22 0%, #ff9966 100%)',
        'ocean-gradient': 'linear-gradient(135deg, #2d9cdb 0%, #4facff 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffc400 0%, #ffe36d 100%)',
        'forge-gradient': 'linear-gradient(135deg, #2d9cdb 0%, #ff6b22 50%, #ffc400 100%)',
        'aurora-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255, 107, 34, 0.3)',
        'glow': '0 0 20px rgba(255, 107, 34, 0.4)',
        'glow-lg': '0 0 30px rgba(255, 107, 34, 0.5)',
        'ocean-glow': '0 0 20px rgba(45, 156, 219, 0.4)',
        'gold-glow': '0 0 20px rgba(255, 196, 0, 0.4)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-in-out',
        'fade-in-down': 'fadeInDown 0.5s ease-in-out',
        'slide-in-right': 'slideInRight 0.5s ease-in-out',
        'slide-in-left': 'slideInLeft 0.5s ease-in-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
