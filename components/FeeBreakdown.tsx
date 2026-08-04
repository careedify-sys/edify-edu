import Link from 'next/link'
import type { University, ProgramDetail, Program } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { getDisplayFee } from '@/lib/fees'
import { IndianRupee, AlertTriangle } from 'lucide-react'

interface Props {
  u: University
  pd: ProgramDetail
  program: string
  cleanName: string
  headingOverride?: string
}

export default function FeeBreakdown({ u, pd, program, cleanName, headingOverride }: Props) {
  // Sprint 1 FIX 2: single canonical fee source. When getDisplayFee returns
  // ok:false the numeric range is suppressed and the block renders a
  // counsellor-verification CTA instead of a wrong number.
  const fee = getDisplayFee(u, program as Program)

  if (!fee.ok) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <IndianRupee size={16} className="text-slate-400" />
          <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>
            {headingOverride || `${cleanName} Online ${program} Fees 2026`}
          </h2>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mt-3">
          <p className="text-sm text-amber-900 font-semibold mb-1">
            Fee structure verified by our counsellor.
          </p>
          <p className="text-xs text-amber-800 mb-3">
            Our published data for this programme is being cross-checked against the official portal. Speak with a counsellor for the current confirmed fee and EMI options.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline"
          >
            Talk to counsellor
          </Link>
        </div>
      </section>
    )
  }

  const isPostgrad  = ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(program)
  const semesters   = isPostgrad ? 4 : 6
  const totalMin    = fee.min ?? u.feeMin
  const perSem      = Math.round(totalMin / semesters)
  // "From ₹X" framing when only the lower bound is backed by pd.fees; the
  // per-semester row uses the same "from" language so title, body, and
  // fee table all speak the same fee.
  const totalLabel  = fee.mode === 'from' ? 'Total Program Fee (from)' : 'Total Program Fee'
  const perSemValue = fee.mode === 'from' ? `from ${formatINR(perSem)}` : formatINR(perSem)

  const rows = [
    { label: totalLabel, value: fee.range || fee.compact || '', highlight: true },
    { label: 'Per Semester (approx.)', value: perSemValue },
    { label: 'EMI starts from', value: `${formatINR(u.emiFrom)}/month` },
    { label: 'Registration / Admission Fee', value: 'Included in total' },
    { label: 'Exam Fee', value: 'Included in total (usually)' },
    { label: 'Study Material', value: 'Included (digital)' },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <IndianRupee size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>{headingOverride || `${cleanName} Online ${program} Fees 2026`}</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Fee structure for {program}. Payment is accepted semester-wise or in full. EMI available through lending partners.
      </p>

      <div className="rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-4 py-2.5 text-slate-600">{row.label}</td>
                <td className={`px-4 py-2.5 text-right font-semibold ${row.highlight ? 'text-navy' : 'text-slate-700'}`} style={row.highlight ? { color: '#0B1533' } : {}}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Fees are indicative and subject to change. Always verify the exact fee on the official university portal before paying. Edify does not collect any fees directly.
        </p>
      </div>
    </section>
  )
}
