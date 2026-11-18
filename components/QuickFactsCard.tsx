import type { University, ProgramDetail } from '@/lib/data'
import { Clock, Monitor, Award, BarChart2, GraduationCap, CheckCircle, FileText } from 'lucide-react'
import { isExamCentre, isExamModeConfirmed } from '@/lib/exam-mode'
import { debBasis } from '@/lib/seo/deb-basis'

interface Props {
  u: University
  pd: ProgramDetail
  program: string
}

// A9 (2026-11-18): Mode was "100% Online" and Degree "{program} (Regular)" for
// every university. Neither came from any record, and "100% Online" is false
// for an Exam Centre university. Mode now says what we know (online classes)
// and the Exams row renders only when lib/exam-mode.ts CONFIRMED_EXAM_MODE
// confirms u.examMode (A9 QA advisory). The Approval row prints the recorded basis
// for a university that is not on the UGC-DEB register (A8).
export default function QuickFactsCard({ u, pd, program }: Props) {
  const basis = debBasis(u.id)
  const facts = [
    { icon: Clock, label: 'Duration', value: pd.duration || '2 Years' },
    { icon: Monitor, label: 'Classes', value: 'Online' },
    ...(isExamModeConfirmed(u) ? [{ icon: FileText, label: 'Exams', value: isExamCentre(u) ? 'At exam centres' : u.examMode }] : []),
    ...(u.naac ? [{ icon: Award, label: 'NAAC Grade', value: u.naac }] : []),
    ...((u as any).nirfMgt && (u as any).nirfMgt > 0 && (u as any).nirfMgt < 200 ? [{ icon: BarChart2, label: 'NIRF Management', value: `#${(u as any).nirfMgt}${u.nirfYear ? ` (${u.nirfYear})` : ''}` }] : u.nirf > 0 && u.nirf < 500 ? [{ icon: BarChart2, label: 'NIRF University', value: `#${u.nirf}${u.nirfYear ? ` (${u.nirfYear})` : ''}` }] : []),
    { icon: GraduationCap, label: 'Degree', value: program },
    { icon: CheckCircle, label: 'Approval', value: basis ? `${basis.badge} (${basis.badgeSub})` : 'UGC DEB' },
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
