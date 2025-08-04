/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Neo-brutalism design customizations - Mobile app inspired palette
      colors: {
        'neo-primary': '#8b5cf6',      // Dark purple (was red)
        'neo-secondary': '#84cc16',    // Lime green (was teal)
        'neo-accent': '#a855f7',       // Light purple (was blue)
        'neo-surface': '#f8fafc',      // Very light gray
        'neo-border': '#2d3436',       // Dark charcoal
        'neo-text': '#2d3436',         // Dark charcoal text
        'neo-background': '#ffffff',   // Pure white
        'neo-yellow': '#fbbf24',       // Yellow/gold accent
        'neo-purple': '#7c3aed',       // Dark purple
        'neo-lavender': '#e9d5ff',     // Light lavender
        'neo-teal': '#14b8a6',         // Teal accent
        
        // Dark mode colors
        'neo-primary-dark': '#7c3aed',     // Darker purple
        'neo-secondary-dark': '#65a30d',   // Darker lime green
        'neo-accent-dark': '#9333ea',      // Darker light purple
        'neo-surface-dark': '#1a1a1a',     // Dark gray
        'neo-border-dark': '#ffffff',      // White borders
        'neo-text-dark': '#ffffff',        // White text
        'neo-background-dark': '#121212',  // Very dark background
        'neo-yellow-dark': '#f59e0b',      // Darker yellow
        'neo-purple-dark': '#6d28d9',      // Darker purple
        'neo-lavender-dark': '#c084fc',    // Darker lavender
        'neo-teal-dark': '#0d9488',        // Darker teal
      },
      fontFamily: {
        'neo': ['Inter', 'system-ui', 'sans-serif'],
        'neo-mono': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        'neo': '8px',
        'neo-lg': '12px',
        'neo-xl': '16px',
      },
      borderWidth: {
        'neo': '3px',
        'neo-lg': '4px',
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #2d3436',
        'neo-lg': '6px 6px 0px 0px #2d3436',
        'neo-hover': '2px 2px 0px 0px #2d3436',
        'neo-dark': '4px 4px 0px 0px #ffffff',
        'neo-lg-dark': '6px 6px 0px 0px #ffffff',
        'neo-hover-dark': '2px 2px 0px 0px #ffffff',
      },
      spacing: {
        'neo': '1rem',
        'neo-lg': '1.5rem',
        'neo-xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 