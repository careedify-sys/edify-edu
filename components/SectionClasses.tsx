import type { University } from '@/lib/data'
import { Wifi, Video, Clock, Monitor, FileText } from 'lucide-react'
import { isExamCentre, EXAM_CENTRE_LINE, isExamModeUnverified, EXAM_MODE_COUNSELLOR_LINE } from '@/lib/exam-mode'

interface Props {
  u: University
  program: string
  cleanName: string
}

// A9 (2026-11-18): a per-programme hours table ("8–10 hours/week" for every
// MBA) and "Recorded for replay within 48 hours" printed on every hub. Neither
// came from a university; BITS WILP publishes 7-8 hours a week and states no
// 48-hour window. Weekly time is now a question to ask, not a figure we state.
export default function SectionClasses({ u, program, cleanName }: Props) {
  const items = [
    { icon: Video, label: 'Live Sessions', desc: 'Live online sessions with faculty. Timings and recording access are set by the university, so confirm both before you enrol.' },
    { icon: Clock, label: 'Weekly Time', desc: `${cleanName} sets the weekly study load for its ${program}. Ask for the expected hours per week in writing if you work full-time.` },
    { icon: Monitor, label: 'LMS Access', desc: 'Lecture recordings, study materials, assignments, and discussion forums on the university LMS portal.' },
    { icon: FileText, label: 'Assessments', desc: isExamModeUnverified(u) ? EXAM_MODE_COUNSELLOR_LINE : isExamCentre(u) ? EXAM_CENTRE_LINE : `${u.examMode} assessments. No mandatory campus visits for exams in most semesters.` },
    { icon: Wifi, label: 'Connectivity', desc: 'Any device with a stable internet connection. Mobile apps available for on-the-go learning.' },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>{cleanName} {program}: Class Schedule and Delivery</h2>
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
    </section>
  )
}
