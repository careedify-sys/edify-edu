'use client'

import type { University, ProgramDetail } from '@/lib/data'
import { cleanCareerOutcome, formatINR, getProgramLevel } from '@/lib/format'
import { TrendingUp } from 'lucide-react'
import LOGOS_MANIFEST from '@/lib/data/logos-manifest.json'

interface Props {
  u: University
  program: string
  pd: ProgramDetail
  cleanName: string
  spec?: string
}

export default function UniHero({ u, program, pd, cleanName, spec }: Props) {
  const specs  = pd.specs || []
  const level  = getProgramLevel(program)
  const logoPath: string | undefined = (LOGOS_MANIFEST as Record<string, string>)[u.id]

  const h1 = spec
    ? `Online ${program} in ${spec} from ${cleanName}`
    : `${cleanName} Online ${program}: Fees, Syllabus & Specialisations 2026`

  const eyebrow = spec
    ? `${level} · ${pd.duration || '2 Years'} · UGC DEB Approved`
    : `${level} · ${specs.length > 0 ? `${specs.length} Specialisations · ` : ''}${pd.duration || '2 Years'} · UGC DEB Approved`

  const sub = spec
    ? `${program} with ${spec} specialisation from ${cleanName}. UGC DEB approved. NAAC ${u.naac} accredited.`
    : (cleanCareerOutcome(pd.careerOutcome || '') || `Advance your career with an Online ${program} from ${cleanName}. Choose from ${specs.length}+ industry-relevant specialisations. Study while working.`)

  const eligibilityLabel = ['MBA', 'MCA'].includes(program) ? 'Grad + 50%' : '10+2 + 50%'

  const stats = [
    { label: 'Total Fees', value: pd.fees || formatINR(u.feeMin), highlight: true },
    { label: 'Duration',   value: pd.duration || '2 Years',       highlight: false },
    { label: 'Eligibility', value: eligibilityLabel,              highlight: false },
    { label: 'NAAC',       value: u.naac,                         highlight: false },
    ...(u.nirf > 0 && u.nirf < 500 ? [{ label: 'NIRF', value: `#${u.nirf}`, highlight: false }] : []),
  ]

  const intakeLine = (pd as any).nextIntake
    ? `Next batch: ${(pd as any).nextIntake}`
    : 'Next batch: Jul 2026'

  function scrollToLead() {
    document.getElementById('sticky-lead-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={12} style={{ color: '#F4A024' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#F4A024' }}>
            {eyebrow}
          </span>
        </div>

        {/* Logo (if available) + H1 block */}
        <div className="flex items-center gap-4 mb-4">
          {logoPath && (
            <img
              src={logoPath}
              alt={`${cleanName} logo`}
              style={{
                width: 64, height: 64, objectFit: 'contain',
                background: '#fff', borderRadius: 14, padding: 8,
                flexShrink: 0,
              }}
            />
          )}
          <h1
            className="font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.35rem,3.5vw,2.1rem)', fontWeight: 800 }}
          >
            {h1}
          </h1>
        </div>

        {/* Sub-headline */}
        <p className="text-slate-400 text-[15px] max-w-2xl mb-5 leading-relaxed">{sub}</p>

        {/* Stats grid */}
        <div
          className="grid gap-2 mb-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}
        >
          {stats.map(s => (
            <div
              key={s.label}
              className="stat-tile px-4 py-2.5 rounded-lg border"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: s.highlight ? 'rgba(244,160,36,0.3)' : 'rgba(255,255,255,0.1)',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</div>
              <div
                className="font-bold mt-0.5"
                style={{
                  fontSize: s.highlight ? 22 : 16,
                  color: s.highlight ? '#F4A024' : '#fff',
                  lineHeight: 1.2,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Trust line + desktop CTA */}
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs text-slate-500">
            500+ students guided by EdifyEdu this year · {intakeLine}
          </p>
          <button
            onClick={scrollToLead}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#F4A024', color: '#0B1533' }}
          >
            Talk to EdifyEdu Counsellor →
          </button>
        </div>
      </div>

      <style>{`
        .stat-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(244,160,36,0.15);
        }
      `}</style>
    </div>
  )
}
