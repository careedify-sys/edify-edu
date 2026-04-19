import type { University, ProgramDetail } from '@/lib/data'
import { cleanCareerOutcome, formatINR, getProgramLevel } from '@/lib/format'
import { TrendingUp } from 'lucide-react'

interface Props {
  u: University
  program: string
  pd: ProgramDetail
  cleanName: string
  spec?: string           // for spec pages
}

export default function UniHero({ u, program, pd, cleanName, spec }: Props) {
  const specs  = pd.specs || []
  const level  = getProgramLevel(program)
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
    { label: 'Total Fees', value: pd.fees || formatINR(u.feeMin) },
    { label: 'Duration', value: pd.duration || '2 Years' },
    { label: 'Eligibility', value: eligibilityLabel },
    { label: 'NAAC', value: u.naac },
    ...(u.nirf > 0 && u.nirf < 500 ? [{ label: 'NIRF', value: `#${u.nirf}` }] : []),
  ]

  return (
    <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={12} className="text-amber-400" style={{ color: '#F4A024' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#F4A024' }}>
            {eyebrow}
          </span>
        </div>

        {/* H1 */}
        <h1
          className="font-bold text-white leading-tight mb-4"
          style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800 }}
        >
          {h1}
        </h1>

        {/* Sub-headline */}
        <p className="text-slate-400 text-[15px] max-w-2xl mb-6 leading-relaxed">{sub}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          {stats.map(s => (
            <div key={s.label} className="px-4 py-2.5 rounded-lg border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</div>
              <div className="text-white font-bold text-sm mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
