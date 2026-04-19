import type { University } from '@/lib/data'
import { ClipboardList, BookOpen, Briefcase } from 'lucide-react'

interface Props {
  u: University
  program: string
}

export default function SectionExams({ u, program }: Props) {
  const isOnline = u.examMode === 'Online'
  const isAssignment = u.examMode === 'Assignment-based'

  const items = [
    {
      icon: ClipboardList,
      label: 'Exam Mode',
      desc: isOnline
        ? 'Online proctored examinations from home. No exam centre visit required.'
        : isAssignment
          ? 'Assignment and project-based evaluation. No written end-semester exams.'
          : `${u.examMode}. Confirm exact format with the university before enrolling.`,
    },
    {
      icon: BookOpen,
      label: 'Assessment Pattern',
      desc: 'Internal assessment (assignments, quizzes, participation) contributes 30–40%. End-semester exam contributes 60–70%.',
    },
    {
      icon: Briefcase,
      label: 'Capstone / Project',
      desc: `Final semester includes an industry project or research dissertation. Project topic is chosen by the student with faculty guidance.`,
    },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>Exams &amp; Evaluation</h2>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.label} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <item.icon size={15} className="text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">{item.label}</div>
              <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mt-4">
        Exam schedules are announced by the university each semester. Edify recommends confirming exact exam mode directly with the university before applying.
      </p>
    </section>
  )
}
