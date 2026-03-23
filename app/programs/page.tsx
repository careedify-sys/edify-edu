'use client'
import { getSortRank } from '@/lib/data-slim'

import Link from 'next/link'
import { UNIS_SLIM, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import type { Program } from '@/lib/data'


const PROGRAMS: Program[] = ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'B.Com', 'MA', 'M.Com', 'MSc']

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Programs</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-2">Online Degree Programs</h1>
          <p className="text-slate-500 text-sm max-w-lg">Every UGC approved online program explained — who it's for, which universities offer it, and what it actually costs.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROGRAMS.map(prog => {
            const meta = PROGRAM_META[prog]
            const unis = UNIS_SLIM.filter(u => u.programs.includes(prog)).sort((a, b) => getSortRank(a) - getSortRank(b))
            if (unis.length === 0) return null
            const minFee = Math.min(...unis.map(u => u.feeMin))
            return (
              <Link
                key={prog}
                href={`/programs/${prog.toLowerCase().replace(/[\s().]/g, '')}`}
                className="uni-card bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-300 block"
              >
                <div className="text-4xl mb-3">{meta?.icon || '📘'}</div>
                <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{meta?.level} · {meta?.duration}</div>
                <h2 className="font-display font-bold text-slate-900 text-xl mb-1">{prog}</h2>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{meta?.desc}</p>

                {/* Top 3 unis */}
                <div className="space-y-2 mb-4">
                  {unis.slice(0, 3).map(u => (
                    <div key={u.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-sm flex items-center justify-center text-white font-bold" style={{ background: u.color, fontSize: '8px' }}>
                          {u.abbr.slice(0, 1)}
                        </div>
                        <span className="text-slate-600 font-medium">{u.abbr}</span>
                        <span className="text-orange-400 font-semibold">#{u.nirf}</span>
                      </div>
                      <span className="text-slate-500">{u.programDetails?.[prog]?.fees || `${formatFee(u.feeMin)}+`}</span>
                    </div>
                  ))}
                  {unis.length > 3 && (
                    <div className="text-xs text-slate-400">+{unis.length - 3} more universities</div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
                  <span className="text-slate-500 font-medium">{unis.length} universities</span>
                  <span className="font-bold text-orange-500">From {formatFee(minFee)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
