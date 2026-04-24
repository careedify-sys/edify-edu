'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Subject {
  name: string
  credits?: string
  source: 'common' | 'a-only' | 'b-only'
  uniLabel?: string
}

interface SemesterData {
  sem: number
  title: string
  subjects: Subject[]
}

interface Props {
  nameA: string
  nameB: string
  specA: string
  specB: string
  semesters: SemesterData[]
  program?: 'mba' | 'mca'
}

export default function SyllabusComparison({ nameA, nameB, specA, specB, semesters, program = 'mba' }: Props) {
  const [filter, setFilter] = useState<'all' | 'common' | 'unique'>('all')
  const [openSems, setOpenSems] = useState<Set<number>>(new Set([1]))

  const totalCommon = semesters.reduce((s, sem) => s + sem.subjects.filter(sub => sub.source === 'common').length, 0)
  const totalUnique = semesters.reduce((s, sem) => s + sem.subjects.filter(sub => sub.source !== 'common').length, 0)
  const totalAll = totalCommon + totalUnique
  const overlapPct = totalAll > 0 ? Math.round((totalCommon / totalAll) * 100) : 0

  const toggleSem = (sem: number) => {
    const next = new Set(openSems)
    next.has(sem) ? next.delete(sem) : next.add(sem)
    setOpenSems(next)
  }

  const filterSubjects = (subjects: Subject[]) => {
    if (filter === 'common') return subjects.filter(s => s.source === 'common')
    if (filter === 'unique') return subjects.filter(s => s.source !== 'common')
    return subjects
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="rounded-t-2xl px-5 py-5 text-white" style={{ background: 'linear-gradient(135deg, #0f2756 0%, #0a1b3d 100%)' }}>
        <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Georgia, serif' }}>Syllabus Comparison</h3>
        <p className="text-xs text-white/70 mb-4">Green means both universities teach it. Amber means only one does.</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">{nameA}</div>
            <div className="text-xs font-semibold">{specA}</div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">{nameB}</div>
            <div className="text-xs font-semibold">{specB}</div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 bg-white border border-slate-200 border-t-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setFilter('all')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
            filter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          All subjects · {totalAll}
        </button>
        <button
          onClick={() => setFilter('common')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
            filter === 'common' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Common · {totalCommon}
        </button>
        <button
          onClick={() => setFilter('unique')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
            filter === 'unique' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Unique · {totalUnique}
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 py-2.5 bg-slate-50 border border-slate-200 border-t-0 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border-2 border-emerald-500 bg-emerald-50" /> Both teach it</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-amber-50" /> Only one</span>
      </div>

      {/* Semesters */}
      <div className="bg-white border border-slate-200 border-t-0 rounded-b-2xl overflow-hidden">
        {semesters.map(sem => {
          const filtered = filterSubjects(sem.subjects)
          const common = sem.subjects.filter(s => s.source === 'common').length
          const unique = sem.subjects.filter(s => s.source !== 'common').length
          const isOpen = openSems.has(sem.sem)

          return (
            <div key={sem.sem} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => toggleSem(sem.sem)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0f2756', fontFamily: 'Georgia, serif' }}>
                    S{sem.sem}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#0f2756' }}>{sem.title}</div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-emerald-600 font-semibold">{common} common</span>
                      {' · '}
                      <span className="text-amber-600 font-semibold">{unique} unique</span>
                    </div>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && filtered.length > 0 && (
                <div className="px-4 pb-4 space-y-1.5">
                  {filtered.map((sub, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium ${
                        sub.source === 'common'
                          ? 'bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-500'
                          : 'bg-amber-50 text-amber-800 border-l-[3px] border-amber-500'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                        sub.source === 'common' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {sub.source === 'common' ? '✓' : sub.source === 'a-only' ? 'A' : 'B'}
                      </span>
                      <span className="flex-1">
                        {sub.name}
                        {sub.uniLabel && <span className="opacity-60 ml-1">· {sub.uniLabel}</span>}
                      </span>
                      {sub.credits && (
                        <span className="text-[10px] font-semibold opacity-60 bg-white/50 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {sub.credits}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isOpen && filtered.length === 0 && (
                <div className="px-4 pb-4 text-xs text-slate-400 text-center py-3">
                  No {filter === 'common' ? 'common' : 'unique'} subjects in this semester.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary banner */}
      <div className="mt-3 rounded-xl px-4 py-3.5 text-xs" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#78350f', border: '1px solid #f59e0b' }}>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mr-1.5" style={{ background: '#0f2756', color: '#f59e0b', fontFamily: 'Georgia, serif' }}>
          {overlapPct}%
        </span>
        <strong>of the syllabus overlaps.</strong> The real difference shows up in Semester 3 and 4 where specialisation-specific subjects diverge.
      </div>
    </div>
  )
}
