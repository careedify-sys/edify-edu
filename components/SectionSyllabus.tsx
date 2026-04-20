'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen } from 'lucide-react'

interface SyllabusData {
  sem1?: string
  sem2?: string
  sem3?: string
  sem4?: string
  sem56?: string
  coreSpec?: string
  research?: string
  capstone?: string
}

interface Props {
  syllabus: SyllabusData | null | undefined
  program: string
  universityName: string
  specs?: string[]
}

const SEM_ORDER: Array<{ key: keyof SyllabusData; label: string }> = [
  { key: 'sem1', label: 'Semester 1' },
  { key: 'sem2', label: 'Semester 2' },
  { key: 'sem3', label: 'Semester 3' },
  { key: 'sem4', label: 'Semester 4' },
  { key: 'sem56', label: 'Semester 5–6' },
  { key: 'coreSpec', label: 'Specialisation Core' },
  { key: 'research', label: 'Research / Electives' },
  { key: 'capstone', label: 'Capstone / Project' },
]

export default function SectionSyllabus({ syllabus, program, universityName, specs }: Props) {
  const [openSem, setOpenSem] = useState<string | null>('sem1')

  const available = SEM_ORDER.filter(s => syllabus?.[s.key])

  if (!available.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold mb-2" style={{ color: '#0B1533' }}>Syllabus Overview</h2>
        <p className="text-sm text-slate-500">
          Detailed semester-wise syllabus for {universityName} Online {program} covers core management subjects, specialisation electives, and a final-year industry project. Contact our counsellor for the full curriculum PDF.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>Syllabus — Semester-wise</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        {universityName} Online {program} curriculum. Subject names may vary slightly by intake year.
      </p>
      <div className="space-y-2">
        {available.map(sem => {
          const content = syllabus![sem.key] as string
          const subjects = content.split(/[,;|]/).map(s => s.replace(/^[•\-\s]+/, '').trim()).filter(s => s.length > 2)
          const isOpen = openSem === sem.key

          return (
            <div key={sem.key} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenSem(isOpen ? null : sem.key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{sem.label}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 py-3 bg-white">
                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map(sub => (
                      <span key={sub} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
