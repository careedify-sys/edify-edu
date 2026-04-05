import Link from 'next/link'
import { GUIDES } from '@/lib/guides'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online MBA Guides 2026 — Honest Answers | Edify',
  description: 'Clear, no-fluff guides for online MBA decisions in India. UGC DEB approval, NAAC rankings, eligibility, government jobs, and more.',
  keywords: 'online mba guides india, is online mba valid for government jobs, is online mba valid, ugc deb approved universities list, online mba for working professionals, online degree for government jobs, online mba eligibility, online mba admission 2026, naac a++ online university, nirf ranked online mba, distance mba guide, correspondence mba india, online mba india 2026, best online mba india, online mca course',
  alternates: { canonical: 'https://edifyedu.in/guides' },
  openGraph: {
    title: 'Online MBA Guides 2026 — Honest Answers | Edify',
    description: 'Clear, no-fluff guides for online MBA decisions in India. UGC DEB approval, NAAC rankings, eligibility, government jobs, and more.',
    url: 'https://edifyedu.in/guides',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Online MBA Guides India 2026 — Edify' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online MBA Guides 2026 | Edify',
    description: 'No-fluff guides on UGC DEB approval, NAAC rankings, government jobs, and online MBA eligibility in India.',
  },
}

export default function GuidesPage() {
  return (
    <div className="page-shell">
      <div className="bg-white border-b border-border py-7">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-navy mb-2 mt-0">Guides & Honest Answers</h1>
          <p className="body-sm m-0">No fluff. Straight answers to every question students ask before enrolling.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map(g=>(
            <Link key={g.id} href={`/guides/${g.id}`} className="no-underline">
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:24,height:'100%',cursor:'pointer',transition:'var(--t-base)'}}>
                <div className="text-[28px] mb-3">{g.icon}</div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--amber-text)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{g.tag}</div>
                <h2 className="text-[15px] font-bold text-navy leading-tight mb-2">{g.title}</h2>
                <p className="text-[13px] text-ink-3 leading-relaxed mb-3 mt-0">{g.desc}</p>
                <span className="text-[11px] text-[var(--ink-4)]">{g.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
