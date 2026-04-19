import type { ProgramDetail } from '@/lib/data'
import { Briefcase } from 'lucide-react'

interface Props {
  pd: ProgramDetail
  program: string
  cleanName: string
}

const CHIP_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-green-50 text-green-700 border-green-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
]

export default function TopHirers({ pd, program, cleanName }: Props) {
  const companies = pd.topCompanies || []
  if (!companies.length) return null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>Top Hiring Companies</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        {cleanName} {program} alumni have joined these organisations. Placement support includes resume workshops, mock interviews, and a live job portal.
      </p>
      <div className="flex flex-wrap gap-2">
        {companies.map((c, i) => (
          <span
            key={c}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
          >
            {c}
          </span>
        ))}
      </div>
      {pd.avgSalary && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm">
          <span className="font-bold text-green-800">Reported salary range: </span>
          <span className="text-green-700">{pd.avgSalary}</span>
          <span className="text-green-600 text-xs"> (alumni self-reported data; varies by role and location)</span>
        </div>
      )}
    </section>
  )
}
