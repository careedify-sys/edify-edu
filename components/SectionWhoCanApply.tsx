import type { University } from '@/lib/data'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  u: University
  program: string
}

const PROGRAM_DEFAULTS: Record<string, { eligibility: string; forWho: string[]; notFor: string[] }> = {
  MBA: {
    eligibility: "Any Bachelor's degree in any discipline with minimum 50% aggregate marks (45% for reserved categories). Final year students may apply.",
    forWho: ['Working professionals seeking a promotion or career switch', 'Entrepreneurs building business acumen', 'Fresh graduates wanting a fast-track management career'],
    notFor: ["Students expecting a residential campus experience", "Those wanting a 1-year accelerated program", "People needing a 100% government job guarantee"],
  },
  MCA: {
    eligibility: "Bachelor's degree in Computer Science, IT, Mathematics, or any field with Mathematics/Statistics as a subject. 50% aggregate marks.",
    forWho: ['BCA / B.Sc IT / B.Tech graduates upskilling', 'Working IT professionals formalizing their credentials', 'Career switchers entering software development'],
    notFor: ['Students with no programming or math background', 'Those expecting on-campus labs only'],
  },
  BBA: {
    eligibility: 'Class 12 pass in any stream with minimum 45% aggregate marks. No entrance exam required.',
    forWho: ['Fresh 12th pass students interested in business', 'Working professionals formalizing their business knowledge', 'Aspiring entrepreneurs wanting a business foundation'],
    notFor: ['Students expecting a full-time campus experience', 'Those looking for engineering or pure science programs'],
  },
  BCA: {
    eligibility: 'Class 12 pass in any stream (PCM preferred) with minimum 45% aggregate marks. No entrance exam.',
    forWho: ['12th pass students interested in software and IT', 'Career starters aiming for BCA then MCA path', 'Working professionals in IT wanting a formal degree'],
    notFor: ['Students with no interest in computers or programming', 'Those needing a physical lab-heavy curriculum'],
  },
}

export default function SectionWhoCanApply({ u, program }: Props) {
  const defaults = PROGRAM_DEFAULTS[program] || PROGRAM_DEFAULTS['MBA']
  const eligibility = u.eligibility || defaults.eligibility
  const forWho = u.forWho?.length ? u.forWho : defaults.forWho
  const notFor = u.notFor?.length ? u.notFor : defaults.notFor

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>Who Can Apply</h2>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800 mb-5">
        <strong>Eligibility:</strong> {eligibility}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-green-500" /> Good fit for
          </h3>
          <ul className="space-y-2">
            {forWho.slice(0, 4).map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1.5">
            <XCircle size={14} className="text-red-400" /> Not ideal for
          </h3>
          <ul className="space-y-2">
            {notFor.slice(0, 4).map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
