import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EFF6FF',  // blue-50
          100: '#DBEAFE', // blue-100
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // blue-500
          600: '#2563EB', // blue-600 (Main Accent)
          700: '#1D4ED8', // blue-700
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        neutral: {
          50: '#F5F5F7',  // Apple Canvas Gray
          100: '#F5F5F5', // Soft Surface
          200: '#E5E5EA', // Hairline Border
          300: '#D1D1D6', // Disabled state
          400: '#C7C7CC', // Subtle icons
          500: '#8E8E93', // Muted text
          600: '#86868B', // Secondary text
          700: '#333336', // Standard text
          800: '#1D1D1F', // Apple Dark Gray (Primary Headings)
          900: '#000000', // Pure black (avoid using directly)
        },
        chart: {
          base: '#D1D1D6', // Neutral gray for CIF
          tax: '#8E8E93',  // Darker gray for tax
          total: '#0071E3', // Accent blue for total
        }
      },
      boxShadow: {
        'stacked': '0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
} satisfies Config
