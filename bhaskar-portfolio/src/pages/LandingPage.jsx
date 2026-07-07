// src/pages/LandingPage.jsx
// -----------------------------------------------------------------------
// Public marketing homepage. No login required.
// Sections: Hero, Services, "Join the Club" newsletter signup.
// -----------------------------------------------------------------------
import NewsletterForm from '../components/NewsletterForm'

const services = [
  {
    title: 'Real Estate Marketing',
    desc: 'Targeted campaigns and local market insights for Lake Stevens area listings, helping properties reach the right buyers faster.',
  },
  {
    title: 'Brand Strategy',
    desc: 'Positioning, messaging, and visual identity work that makes your business memorable in a crowded market.',
  },
  {
    title: 'Digital Advertising',
    desc: 'Data-driven ad campaigns across search and social, optimized continuously for cost-per-lead and ROI.',
  },
  {
    title: 'Content & SEO',
    desc: 'Search-optimized content that builds long-term organic visibility instead of relying only on paid traffic.',
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Marketing that moves the needle
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
          Bhaskar Kanderi helps businesses and real estate clients grow with
          strategic, data-backed marketing — from brand to broadcast.
        </p>

        <div className="flex flex-col items-center gap-3">
          <p className="font-semibold">Join the Club for market updates & insights</p>
          <NewsletterForm />
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center">Services</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
