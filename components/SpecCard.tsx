'use client'

import Link from 'next/link'
import type { CanonicalSpec } from '@/lib/specMapping'

interface Props {
  spec: CanonicalSpec
  uniCount: number
  feeFloor: number
}

function formatFee(n: number): string {
  if (n >= 100000) return `\u20b9${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `\u20b9${Math.round(n / 1000)}K`
  return `\u20b9${n}`
}

export default function SpecCard({ spec, uniCount, feeFloor }: Props) {
  const Icon = spec.icon

  return (
    <Link
      href={`/programs/mba/${spec.slug}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 no-underline transition-all hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 flex items-center justify-center">
          <Icon size={20} className="text-amber-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors leading-snug">
            {spec.canonicalName}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{spec.careerTag}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span>{uniCount} universities - from {formatFee(feeFloor)}</span>
        <span className="text-amber-600 font-semibold group-hover:underline">View {uniCount} Unis →</span>
      </div>
    </Link>
  )
}
