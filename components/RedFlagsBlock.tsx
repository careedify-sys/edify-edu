import type { University } from '@/lib/data'
import { AlertCircle } from 'lucide-react'

interface Props {
  u: University
  program: string
  cleanName: string
}

function getMBAFlags(cleanName: string): string[] {
  return [
    `An online MBA from ${cleanName} does not replace offline IIM, XLRI, or ISB brand equity for roles in investment banking or top-tier strategy consulting. For those specific recruiters and roles, a residential MBA from a top-10 institution is the better fit. For most corporate, operations, and functional roles across 80% of the Indian job market, an online UGC-DEB approved MBA is perfectly valid.`,
    `Placement assistance is not a placement guarantee. ${cleanName} provides career portal access, resume workshops, mock interviews, and drive notifications. Final offers depend on your profile, interview performance, and market conditions.`,
    `Online learning requires self-discipline. Without daily campus structure, online MBAs reward learners who build their own study rhythm. If you have historically struggled with self-paced work, consider a hybrid or weekend program with more external structure.`,
    `Campus networking looks different online. You will build connections through LMS forums, virtual events, WhatsApp groups, and EdifyEdu alumni intros rather than daily hostel life. For students who value deep in-person peer bonds, this is a genuine trade-off worth considering.`,
  ]
}

function getMCAFlags(cleanName: string): string[] {
  return [
    `An online MCA from ${cleanName} alone will not land you a product role at FAANG-tier tech companies. These roles require a strong portfolio, consistent DSA performance, and open-source contributions alongside the degree.`,
    `Placement assistance is not a placement guarantee. ${cleanName} provides career portal access and industry connections. Final placement depends on your technical skills, project work, and interview readiness.`,
    `Online MCA lab work intensity is lower than an on-campus program. Self-discipline to build projects, contribute to GitHub, and do mock coding interviews is essential to bridge this gap.`,
    `An online MCA is not a direct substitute for a B.Tech in Computer Science for core software engineering roles at top product firms. It works best as a career accelerator for working professionals or a lateral entry into IT from other fields.`,
  ]
}

function getBBAFlags(cleanName: string): string[] {
  return [
    `A BBA is a foundation degree. Senior management roles require an MBA or significant work experience on top of a BBA from ${cleanName}. Plan for further education if leadership roles are your long-term target.`,
    `Placement assistance is not a placement guarantee. ${cleanName} provides career support and job portal access. First-job placement depends on your communication skills, internships, and interview performance.`,
    `Online BBA has limited reach for on-campus placement drives at large MNCs. It works best for first-job entry in SMEs, startups, and entrepreneurship. Large campus-drive companies typically recruit from residential programs.`,
    `BBA from an online program does not carry the peer-network weight of a top Delhi University or equivalent residential college. If peer learning and residential campus culture are important to you, compare offline options first.`,
  ]
}

function getBCAFlags(cleanName: string): string[] {
  return [
    `A BCA alone is rarely sufficient for senior software engineering roles at product companies. You will need a strong project portfolio, MCA or M.Tech, or professional certifications alongside the degree from ${cleanName}.`,
    `Placement assistance is not a placement guarantee. ${cleanName} provides career support and introductions. Technical roles require consistent coding practice, projects, and interview preparation beyond what any degree alone provides.`,
    `Online BCA lab work is self-directed. Without physical lab sessions, students must independently set up development environments and build real projects. This gap is bridgeable but requires deliberate effort.`,
    `BCA from an online program does not carry the brand recognition of residential colleges for MNC campus hiring. It is a strong credential for IT services companies, small tech firms, and freelancing but less so for elite product-company campus recruitment.`,
  ]
}

const FLAG_GENERATORS: Record<string, (name: string) => string[]> = {
  MBA: getMBAFlags,
  MCA: getMCAFlags,
  BBA: getBBAFlags,
  BCA: getBCAFlags,
}

export default function RedFlagsBlock({ u, program, cleanName }: Props) {
  const generator = FLAG_GENERATORS[program]
  const flags = generator ? generator(cleanName).slice(0, 4) : [
    `Placement assistance is not a placement guarantee. ${cleanName} provides career support and networking introductions. Final employment outcomes depend on your skills, preparation, and market conditions.`,
    `Online programs require self-discipline. Without campus structure, results are directly proportional to the consistency and initiative you bring to your studies.`,
    `Verify overseas recognition separately if you plan to work or study abroad. UGC-DEB approval covers Indian employment and higher education. International recognition varies by country.`,
  ]

  return (
    <section className="rounded-xl border border-red-100 bg-red-50 p-6">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle size={16} className="text-red-500" />
        <h2 className="text-lg font-bold text-red-800">Red Flags — Be Honest With Yourself</h2>
      </div>
      <p className="text-sm text-red-600 mb-4">
        Edify gives you the honest picture. Read these before you decide.
      </p>
      <ul className="space-y-4">
        {flags.map((flag, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-red-700">
            <span className="mt-0.5 shrink-0 font-black text-red-400">✕</span>
            <span>{flag}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-red-500 mt-4">
        This section is Edify&apos;s independent editorial. No university pays us to omit red flags.
      </p>
    </section>
  )
}
