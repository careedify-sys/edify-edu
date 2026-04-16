// app/compare/page.tsx — Server Component wrapper
// Static H1/H2/content is server-rendered (crawler-visible)
// Interactive comparison tool loads client-side via CompareClient
import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, ShieldCheck, Zap, ChevronRight } from 'lucide-react'
import CompareClient from '@/components/CompareClient'

export const metadata: Metadata = {
  title: 'Compare Online MBA & MCA Universities 2026 — Fees, Syllabus & Rankings | EdifyEdu',
  description: 'Compare online MBA and MCA universities side by side. Check fees, NAAC grade, NIRF rank, specialisations and semester-wise syllabus for 127+ UGC DEB approved universities.',
  alternates: { canonical: 'https://edifyedu.in/compare' },
  openGraph: {
    title: 'Compare Online MBA & MCA Universities 2026 | EdifyEdu',
    description: 'Side-by-side comparison of fees, NIRF rankings, NAAC grades and syllabus for 127+ UGC DEB approved online programs.',
    type: 'website',
  },
}

// Popular comparison pairs — MBA
const MBA_PAIRS = [
  { label: 'Amity Online MBA vs NMIMS Online MBA', href: '/compare?a=amity-university-online&b=nmims-online' },
  { label: 'Symbiosis Online MBA vs Manipal MUJ Online MBA', href: '/compare?a=symbiosis-university-online&b=manipal-university-jaipur-online' },
  { label: 'JAIN Online MBA vs Chandigarh University Online MBA', href: '/compare?a=jain-university-online&b=chandigarh-university-online' },
  { label: 'LPU Online MBA vs Amrita Online MBA', href: '/compare?a=lovely-professional-university-online&b=amrita-vishwa-vidyapeetham-online' },
  { label: 'Sikkim Manipal Online MBA vs Sharda University Online MBA', href: '/compare?a=sikkim-manipal-university-online&b=sharda-university-online' },
  { label: 'NMIMS Online MBA vs Symbiosis Online MBA', href: '/compare?a=nmims-online&b=symbiosis-university-online' },
  { label: 'Amity Online MBA vs Manipal MAHE Online MBA', href: '/compare?a=amity-university-online&b=manipal-academy-higher-education-online' },
  { label: 'LPU Online MBA vs UPES Online MBA', href: '/compare?a=lovely-professional-university-online&b=upes-online' },
]

// Popular comparison pairs — MCA
const MCA_PAIRS = [
  { label: 'Amity Online MCA vs JAIN Online MCA', href: '/compare?a=amity-university-online&b=jain-university-online' },
  { label: 'LPU Online MCA vs Chandigarh University Online MCA', href: '/compare?a=lovely-professional-university-online&b=chandigarh-university-online' },
  { label: 'Manipal MUJ Online MCA vs Sikkim Manipal Online MCA', href: '/compare?a=manipal-university-jaipur-online&b=sikkim-manipal-university-online' },
  { label: 'UPES Online MCA vs Galgotias University Online MCA', href: '/compare?a=upes-online&b=galgotias-university-online' },
  { label: 'VIT Online MCA vs SRM Institute Online MCA', href: '/compare?a=vit-vellore-online&b=srm-institute-science-technology-online' },
  { label: 'Amity Online MCA vs Manipal MUJ Online MCA', href: '/compare?a=amity-university-online&b=manipal-university-jaipur-online' },
]

export default function ComparePage() {
  return (
    <div className="bg-white">
      {/* ── STATIC HERO — server rendered, crawler visible ─────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #0d2240 0%, #1e3a5f 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px] font-semibold">
              Updated for July 2026 Session
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white text-center mb-3 leading-tight">
            Compare Online MBA &amp; MCA Universities 2026
          </h1>
          <p className="text-white/50 text-sm text-center max-w-xl mx-auto mb-7 leading-relaxed">
            Side-by-side analysis of UGC DEB approved programs across 127+ universities. Compare fees, NIRF rankings, NAAC grades, specialisations and semester-wise syllabus before you decide.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: GraduationCap, label: '127+ Universities' },
              { icon: ShieldCheck, label: 'UGC DEB Verified' },
              { icon: Zap, label: '24 Hr Callback' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">
                <badge.icon size={13} className="text-amber-400" />
                <span className="text-white text-xs font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATIC POPULAR COMPARISONS — server rendered ───────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8">

          <div>
            <h2 className="font-display text-lg font-bold text-navy mb-4">Popular Online MBA Comparisons</h2>
            <div className="space-y-2">
              {MBA_PAIRS.map(pair => (
                <Link
                  key={pair.href}
                  href={pair.href}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-all group no-underline"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{pair.label}</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-500 flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-navy mb-4">Popular Online MCA Comparisons</h2>
            <div className="space-y-2">
              {MCA_PAIRS.map(pair => (
                <Link
                  key={pair.href}
                  href={pair.href}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-all group no-underline"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{pair.label}</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-500 flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* How it works — static text for word count */}
        <div className="mt-10 grid md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
          <div>
            <h2 className="font-display text-base font-bold text-navy mb-2">How the Comparison Works</h2>
            <p className="text-sm text-ink-2 leading-relaxed">
              Select two or three universities from the tool below. You can switch between MBA and MCA. The comparison table shows fees, NIRF rank, NAAC grade, average salary, specialisations, and hiring partners side by side so you can spot differences at a glance.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-navy mb-2">Why NAAC and NIRF Matter</h2>
            <p className="text-sm text-ink-2 leading-relaxed">
              NAAC grades (A++, A+, A) reflect the overall academic quality of the institution. NIRF is a government ranking that considers research, placements, and outcomes. Together they tell you how seriously a university takes education quality. Higher ranked universities tend to carry better employer recognition.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-navy mb-2">What to Check Before Deciding</h2>
            <p className="text-sm text-ink-2 leading-relaxed">
              Beyond fees and rankings, look at the exam mode (online proctored vs. assignment-based), EMI availability, whether the university is PSU eligible, and the specialisations offered. Our counsellors can walk you through any of these factors in a free 15-minute call.
            </p>
          </div>
        </div>
      </div>

      {/* ── CLIENT COMPARISON TOOL — loads after static content ────────────── */}
      <div className="border-t border-slate-200">
        <CompareClient />
      </div>
    </div>
  )
}
