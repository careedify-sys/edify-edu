import type { University, ProgramDetail } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { IndianRupee, AlertTriangle } from 'lucide-react'

interface Props {
  u: University
  pd: ProgramDetail
  program: string
}

export default function FeeBreakdown({ u, pd, program }: Props) {
  const isPostgrad  = ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(program)
  const semesters   = isPostgrad ? 4 : 6
  const perSem      = Math.round(u.feeMin / semesters)
  const totalFees   = pd.fees || formatINR(u.feeMin)

  const rows = [
    { label: 'Total Program Fee', value: totalFees, highlight: true },
    { label: 'Per Semester (approx.)', value: formatINR(perSem) },
    { label: 'EMI starts from', value: `${formatINR(u.emiFrom)}/month` },
    { label: 'Registration / Admission Fee', value: 'Included in total' },
    { label: 'Exam Fee', value: 'Included in total (usually)' },
    { label: 'Study Material', value: 'Included (digital)' },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <IndianRupee size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>Fees &amp; Payment</h2>
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
