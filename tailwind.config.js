/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F6F2',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1E2B24',
          muted: '#5B6B62',
          soft: '#8A968F',
        },
        registry: {
          DEFAULT: '#22392F',
          light: '#2F4A3D',
          dark: '#152720',
        },
        accent: {
          DEFAULT: '#C97B3D',
          light: '#E0A167',
          soft: '#F3E3D2',
        },
        status: {
          paid: '#2F7D4F',
          paidBg: '#E4F2E8',
          partial: '#C98A2C',
          partialBg: '#FBF0DD',
          pending: '#B23B32',
          pendingBg: '#F8E5E2',
        },
        line: '#E1E4DE',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(30, 43, 36, 0.06), 0 1px 12px rgba(30, 43, 36, 0.04)',
      },
    },
  },
  plugins: [],
}
