import type { University } from '@/lib/data'
import { Wifi, Video, Clock, Monitor, FileText } from 'lucide-react'

interface Props {
  u: University
  program: string
}

const PROGRAM_HOURS: Record<string, string> = {
  MBA: '8–10 hours/week', MCA: '10–12 hours/week', BBA: '8–10 hours/week', BCA: '10–12 hours/week',
  'B.Com': '6–8 hours/week', 'M.Com': '8–10 hours/week', MA: '6–8 hours/week', BA: '6–8 hours/week',
  MSc: '10–12 hours/week', BSc: '8–10 hours/week',
}

export default function SectionClasses({ u, program }: Props) {
  const hours = PROGRAM_HOURS[program] || '8–10 hours/week'

  const items = [
    { icon: Video, label: 'Live Sessions', desc: 'Interactive weekend webinars with faculty. Recorded for replay within 48 hours.' },
    { icon: Clock, label: 'Weekly Time', desc: `${hours} — designed for working professionals with full-time jobs.` },
    { icon: Monitor, label: 'LMS Access', desc: 'Lecture recordings, study materials, assignments, and discussion forums on the university LMS portal.' },
    { icon: FileText, label: 'Assessments', desc: `${u.examMode} assessments. No mandatory campus visits for exams in most semesters.` },
    { icon: Wifi, label: 'Connectivity', desc: 'Any device with a stable internet connection. Mobile apps available for on-the-go learning.' },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>Class Schedule &amp; Delivery</h2>
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
