import type { ProgramDetail } from '@/lib/data'
import { Briefcase, TrendingUp } from 'lucide-react'

interface Props {
  pd: ProgramDetail
  cleanName: string
  program: string
}

export default function SectionPlacements({ pd, cleanName, program }: Props) {
  const hasRoles = pd.roles && pd.roles.length > 0

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>Placements &amp; Career Outcomes</h2>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        {cleanName} provides placement assistance through career workshops, resume building sessions, mock interviews, and access to a job portal with active listings.
        {pd.avgSalary ? ` Alumni report salaries in the range of ${pd.avgSalary}.` : ''}
      </p>

      {hasRoles && (
        <>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Common Roles After {program}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {pd.roles.slice(0, 10).map(role => (
              <span key={role} className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full">
                {role}
              </span>
            ))}
          </div>
        </>
      )}

      {pd.avgSalary && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
          <TrendingUp size={18} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-green-800">Salary Range</div>
            <div className="text-sm text-green-700">{pd.avgSalary}</div>
            <div className="text-[11px] text-green-600 mt-0.5">
              Alumni self-reported data. Varies by specialisation, location, and prior experience. No guaranteed placement.
            </div>
          </div>
        </div>
      )}

      {!hasRoles && !pd.avgSalary && (
        <p className="text-sm text-slate-500">
          {cleanName} {program} graduates take on roles across management, operations, finance, and technology sectors. Contact our counsellor for current placement reports specific to this program.
        </p>
      )}
    </section>
  )
}
