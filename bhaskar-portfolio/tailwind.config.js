// tailwind.config.js
// -----------------------------------------------------------------------
// Tailwind CSS configuration.
// `darkMode: 'class'` is important: it means dark mode is toggled by
// adding/removing a `dark` class on the <html> element (done in
// src/components/ThemeToggle.jsx), rather than following the OS setting.
// -----------------------------------------------------------------------
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          900: '#1e1b4b',
        },
      },
    },
  },
  plugins: [],
}
