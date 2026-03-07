'use client'

import Link from 'next/link'


const GUIDES = [
  {
    id: 'validity',
    icon: '🏛️',
    tag: 'Validity',
    title: 'Is an online degree from these universities valid in India?',
    desc: 'UGC DEB approved = legally valid. But valid for what exactly? Govt jobs? Private sector? Abroad? The answer is different for each context.',
    readTime: '4 min read',
  },
  {
    id: 'govt-jobs',
    icon: '🏢',
    tag: 'Government Jobs',
    title: 'Can I get a central govt job with an online MBA or MCA?',
    desc: "The honest answer: it depends on which university and which job. Most online degrees won't work for central PSU promotions. Here's the complete picture.",
    readTime: '5 min read',
  },
  {
    id: 'online-vs-distance',
    icon: '📡',
    tag: 'Comparison',
    title: 'Online degree vs Distance education — what\'s the actual difference?',
    desc: 'Both give you the same degree certificate. The experience, learning quality, and employer perception are very different. This guide breaks it down.',
    readTime: '3 min read',
  },
  {
    id: 'worth-it',
    icon: '💰',
    tag: 'ROI',
    title: 'Is an online MBA actually worth the money in 2025?',
    desc: '₹2 lakh for a degree. Is it worth it? The answer depends entirely on what you\'re trying to achieve and where you are in your career.',
    readTime: '6 min read',
  },
  {
    id: 'employer-view',
    icon: '👔',
    tag: 'Employers',
    title: 'How do Indian employers actually view online degrees?',
    desc: 'The truth is nuanced. It depends on industry, company size, and which university. We map it out honestly — including where online degrees still face bias.',
    readTime: '5 min read',
  },
  {
    id: 'pick-right',
    icon: '🎯',
    tag: 'Decision Guide',
    title: 'How to pick the right online university — a 5-step framework',
    desc: 'Not all UGC approved online degrees are equal. Brand, specialisation, exam mode, fee, and your specific goal all matter. Here\'s how to decide.',
    readTime: '7 min read',
  },
]

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Honest Guides</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Honest Answers. No marketing fluff.
          </h1>
          <p className="text-slate-500 text-sm max-w-lg">
            The questions students really ask — about validity, government jobs, fees, and whether online degrees actually work — answered with no agenda.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDES.map(g => (
            <Link
              key={g.id}
              href={`/guides/${g.id}`}
              className="uni-card bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-300 block"
            >
              <div className="text-4xl mb-3">{g.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{g.tag}</span>
                <span className="text-xs text-slate-400">· {g.readTime}</span>
              </div>
              <h2 className="font-display font-bold text-slate-900 text-base mb-3 leading-snug">{g.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{g.desc}</p>
              <span className="text-sm font-bold text-orange-500">Read Guide →</span>
            </Link>
          ))}
        </div>


        {/* FAQ */}
        <div className="mt-12" style={{ borderTop: '1px solid #1e2f45', paddingTop: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>FAQ</div>
          <h2 className="font-display font-bold text-white text-xl mb-6">Questions About Online Degrees in India</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { q: 'Are online degrees from Indian universities valid in 2025?', a: 'Yes — online degrees from UGC DEB approved universities are 100% valid and equivalent to regular degrees. The UGC issued a notification in 2020 making this official. All universities on Edify are UGC DEB approved.' },
              { q: 'Can I do an online MBA without giving any entrance exam?', a: 'Yes — all online MBA programs listed on Edify require no entrance exam. Admission is based on your graduation marks (usually 50% minimum). This is a key difference from regular full-time MBA programs which require CAT/MAT/GMAT.' },
              { q: 'How do I know if an online university is genuine or fake?', a: 'Check two things: (1) UGC DEB approval — verify on ugc.ac.in, and (2) NAAC grade — verify on naac.gov.in. Any university not on both these lists is either fake or not recognised. All universities on Edify pass both checks.' },
              { q: 'What is the difference between UGC DEB and UGC approved?', a: 'UGC DEB (Distance Education Bureau) specifically approves universities to offer distance and online programs. Regular UGC approval is for regular/campus programs. For online degrees, you must check UGC DEB approval specifically — not just UGC approval.' },
              { q: 'Can I get a government job with an online MBA?', a: 'Yes — online degrees from UGC DEB approved universities are valid for government jobs. This was clarified by the Ministry of Education. The key requirement is UGC DEB approval, which all universities on Edify have.' },
            ].map((faq, i) => (
              <div key={i} style={{ padding: '18px 0', borderBottom: i < 4 ? '1px solid #1e2f45' : 'none' }}>
                <div style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '14px', marginBottom: '8px' }}>{faq.q}</div>
                <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.8' }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-6 text-center">
          <div className="text-white font-display font-bold text-lg mb-2">Our editorial policy</div>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Every guide on Edify is written with one goal: give students the information they need to make the right decision — even if that information is uncomfortable.
            We never soften facts because a university paid us. We don't get paid by universities.
          </p>
        </div>
      </div>
    </div>
  )
}
