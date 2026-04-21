'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { specSlug as getSpecSlug, specName as getSpecName } from '@/lib/data'
import type { SpecValue } from '@/lib/data'

interface Props {
  specs: SpecValue[]
  universityId: string
  programSlug: string
  program: string
  fees?: string
  duration?: string
}

export default function SpecializationGrid({ specs, universityId, programSlug, program, fees, duration }: Props) {
  if (!specs.length) return null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1533' }}>
        {program} Specialisations 2026
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Select a specialisation below for detailed syllabus, career scope, and salary data.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {specs.map(spec => {
          const slug = getSpecSlug(spec)
          const name = getSpecName(spec)
          return (
            <Link
              key={slug}
              href={`/universities/${universityId}/${programSlug}/${slug}`}
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all no-underline"
              style={{ '--tw-border-opacity': 1 } as React.CSSProperties}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors leading-snug">
                  {name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {program} · {duration || '2 Yrs'} · {fees || 'See fees'}
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500 shrink-0 ml-2 transition-colors" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
