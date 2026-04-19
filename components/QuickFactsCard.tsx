import type { University, ProgramDetail } from '@/lib/data'
import { Clock, Monitor, Award, BarChart2, GraduationCap, CheckCircle } from 'lucide-react'

interface Props {
  u: University
  pd: ProgramDetail
  program: string
}

export default function QuickFactsCard({ u, pd, program }: Props) {
  const facts = [
    { icon: Clock, label: 'Duration', value: pd.duration || '2 Years' },
    { icon: Monitor, label: 'Mode', value: '100% Online' },
    { icon: Award, label: 'NAAC Grade', value: u.naac },
    ...(u.nirf > 0 && u.nirf < 500 ? [{ icon: BarChart2, label: 'NIRF Rank', value: `#${u.nirf}` }] : []),
    { icon: GraduationCap, label: 'Degree', value: `${program} (Regular)` },
    { icon: CheckCircle, label: 'Approval', value: 'UGC DEB' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Facts</h3>
      <div className="space-y-2.5">
        {facts.map(f => (
          <div key={f.label} className="flex items-center gap-2.5">
            <f.icon size={14} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 w-24 shrink-0">{f.label}</span>
            <span className="text-xs font-semibold text-slate-800 truncate">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
