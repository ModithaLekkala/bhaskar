// src/components/Footer.jsx
// -----------------------------------------------------------------------
// Simple footer shown at the bottom of every page.
// -----------------------------------------------------------------------
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} Bhaskar Kanderi. All rights reserved.</p>
        <p>Marketing Portfolio · Built with React, Tailwind & Supabase</p>
      </div>
    </footer>
  )
}
