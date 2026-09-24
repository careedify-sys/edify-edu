import type { University } from '@/lib/data'
import { Award, Check, Gift, Sparkles } from 'lucide-react'

interface Props {
  u: University
  /** Programme name, e.g. 'MBA'. Omit on the university page. */
  program?: string
  cleanName: string
}

/**
 * Selling points for one university: third-party rankings, differentiators,
 * bundled inclusions, and any programme-scoped extra.
 *
 * Renders on the university page, every programme hub and every specialisation
 * page, so one data edit in lib/data.ts reaches all of them. Returns null for
 * universities with no `highlights`, which today is every one except Shoolini.
 *
 * Rankings sit in their own row and always name the ranking body and edition.
 * NAAC and NIRF are deliberately absent here. Those are Supabase-verified and
 * already render in ApprovalBadges, and repeating them would imply that a QS
 * placement carries the same weight as an accreditation we can check.
 */
export default function UniHighlights({ u, program, cleanName }: Props) {
  const h = u.highlights
  if (!h) return null

  const progExtras = program ? h.byProgram?.[program.toLowerCase()] ?? [] : []
  const rankings = h.rankings ?? []
  const usps = h.usps ?? []
  const valueAdds = h.valueAdds ?? []

  if (!rankings.length && !usps.length && !valueAdds.length && !progExtras.length) return null

  // Callers disagree on whether cleanName already carries "Online": the
  // programme and spec bodies strip it, the university page passes u.name
  // verbatim. Normalise here so no caller can produce "Online Online MBA".
  const base = cleanName.replace(/\s+Online\s*$/i, '')
  const heading = program
    ? `Why students pick ${base} Online ${program}`
    : `Why students pick ${base} Online`

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6" id="highlights">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: '#B8892A' }} />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>{heading}</h2>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Independent summary. Edify takes no commission and runs no paid rankings.
      </p>

      {/* Programme-scoped extra first: it is the newest thing on the page. */}
      {progExtras.length > 0 && (
        <div className="mb-5 space-y-3">
          {progExtras.map((x, i) => (
            <div
              key={i}
              className="rounded-lg border-l-4 p-4"
              style={{ borderLeftColor: '#f97316', background: '#FFF7ED' }}
            >
              <div className="text-sm font-bold" style={{ color: '#0B1533' }}>{x.label}</div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{x.detail}</p>
            </div>
          ))}
        </div>
      )}

      {/* Third-party rankings, attributed to the ranker and the edition. */}
      {rankings.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Award size={14} className="text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">
              Global rankings
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rankings.map((r, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold" style={{ color: '#B8892A' }}>
                  {r.body} {r.edition}
                </div>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{r.claim}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Differentiators. */}
      {usps.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-black uppercase tracking-wide text-slate-500 mb-2.5">
            What sets it apart
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {usps.map((x, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 shrink-0 rounded-full p-0.5"
                  style={{ background: '#10b981' }}
                >
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: '#0B1533' }}>{x.label}.</span>{' '}
                  <span className="text-slate-600">{x.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inclusions the university bundles at no extra charge. */}
      {valueAdds.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: '#f1f5f9', border: '1px solid #E2E8F4' }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <Gift size={14} style={{ color: '#10b981' }} />
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">
              Included at no extra cost
            </h3>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {valueAdds.map((x, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="mt-1 shrink-0 font-black" style={{ color: '#10b981' }}>+</span>
                <span>
                  <span className="font-semibold" style={{ color: '#0B1533' }}>{x.label}.</span>{' '}
                  {x.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {h.verifyNote && (
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">{h.verifyNote}</p>
      )}
    </section>
  )
}
