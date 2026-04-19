import type { University } from '@/lib/data'
import { AlertCircle } from 'lucide-react'

interface Props {
  u: University
  program: string
  cleanName: string
}

const PROGRAM_RED_FLAGS: Record<string, string[]> = {
  MBA: [
    'An online MBA does not carry the brand weight of IIM Ahmedabad, XLRI, or ISB for roles in investment banking or top-tier strategy consulting. If those specific institutions or roles are your primary target, an offline programme from those institutions is the right fit.',
    'Placement assistance is provided, not a placement guarantee. It means access to job portals, resume workshops, and career events — not a guaranteed offer letter.',
    'Campus-based MNC placement drives (on-site rounds at employer premises) have limited reach for online graduates compared to top residential B-schools.',
  ],
  MCA: [
    'An online MCA alone will not land you a product role at top-tier tech companies (FAANG). You need portfolio projects and DSA skills alongside the degree.',
    'This is not a replacement for a B.Tech in Computer Science for core engineering roles at top product firms.',
  ],
  BBA: [
    'A BBA is a foundation degree. Senior management roles require an MBA or significant work experience on top of a BBA.',
    'Online BBA has limited reach for campus placement drives at big MNCs. It works best for first-job entry and entrepreneurship.',
  ],
  BCA: [
    'A BCA alone is rarely sufficient for senior software engineering roles at product companies. You will need project portfolio, MCA/M.Tech, or certifications.',
    'On-campus lab work intensity is lower online. Self-discipline to do practical projects is essential.',
  ],
}

export default function RedFlagsBlock({ u, program, cleanName }: Props) {
  const programFlags = PROGRAM_RED_FLAGS[program] || []
  const uniFlags = (u.notFor || []).slice(0, 2)

  const allFlags = [
    ...programFlags,
    ...uniFlags,
    'If you need a degree validated for overseas immigration in countries other than Canada/US WES — verify recognition in your target country first.',
  ].slice(0, 5)

  return (
    <section className="rounded-xl border border-red-100 bg-red-50 p-6">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle size={16} className="text-red-500" />
        <h2 className="text-lg font-bold text-red-800">Red Flags — What This Program Won&apos;t Fix</h2>
      </div>
      <p className="text-sm text-red-600 mb-4">
        Edify gives you the honest picture. Here is what {cleanName} Online {program} cannot do for you:
      </p>
      <ul className="space-y-3">
        {allFlags.map((flag, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-red-700">
            <span className="mt-0.5 shrink-0 font-black text-red-400">✕</span>
            {flag}
          </li>
        ))}
      </ul>
      <p className="text-xs text-red-500 mt-4">
        This section is Edify&apos;s independent editorial. No university pays us to omit red flags.
      </p>
    </section>
  )
}
