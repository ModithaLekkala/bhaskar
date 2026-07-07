// src/components/ThemeToggle.jsx
// -----------------------------------------------------------------------
// Light/Dark mode toggle button for the navbar.
//
// How it works:
//   - The chosen theme is stored in localStorage under "theme".
//   - Tailwind is configured with darkMode: 'class' (see tailwind.config.js)
//     so we just add/remove the "dark" class on <html> to switch themes.
//   - On first load, we respect a saved preference, otherwise fall back
//     to the user's OS-level preference.
// -----------------------------------------------------------------------
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle dark mode"
      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
