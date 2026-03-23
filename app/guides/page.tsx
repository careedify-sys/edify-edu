import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Online Degree Guides India 2026 — Validity, Jobs & FAQ | Edify',
  description: 'Honest guides to online degrees in India. Is it valid? Can I get a govt job? How to pick? Answered with real data, no agenda.',
  alternates: { canonical: 'https://edifyedu.in/guides' },
}

const GUIDES = [
  {
    id: 'validity',
    icon: '🏛️',
    tag: 'Validity',
    tagColor: '#3AA17F',
    title: 'Is an online degree from these universities valid in India?',
    desc: 'UGC DEB approved = legally valid. But valid for what exactly? Govt jobs? Private sector? Abroad? The answer is different for each context.',
    readTime: '4 min read',
  },
  {
    id: 'govt-jobs',
    icon: '🏢',
    tag: 'Government Jobs',
    tagColor: '#2563EB',
    title: 'Can I get a central govt job with an online MBA or MCA?',
    desc: "The honest answer: it depends on which university and which job. Most online degrees won't work for central PSU promotions. Here's the complete picture.",
    readTime: '5 min read',
  },
  {
    id: 'online-vs-distance',
    icon: '📡',
    tag: 'Comparison',
    tagColor: '#7C3AED',
    title: "Online degree vs Distance education — what's the actual difference?",
    desc: 'Both give you the same degree certificate. The experience, learning quality, and employer perception are very different. This guide breaks it down.',
    readTime: '3 min read',
  },
  {
    id: 'worth-it',
    icon: '💰',
    tag: 'ROI',
    tagColor: '#c9922a',
    title: 'Is an online MBA actually worth the money in 2026?',
    desc: "₹2 lakh for a degree. Is it worth it? The answer depends entirely on what you're trying to achieve and where you are in your career.",
    readTime: '6 min read',
  },
  {
    id: 'employer-view',
    icon: '👔',
    tag: 'Employers',
    tagColor: '#059669',
    title: 'How do Indian employers actually view online degrees?',
    desc: 'The truth is nuanced. It depends on industry, company size, and which university. We map it out honestly — including where online degrees still face bias.',
    readTime: '5 min read',
  },
  {
    id: 'pick-right',
    icon: '🎯',
    tag: 'Decision Guide',
    tagColor: '#DC2626',
    title: 'How to pick the right online university — a 5-step framework',
    desc: "Not all UGC approved online degrees are equal. Brand, specialisation, exam mode, fee, and your specific goal all matter. Here's how to decide.",
    readTime: '7 min read',
  },
]

const FAQS = [
  {
    q: 'Are online degrees from Indian universities valid in 2026?',
    a: 'Yes — online degrees from UGC DEB approved universities are 100% valid and equivalent to regular degrees. The UGC issued a notification in 2020 making this official. All universities on Edify are UGC DEB approved.',
  },
  {
    q: 'Can I do an online MBA without giving any entrance exam?',
    a: 'Yes — all online MBA programs listed on Edify require no entrance exam. Admission is based on your graduation marks (usually 50% minimum). This is a key difference from regular full-time MBA programs which require CAT/MAT/GMAT.',
  },
  {
    q: 'How do I know if an online university is genuine or fake?',
    a: 'Check two things: (1) UGC DEB approval — verify on ugc.ac.in, and (2) NAAC grade — verify on naac.gov.in. Any university not on both these lists is either fake or not recognised. All universities on Edify pass both checks.',
  },
  {
    q: 'What is the difference between UGC DEB and UGC approved?',
    a: 'UGC DEB (Distance Education Bureau) specifically approves universities to offer distance and online programs. Regular UGC approval is for regular/campus programs. For online degrees, you must check UGC DEB approval specifically — not just UGC approval.',
  },
  {
    q: 'Can I get a government job with an online MBA?',
    a: 'Yes — online degrees from UGC DEB approved universities are valid for government jobs. This was clarified by the Ministry of Education. The key requirement is UGC DEB approval, which all universities on Edify have.',
  },
]

export default function GuidesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Hero Header ────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#0B1D35 0%,#0f2137 100%)', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            Honest Guides · No Agenda
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 12, maxWidth: 600 }}>
            Online Degree Guides India 2026 — Validity, Jobs &amp; FAQ
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7, maxWidth: 520, marginBottom: 24 }}>
            The questions students really ask — about validity, government jobs, fees, and whether online degrees actually work — answered with no agenda.
          </p>
          {/* Trust pills */}
          <div className="flex flex-wrap gap-2">
            {['✅ UGC DEB Verified Data', '🔒 Zero Paid Placements', '📊 NIRF Rankings'].map(pill => (
              <span key={pill} style={{ fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Guide Cards Grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {GUIDES.map(g => (
            <Link
              key={g.id}
              href={`/guides/${g.id}`}
              className="group no-underline"
            >
              <div
                className="h-full flex flex-col rounded-2xl bg-white hover:shadow-md transition-all"
                style={{ border: '1px solid var(--border)', borderTop: `3px solid ${g.tagColor}` }}
              >
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Icon */}
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{g.icon}</div>

                  {/* Tag + read time */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: `${g.tagColor}15`, color: g.tagColor }}
                    >
                      {g.tag}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>· {g.readTime}</span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-bold leading-snug mb-3 flex-1 group-hover:text-amber transition-colors" style={{ fontSize: '15px', color: 'var(--navy)' }}>
                    {g.title}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 16 }}>
                    {g.desc}
                  </p>

                  {/* CTA */}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)' }}>
                    Read Guide →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── FAQ Section ─────────────────────────────────────── */}
        <div className="mt-12 sm:mt-16">
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            FAQ
          </div>
          <h2 className="font-display font-bold mb-8" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: 'var(--navy)' }}>
            Questions About Online Degrees in India
          </h2>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#fff' }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  padding: '18px 20px',
                  borderBottom: i < FAQS.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '14px', marginBottom: 8, lineHeight: 1.5 }}>
                  {faq.q}
                </div>
                <div style={{ color: 'var(--ink-3)', fontSize: '13px', lineHeight: 1.8 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Editorial Policy ─────────────────────────────────── */}
        <div
          className="mt-10 sm:mt-12 rounded-2xl p-6 sm:p-8 text-center"
          style={{ background: 'linear-gradient(135deg,#0B1D35,#142540)', border: '1px solid #1e2f45' }}
        >
          <div className="text-3xl mb-3">📋</div>
          <div className="font-display font-bold text-white text-lg mb-2">Our editorial policy</div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 20px' }}>
            Every guide on Edify is written with one goal: give students the information they need to make the right decision — even if that information is uncomfortable.
            We never soften facts because a university paid us. We don't get paid by universities.
          </p>
          <Link
            href="/universities"
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm no-underline transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))', color: 'var(--navy)' }}
          >
            Browse All Universities →
          </Link>
        </div>

      </div>
    </div>
  )
}
