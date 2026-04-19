import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Will This Program Fit Me? — Program Suitability Guide | EdifyEdu',
  description: 'Find out if an online MBA, MCA, BBA, or BCA is right for your career goals, eligibility, and budget. Free, unbiased guide by EdifyEdu.',
  robots: { index: true, follow: true },
}

export default function ProgramFitPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
          style={{ background: '#FEF3C7', color: '#92400E' }}
        >
          Coming Soon — Phase 5
        </span>
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#0B1533' }}>
          Will This Program Fit Me?
        </h1>
        <p className="text-slate-600 text-base leading-relaxed mb-4">
          Not every online degree suits every person. EdifyEdu is building a structured suitability checker that asks you 8 key questions and maps your answers to the programs and universities where you are most likely to succeed.
        </p>
        <p className="text-slate-600 text-base leading-relaxed mb-4">
          The tool checks four factors: your eligibility (marks, stream, current qualification), your career goal (sector, seniority target), your budget range (total cost + EMI tolerance), and your study style (self-paced, weekend live, or blended). Based on your answers, it gives you a shortlist of 3 to 5 programs with honest match scores.
        </p>
        <p className="text-slate-600 text-base leading-relaxed mb-4">
          Until the interactive tool launches, you can speak directly with an EdifyEdu counsellor who uses the same framework manually. The counsellor call is free, takes about 20 minutes, and results in a written recommendation you can take to any university you choose.
        </p>
        <p className="text-slate-600 text-base leading-relaxed mb-6">
          EdifyEdu earns zero commission from universities. Our incentive is to give you the right answer, not the most expensive one.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm no-underline"
          style={{ background: '#F4A024', color: '#0B1533' }}
        >
          Talk to a Counsellor Now →
        </Link>
        <Link
          href="/universities"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm no-underline border border-slate-200 text-slate-700"
        >
          Browse Universities
        </Link>
      </div>
    </main>
  )
}
