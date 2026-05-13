// Server component. Renders the 26 pre-built CGPA value pages as a tap grid
// of internal links. Placed on /tools/cgpa-calculator to pass link equity
// from the high-impression parent page to the long-tail value pages.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CGPA_VALUES } from '@/app/tools/cgpa-calculator/[value]/data'

// Sort ascending by CGPA value so users see 5.2 first and 9.8 last.
const SORTED = [...CGPA_VALUES].sort((a, b) => a.cgpa - b.cgpa)

export default function CgpaQuickConversions() {
  return (
    <section className="bg-surface border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-2">
          Quick conversions for common CGPA values
        </h2>
        <p className="text-sm text-ink-3 mb-6">
          Tap any value for the full calculation, online MBA eligibility, and
          Mumbai University variant.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SORTED.map(entry => (
            <Link
              key={entry.slug}
              href={`/tools/cgpa-calculator/${entry.slug}`}
              aria-label={`Convert ${entry.label} CGPA to percentage`}
              className="group min-h-[64px] rounded-xl bg-gradient-to-br from-navy to-[#142540] border border-border hover:border-amber/60 transition-all hover:shadow-amber hover:-translate-y-0.5 px-4 py-3 flex items-center justify-between gap-2"
            >
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-bold text-white leading-tight">
                  {entry.label} CGPA
                </span>
                <span className="text-sm font-bold text-amber-400 leading-tight mt-0.5">
                  {entry.percentage}%
                </span>
              </div>
              <ArrowRight
                size={16}
                className="text-amber shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
