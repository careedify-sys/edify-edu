'use client'
import Link from 'next/link'
import { GUIDES } from '@/lib/guides'

const TAG_COLORS: Record<string, string> = {
  'Validity & Recognition': '#16a34a',
  'Government Jobs':        '#2563eb',
  'Program Comparison':     '#9333ea',
  'Accreditation':          '#d97706',
  'Rankings':               '#0891b2',
  'Admissions':             '#e11d48',
}

export default function GuidesPage() {
  return (
    <div className="page-shell">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#0B1D35 0%,#0f2137 100%)', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-3">
            Edify Guides · Honest Answers
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3" style={{ maxWidth: 560 }}>
            Every Question Students Ask Before Enrolling
          </h1>
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480 }}>
            No fluff. No paid content. Straight answers on UGC recognition, fees, validity, and what nobody tells you before you pay.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center text-white text-xs font-bold shrink-0">RK</div>
            <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Written by <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Rishi Kumar</span> · Edify Admissions Research
            </p>
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <div className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-5">
          {GUIDES.length} guides · Updated April 2026
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map(g => {
            const tagColor = TAG_COLORS[g.tag] || 'var(--amber)'
            return (
              <Link key={g.id} href={`/guides/${g.id}`} className="no-underline group">
                <div className="rounded-2xl border border-border bg-white h-full p-5 flex flex-col hover:border-amber hover:shadow-md transition-all">

                  {/* Icon + tag row */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{g.icon}</span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: `${tagColor}15`, color: tagColor }}
                    >
                      {g.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-[14px] font-bold text-navy leading-snug mb-2 mt-0 group-hover:text-amber transition-colors flex-1">
                    {g.title}
                  </h2>

                  {/* Desc */}
                  <p className="text-[12px] text-ink-3 leading-relaxed mb-4 mt-0 line-clamp-2">
                    {g.desc}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <span className="text-[11px] text-ink-4">🕐 {g.readTime}</span>
                    <span className="text-[11px] font-semibold text-amber group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 rounded-2xl border border-amber/30 bg-amber/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-navy text-sm mb-1">Still have questions?</div>
            <p className="text-xs text-ink-3 m-0">Compare all 127+ universities side by side — fees, NIRF, NAAC, syllabus.</p>
          </div>
          <Link
            href="/universities"
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white no-underline hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))' }}
          >
            Browse Universities →
          </Link>
        </div>
      </div>
    </div>
  )
}
