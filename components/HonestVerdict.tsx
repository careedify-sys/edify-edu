import type { University } from '@/lib/data'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  u: University
  program: string
  cleanName: string
}

const PROGRAM_SUITS: Record<string, string[]> = {
  MBA: [
    'Working professionals with 0–5 years experience aiming for a management role',
    'Commerce / Science / Arts graduates who want business leadership skills',
    'Entrepreneurs who need formal business credentials',
    'Budget-conscious students who cannot afford a full-time MBA',
  ],
  MCA: [
    'BCA / B.Sc IT graduates looking to deepen software engineering skills',
    'Working IT professionals wanting a formal postgraduate degree',
    'Career changers entering software development with a math background',
  ],
  BBA: [
    '12th pass students from any stream who want a business foundation',
    'Aspiring entrepreneurs and sales professionals',
    'Working individuals who need a UGC-approved graduation certificate',
  ],
  BCA: [
    '12th pass students interested in software development and IT',
    'Students planning the BCA → MCA career path',
    'Working professionals in IT wanting formal undergraduate credentials',
  ],
}

const PROGRAM_ELSEWHERE: Record<string, string[]> = {
  MBA: [
    'You want the IIM Ahmedabad brand — apply offline only',
    'You need placement guarantee with a specific salary number',
    'You want a 1-year accelerated MBA',
  ],
  MCA: [
    'You want a core systems programming or VLSI role — needs B.Tech/M.Tech',
    'You expect FAANG-tier product roles straight after graduation',
  ],
  BBA: [
    'You want a full-time campus experience with hostel and placements at top MNCs',
    'You are interested in engineering — consider B.Tech instead',
  ],
  BCA: [
    'You want deep core CS roles — consider B.Tech instead',
    'You need on-campus labs with physical hardware access',
  ],
}

export default function HonestVerdict({ u, program, cleanName }: Props) {
  const suits     = PROGRAM_SUITS[program]     || PROGRAM_SUITS['MBA']
  const elsewhere = PROGRAM_ELSEWHERE[program] || PROGRAM_ELSEWHERE['MBA']

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1533' }}>Edify&apos;s Honest Verdict</h2>
      <p className="text-sm text-slate-500 mb-5">
        No paid ranking. No commission. Here is who {cleanName} Online {program} genuinely suits — and who should look elsewhere.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-green-500" />
            Who this suits
          </h3>
          <ul className="space-y-2">
            {suits.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
            <XCircle size={14} className="text-slate-400" />
            Who should look elsewhere
          </h3>
          <ul className="space-y-2">
            {elsewhere.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <XCircle size={12} className="text-slate-300 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
