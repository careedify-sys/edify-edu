'use client'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { UNIS_SLIM, getSortRank, formatFeeSlim as formatFee } from '@/lib/data-slim'
import type { Program } from '@/lib/data-client'

interface Props {
  program: Program
  currentId: string
  programSlug: string
}

const EDIFY_TOP_IDS = [
  'amity-university-online',
  'chandigarh-university-online',
  'nmims-online',
  'manipal-university-jaipur-online',
  'lovely-professional-university-online',
  'symbiosis-university-online',
  'manipal-academy-higher-education-online',
  'amrita-vishwa-vidyapeetham-online',
  'jain-university-online',
  'srm-institute-science-technology-online',
  'upes-online',
  'shoolini-university-online',
]

export default function EdifyRecommends({ program, currentId, programSlug }: Props) {
  const picks = UNIS_SLIM
    .filter(u =>
      u.id !== currentId &&
      u.programs.includes(program) &&
      (EDIFY_TOP_IDS.includes(u.id) || u.naac === 'A++' || u.naac === 'A+') &&
      (u.naac === 'A++' || u.naac === 'A+')
    )
    .sort((a, b) => getSortRank(a) - getSortRank(b))
    .slice(0, 3)

  if (picks.length === 0) return null

  const WHY: Record<string, string> = {
    'amity-university-online':                    'NAAC A+ · NIRF #22 · WES Recognised',
    'chandigarh-university-online':               'NIRF #19 · NAAC A+ · Largest online enrolment',
    'nmims-online':                               'Premium B-school · Industry-aligned curriculum',
    'manipal-university-jaipur-online':           'NIRF #58 · NAAC A+ · Strong placement record',
    'lovely-professional-university-online':      'NAAC A++ · NIRF #31 · WES Recognised',
    'symbiosis-university-online':                'NAAC A++ · Recognised brand · WES Approved',
    'manipal-academy-higher-education-online':    'NAAC A++ · NIRF #6 · Global recognition',
    'amrita-vishwa-vidyapeetham-online':          'NAAC A++ · NIRF #8 · Top research university',
    'jain-university-online':                     'NAAC A++ · NIRF #62 · WES Recognised',
    'srm-institute-science-technology-online':    'NAAC A++ · NIRF #11 · Industry connections',
    'upes-online':                                'NIRF #45 · NAAC A · Industry-focused',
    'shoolini-university-online':                 'NAAC A+ · Affordable fees · Flexible schedule',
  }

  return (
    <section className="card-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest"
          style={{ background: 'rgba(212,146,42,0.12)', color: 'var(--amber-text)', border: '1px solid rgba(212,146,42,0.3)' }}>
          ✦ Edify Recommends
        </span>
        <span className="text-xs text-ink-3">Top picks for {program}</span>
      </div>

      <div className="flex flex-col gap-3">
        {picks.map(u => {
          const why = WHY[u.id] || `${u.naac} · ${u.nirf > 0 && u.nirf < 900 ? `NIRF #${u.nirf}` : 'UGC Approved'}`
          return (
            <Link
              key={u.id}
              href={`/universities/${u.id}/${programSlug}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-amber transition-all no-underline group"
            >
              {/* Logo */}
              <div className="w-10 h-10 shrink-0 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden p-1">
                {u.logo
                  ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain"
                      onError={e => { const t = e.target as HTMLImageElement; t.style.display='none'; const p=t.parentElement; if(p){p.style.background=u.color;p.innerHTML=`<span style="color:#fff;font-weight:800;font-size:11px">${(u.abbr||u.name).slice(0,2).toUpperCase()}</span>`}}} />
                  : <span style={{ color:'#fff', fontWeight:800, fontSize:11, background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>{(u.abbr||u.name).slice(0,2).toUpperCase()}</span>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-navy group-hover:text-amber transition-colors leading-snug truncate">
                  {u.name.replace(/\s+Online\s*$/i, '')}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle size={10} className="text-green-500 shrink-0" />
                  <span className="text-[11px] text-ink-3 truncate">{why}</span>
                </div>
                <div className="text-[11px] text-ink-2 mt-0.5 font-medium">{formatFee(u.feeMin)} · EMI ₹{u.emiFrom.toLocaleString()}/mo</div>
              </div>

              <span className="text-amber text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )
        })}
      </div>

      <p className="text-[10px] text-ink-3 mt-3 leading-relaxed">
        Recommendations based on NAAC accreditation, NIRF rank, and UGC DEB approval. Zero paid placements — independent picks only.
      </p>
    </section>
  )
}
