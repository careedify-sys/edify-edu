'use client'

import { getSortRank } from '@/lib/data-slim'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, BarChart2, Plus, Minus,
  TrendingUp, Briefcase, Lock, Award,
  Wallet, BookOpen, ChevronRight,
  Info, ShieldCheck, Zap, Search, X
} from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getUniversityLogo, getMasterSyllabus } from '@/lib/content'
import type { University, Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'
import { clsx } from 'clsx'

// Universities that have actual MBA syllabus data in MASTER_SYLLABUS
const MBA_UNIS_WITH_DATA = [
  { id: 'amity-university-online', name: 'Amity University Online' },
  { id: 'chandigarh-university-online', name: 'Chandigarh University Online' },
  { id: 'jain-university-online', name: 'JAIN Online' },
  { id: 'lovely-professional-university-online', name: 'Lovely Professional University Online' },
  { id: 'manipal-university-jaipur-online', name: 'Manipal University Jaipur (MUJ) Online' },
  { id: 'nmims-online', name: 'NMIMS Online' },
  { id: 'symbiosis-university-online', name: 'Symbiosis School for Online and Digital Learning' },
  { id: 'upes-online', name: 'UPES Online' },
  { id: 'shoolini-university-online', name: 'Shoolini University Online' },
  { id: 'bharati-vidyapeeth-university-online', name: 'Bharati Vidyapeeth Online' },
  { id: 'amrita-vishwa-vidyapeetham-online', name: 'Amrita Vishwa Vidyapeetham Online' },
  { id: 'galgotias-university-online', name: 'Galgotias University Online' },
  { id: 'sharda-university-online', name: 'Sharda University Online' },
  { id: 'manipal-academy-higher-education-online', name: 'Manipal Academy of Higher Education (MAHE) Online' },
  { id: 'sikkim-manipal-university-online', name: 'Sikkim Manipal University Online' },
  { id: 'kurukshetra-university-online', name: 'Kurukshetra University Online' },
  { id: 'uttaranchal-university-online', name: 'Uttaranchal University Online' },
  { id: 'vignan-university-online', name: "Vignan's Foundation for Science & Technology Online" },
  { id: 'dayananda-sagar-university-online', name: 'Dayananda Sagar University Online' },
  { id: 'dr-dy-patil-vidyapeeth-online', name: 'Dr. D.Y. Patil Vidyapeeth, Pune Online' },
  { id: 'noida-international-university-online', name: 'Noida International University Online' },
  { id: 'dr-mgr-educational-research-institute-online', name: 'Dr. MGR Educational and Research Institute Online' },
  { id: 'jaypee-university-online', name: 'Jaypee Institute of Information Technology Online' },
  { id: 'assam-don-bosco-university-online', name: 'Assam Don Bosco University Online' },
  { id: 'chitkara-university-online', name: 'Chitkara University Online' },
  { id: 'alliance-university-online', name: 'Alliance University Online' },
  { id: 'arka-jain-university-online', name: 'ARKA JAIN University Online' },
]

// Universities that have actual MCA syllabus data in MASTER_SYLLABUS
const MCA_UNIS_WITH_DATA = [
  { id: 'amity-university-online', name: 'Amity University Online' },
  { id: 'chandigarh-university-online', name: 'Chandigarh University Online' },
  { id: 'jain-university-online', name: 'JAIN Online' },
  { id: 'lovely-professional-university-online', name: 'Lovely Professional University Online' },
  { id: 'manipal-university-jaipur-online', name: 'Manipal University Jaipur (MUJ) Online' },
  { id: 'manipal-academy-higher-education-online', name: 'Manipal Academy of Higher Education (MAHE) Online' },
  { id: 'upes-online', name: 'UPES Online' },
  { id: 'shoolini-university-online', name: 'Shoolini University Online' },
  { id: 'bharati-vidyapeeth-university-online', name: 'Bharati Vidyapeeth Online' },
  { id: 'amrita-vishwa-vidyapeetham-online', name: 'Amrita Vishwa Vidyapeetham Online' },
  { id: 'galgotias-university-online', name: 'Galgotias University Online' },
  { id: 'sharda-university-online', name: 'Sharda University Online' },
  { id: 'sikkim-manipal-university-online', name: 'Sikkim Manipal University Online' },
  { id: 'kurukshetra-university-online', name: 'Kurukshetra University Online' },
  { id: 'uttaranchal-university-online', name: 'Uttaranchal University Online' },
  { id: 'vignan-university-online', name: "Vignan's Foundation Online" },
  { id: 'dayananda-sagar-university-online', name: 'Dayananda Sagar University Online' },
  { id: 'dr-dy-patil-vidyapeeth-online', name: 'Dr. D.Y. Patil Vidyapeeth Online' },
  { id: 'noida-international-university-online', name: 'Noida International University Online' },
  { id: 'vit-vellore-online', name: 'VIT Vellore Online' },
  { id: 'anna-university-online', name: 'Anna University Online' },
  { id: 'kl-university-online', name: 'KL University Online' },
  { id: 'andhra-university-online', name: 'Andhra University Online' },
  { id: 'gla-university-online', name: 'GLA University Online' },
  { id: 'guru-nanak-dev-university-online', name: 'Guru Nanak Dev University Online' },
  { id: 'jaipur-national-university-online', name: 'Jaipur National University Online' },
  { id: 'manav-rachna-online', name: 'Manav Rachna University Online' },
  { id: 'srm-institute-science-technology-online', name: 'SRM Institute Online' },
  { id: 'savitribai-phule-pune-university-online', name: 'Savitribai Phule Pune University Online' },
  { id: 'shanmugha-arts-science-technology-research-online', name: 'SASTRA University Online' },
  { id: 'parul-university-online', name: 'Parul University Online' },
  { id: 'graphic-era-university-online', name: 'Graphic Era University Online' },
  { id: 'assam-don-bosco-university-online', name: 'Assam Don Bosco University Online' },
  { id: 'christ-university-online', name: 'Christ University Online' },
  { id: 'vtu-online', name: 'VTU Online' },
]

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

// ── Standalone Syllabus Comparison Tool ────────────────────────────────────
function SyllabusComparison({ program }: { program: 'MBA' | 'MCA' }) {
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [uniAId, setUniAId] = useState<string | null>(null)
  const [uniBId, setUniBId] = useState<string | null>(null)
  const [specA, setSpecA] = useState('')
  const [specB, setSpecB] = useState('')
  const [showDropA, setShowDropA] = useState(false)
  const [showDropB, setShowDropB] = useState(false)

  // Reset selections when program changes
  useEffect(() => {
    setUniAId(null); setUniBId(null)
    setSearchA(''); setSearchB('')
    setSpecA(''); setSpecB('')
  }, [program])

  const uniList = program === 'MCA' ? MCA_UNIS_WITH_DATA : MBA_UNIS_WITH_DATA

  const suggestionsA = searchA.length >= 1
    ? uniList.filter(u => u.name.toLowerCase().includes(searchA.toLowerCase())).slice(0, 8)
    : uniList.slice(0, 8)

  const suggestionsB = searchB.length >= 1
    ? uniList.filter(u => u.name.toLowerCase().includes(searchB.toLowerCase())).slice(0, 8)
    : uniList.slice(0, 8)

  const syllabusA = uniAId ? getMasterSyllabus(uniAId, program) : null
  const syllabusB = uniBId ? getMasterSyllabus(uniBId, program) : null

  function getSpecsWithData(syllabus: ReturnType<typeof getMasterSyllabus>) {
    if (!syllabus?.specSyllabus) return []
    return Object.entries(syllabus.specSyllabus)
      .filter(([, v]) => v.sem3 || v.sem4)
      .map(([k]) => k)
  }

  const specsA = getSpecsWithData(syllabusA)
  const specsB = getSpecsWithData(syllabusB)

  function getSubjects(syllabus: ReturnType<typeof getMasterSyllabus>, spec: string): string[] {
    if (!spec || !syllabus?.specSyllabus?.[spec]) return []
    const v = syllabus.specSyllabus[spec]
    const raw = [v.sem3, v.sem4].filter(Boolean).join(' | ')
    return raw.split(' | ').map(s => s.trim()).filter(Boolean)
  }

  const subjectsA = getSubjects(syllabusA, specA)
  const subjectsB = getSubjects(syllabusB, specB)
  const setBSet = new Set(subjectsB.map(s => s.toLowerCase()))
  const setASet = new Set(subjectsA.map(s => s.toLowerCase()))

  function selectUni(which: 'A' | 'B', uni: { id: string; name: string }) {
    if (which === 'A') {
      setUniAId(uni.id); setSearchA(uni.name); setSpecA(''); setShowDropA(false)
    } else {
      setUniBId(uni.id); setSearchB(uni.name); setSpecB(''); setShowDropB(false)
    }
  }

  function clearUni(which: 'A' | 'B') {
    if (which === 'A') { setUniAId(null); setSearchA(''); setSpecA('') }
    else { setUniBId(null); setSearchB(''); setSpecB('') }
  }

  const hasNoSpecData = (syllabus: ReturnType<typeof getMasterSyllabus>) =>
    syllabus !== null && (!syllabus.specSyllabus || Object.keys(syllabus.specSyllabus).length === 0)

  const commonSem1 = syllabusA?.sem1 || syllabusB?.sem1

  return (
    <div className="rounded-2xl overflow-hidden border border-amber/30 shadow-lg" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7E6 100%)' }}>
      {/* Header */}
      <div className="px-5 sm:px-8 py-5 border-b border-amber/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">📚</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold text-navy leading-tight">Compare Syllabus of Any Two Online {program} Programs</h2>
            <p className="text-xs text-ink-3 mt-1">Select a university on each side to compare semester-wise subjects{program === 'MBA' ? ' and specialisations' : ''}</p>
          </div>
        </div>
      </div>

      {/* Two-column selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-amber/20">
        {(['A', 'B'] as const).map((side) => {
          const isA = side === 'A'
          const search = isA ? searchA : searchB
          const setSearch = isA ? setSearchA : setSearchB
          const uniId = isA ? uniAId : uniBId
          const showDrop = isA ? showDropA : showDropB
          const setShowDrop = isA ? setShowDropA : setShowDropB
          const suggestions = isA ? suggestionsA : suggestionsB
          const syllabus = isA ? syllabusA : syllabusB
          const specs = isA ? specsA : specsB
          const spec = isA ? specA : specB
          const setSpec = isA ? setSpecA : setSpecB
          const subjects = isA ? subjectsA : subjectsB
          const otherSet = isA ? setBSet : setASet
          const otherSpec = isA ? specB : specA
          const label = isA ? 'University A' : 'University B'

          return (
            <div key={side} className="p-4 sm:p-5 flex flex-col gap-3">
              {/* University label */}
              <div className="text-[10px] font-black uppercase tracking-widest text-ink-3">{label}</div>

              {/* Search input */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2 focus-within:border-amber shadow-sm">
                  <Search size={14} className="text-ink-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowDrop(true) }}
                    onFocus={() => setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                    placeholder="Type university name..."
                    className="flex-1 text-xs font-semibold text-ink bg-transparent outline-none min-w-0"
                    autoComplete="off"
                  />
                  {uniId && (
                    <button onClick={() => clearUni(side)} className="text-ink-3 hover:text-red transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showDrop && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl overflow-hidden">
                    {suggestions.map(uni => (
                      <button
                        key={uni.id}
                        onMouseDown={() => selectUni(side, uni)}
                        className={clsx(
                          "w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-amber-light transition-colors border-b border-border/30 last:border-0",
                          uniId === uni.id ? "bg-amber-light text-amber-text" : "text-ink"
                        )}
                      >
                        {uni.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialisation dropdown */}
              {uniId && (
                <>
                  {hasNoSpecData(syllabus) ? (
                    <div className="p-3 rounded-xl bg-gray-50 border border-border text-xs text-ink-3 text-center">
                      No syllabus data available for this university.<br />
                      <span className="font-semibold">Contact us for details.</span>
                    </div>
                  ) : specs.length === 0 ? (
                    <div className="p-3 rounded-xl bg-gray-50 border border-border text-xs text-ink-3 text-center">
                      No specialisation data available yet.
                    </div>
                  ) : (
                    <select
                      value={spec}
                      onChange={e => setSpec(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl border border-border bg-white px-3 py-2.5 text-ink focus:outline-none focus:border-amber shadow-sm"
                    >
                      <option value="">— Select Specialisation —</option>
                      {specs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </>
              )}

              {/* Common subjects (sem1) */}
              {spec && syllabus?.sem1 && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-ink-3 mb-1.5">Sem 1 — Core Subjects</div>
                  <div className="flex flex-wrap gap-1">
                    {syllabus.sem1.split(' | ').map(s => s.trim()).filter(Boolean).map(subj => (
                      <span key={subj} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white/80 border border-border/50 text-ink-3">{subj}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spec subjects (sem3/sem4) */}
              {spec && subjects.length > 0 && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-ink-3 mb-1.5">Sem 3–4 Electives — {spec}</div>
                  <div className="space-y-1">
                    {subjects.map(subj => {
                      const inOther = otherSpec && otherSet.has(subj.toLowerCase())
                      return (
                        <div
                          key={subj}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                          style={{
                            background: !otherSpec ? '#F8FAFC'
                              : inOther ? 'rgba(34,197,94,0.1)'
                              : 'rgba(251,191,36,0.12)',
                            color: !otherSpec ? 'var(--ink-2)'
                              : inOther ? '#15803D'
                              : '#92400E',
                            borderLeft: !otherSpec ? '3px solid #E2E8F0'
                              : inOther ? '3px solid #22C55E'
                              : '3px solid #F59E0B',
                          }}
                        >
                          {subj}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {spec && subjects.length === 0 && (
                <div className="p-3 rounded-xl bg-gray-50 border border-border text-xs text-ink-3 text-center">
                  No syllabus data available for this specialisation.<br />
                  <span className="font-semibold">Contact us for details.</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {(specA || specB) && (
        <div className="flex items-center gap-4 px-5 pb-4 pt-1 border-t border-amber/10">
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(34,197,94,0.2)', border: '1.5px solid #22C55E', display: 'inline-block' }} />
            Common subject
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(251,191,36,0.2)', border: '1.5px solid #F59E0B', display: 'inline-block' }} />
            Unique subject
          </span>
        </div>
      )}
    </div>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const [program, setProgram] = useState<'MBA' | 'MCA'>('MBA')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryUni, setEnquiryUni] = useState('')
  const [initialized, setInitialized] = useState(false)

  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialized) return
    const a = searchParams.get('a')
    const b = searchParams.getAll('b')
    const ids = [a, ...b].filter((id): id is string => !!id)
    const validIds = ids.filter(id => UNIS_SLIM.some(u => u.id === id))
    const unique = Array.from(new Set(validIds))
    if (unique.length > 0) {
      setSelectedIds(unique.slice(0, 3))
    } else {
      setSelectedIds(['jain-university-online', 'amity-university-online'])
    }
    setInitialized(true)
  }, [searchParams, initialized])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-ink-3">
        <Zap className="animate-pulse mr-2" size={20} />
        Loading comparison...
      </div>
    )
  }

  const universities = selectedIds
    .map(id => getUniversityById(id))
    .filter((u): u is University => u !== undefined)
  const available = UNIS_SLIM.filter(u => !selectedIds.includes(u.id) && u.programs?.includes(program))

  function addUni(id: string) {
    if (selectedIds.length >= 3) return
    if (selectedIds.includes(id)) return
    setSelectedIds(prev => [...prev, id])
  }

  function removeUni(id: string) {
    setSelectedIds(prev => prev.filter(x => x !== id))
  }

  function getVerdict() {
    if (universities.length < 2) return null
    const sorted = [...universities].sort((a, b) => getSortRank(a) - getSortRank(b))
    return {
      bestNirf: sorted[0],
      cheapest: [...universities].sort((a, b) => a.feeMin - b.feeMin)[0],
      bestSalary: universities.reduce((best, u) => {
        const salary = u.programDetails?.[program]?.avgSalary || ''
        const bestSalary = best.programDetails?.[program]?.avgSalary || ''
        const parse = (s: string) => parseInt(s.replace(/[^0-9]/g, '').slice(0, 2)) || 0
        return parse(salary) > parse(bestSalary) ? u : best
      }),
    }
  }

  const verdict = getVerdict()

  return (
    <div className="page-shell pb-20">
      {universities.length >= 2 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          '@context':'https://schema.org','@type':'Article',
          headline:`${universities[0]?.name} vs ${universities[1]?.name} Online ${program} — Comparison 2026`,
          description:`Detailed comparison of ${universities[0]?.name} and ${universities[1]?.name} Online ${program} — fees, NIRF rank, NAAC grade and syllabus.`,
          url:`https://edifyedu.in/compare?a=${universities[0]?.id}&b=${universities[1]?.id}`,
          author:{'@type':'Organization',name:'Edify',url:'https://edifyedu.in'},
          publisher:{'@type':'Organization',name:'Edify',logo:{'@type':'ImageObject',url:'https://edifyedu.in/logo.png'}},
          dateModified:'2026-03-22',
        })}} />
      )}

      {/* Hero Section */}
      <div className="bg-white border-b border-border-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-glow/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="label-sm text-amber px-2 py-0.5 bg-amber-light rounded-full">Compare {program} Programs</span>
                <span className="text-[11px] text-ink-3 font-medium">Updated for July 2026 Session</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-navy font-bold mb-3 tracking-tight">
                Compare Online {program} Universities
              </h1>
              <p className="text-sm text-ink-2 max-w-xl">
                Side-by-side analysis of UGC DEB approved {program} programs. Compare real fees, NIRF rank{program === 'MBA' ? ', specialisations' : ''} and semester-wise syllabus.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-navy/5 rounded-xl border border-navy/10">
              <span className="text-[11px] font-bold text-ink-3 px-2">Program:</span>
              {(['MBA', 'MCA'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setProgram(p); setSelectedIds(['jain-university-online', 'amity-university-online']) }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${program === p ? 'bg-navy text-white shadow-sm' : 'text-ink-2 hover:bg-navy/10'}`}
                >
                  Online {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-ink-3 mr-1">Add to compare:</span>
            {available.slice(0, 6).map(u => (
              <button
                key={u.id}
                onClick={() => addUni(u.id)}
                disabled={selectedIds.length >= 3}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border hover:border-amber hover:text-amber transition-all text-xs font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={12} /> {u.abbr || u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Syllabus Comparator — ALWAYS VISIBLE AT TOP ─────── */}
        <div className="mt-8 mb-8">
          <SyllabusComparison program={program} />
        </div>

        {universities.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart2 size={32} className="text-ink-3 opacity-20" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">No Universities Selected</h2>
            <p className="text-ink-3 mb-8">Add up to 3 universities to compare their fees and rankings side-by-side.</p>
            <Link href="/universities" className="btn-primary rounded-xl">Browse All Universities</Link>
          </div>
        ) : (
          <div>
            {/* Verdict Card */}
            {verdict && (
              <div className="mb-8 p-6 bg-white border border-border rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-glow -mr-16 -mt-16 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-10 h-10 bg-amber rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber/20">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy">The Edify Verdict</h3>
                    <p className="text-xs text-ink-3">Based on current rankings and placement data for Online {program}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber-glow transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-amber font-bold text-[10px] uppercase tracking-widest">
                      <Zap size={10} /> Highest Rank
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.bestNirf.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">NIRF Rank #{verdict.bestNirf.nirf}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber-glow transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-sage font-bold text-[10px] uppercase tracking-widest">
                      <Wallet size={10} /> Best ROI
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.cheapest.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">Starting {formatFee(verdict.cheapest.feeMin)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber-glow transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-blue font-bold text-[10px] uppercase tracking-widest">
                      <Briefcase size={10} /> Career Reach
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.bestSalary.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">Top Hiring Index for {program}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Grid */}
            <div className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden">

              {/* Sticky Table Header */}
              <div className="sticky top-0 z-[40] bg-white border-b border-border/80 backdrop-blur-md shadow-sm">
                <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch">
                  <div className="p-4 flex flex-col justify-center border-r border-border/50 bg-bg/20">
                    <span className="label-sm text-ink-3">Comparing:</span>
                    <span className="text-[10px] font-bold text-amber">{universities.length} {program} Programs</span>
                  </div>
                  {universities.map(u => (
                    <div key={u.id} className="p-4 border-r border-border/50 flex flex-col items-center text-center relative group min-w-[200px]">
                      <button
                        onClick={() => removeUni(u.id)}
                        className="absolute right-2 top-2 p-1.5 rounded-full bg-bg text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="h-12 flex items-center justify-center mb-3">
                        {getUniversityLogo(u.id) ? (
                          <img
                            src={getUniversityLogo(u.id)!}
                            alt={u.name}
                            style={{ maxHeight: '100%', maxWidth: '140px', objectFit: 'contain' }}
                          />
                        ) : (
                          <div className="text-navy font-black text-xl italic">{u.abbr}</div>
                        )}
                      </div>
                      <div className="text-xs font-black text-navy leading-tight line-clamp-2 px-2 uppercase tracking-tight">{u.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: ACADEMIC CREDIBILITY */}
              <div className="bg-navy p-3 px-5 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-bright uppercase tracking-[0.2em] flex items-center gap-2">
                  <Award size={14} /> Academic Credibility & Trust
                </span>
                <Info size={12} className="text-white/40 cursor-help" />
              </div>

              <ComparisonRow
                label="NIRF Ranking"
                icon={<BarChart2 size={12} className="text-amber" />}
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-navy italic">#{u.nirf || '—'}</span>
                    <span className="text-[9px] text-ink-3 uppercase font-bold tracking-wider">National Rank</span>
                  </div>
                )}
              />
              <ComparisonRow
                label="NAAC Grade"
                icon={<ShieldCheck size={12} className="text-sage" />}
                unis={universities}
                fn={u => (
                  <div className={clsx(
                    "px-3 py-1 rounded-full font-black text-sm",
                    u.naac.includes('A++') ? "bg-sage-light text-sage" :
                    u.naac.includes('A+') ? "bg-amber-light text-amber-text" : "bg-bg text-ink-2"
                  )}>
                    {u.naac || '—'}
                  </div>
                )}
              />
              <ComparisonRow
                label="Approvals"
                icon={<CheckCircle size={12} className="text-blue" />}
                unis={universities}
                fn={u => (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {['UGC DEB', 'AICTE', 'WES', 'QS'].map(ap => {
                      const has = u.approvals.some(a => a.toLowerCase().includes(ap.toLowerCase()))
                      return (
                        <div key={ap} className={clsx(
                          "px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all",
                          has ? "bg-white border-sage/30 text-sage shadow-sm shadow-sage/5 scale-105" : "bg-bg border-border text-ink-3 opacity-40 grayscale"
                        )}>
                          {ap}
                        </div>
                      )
                    })}
                  </div>
                )}
              />

              {/* SECTION: COURSE INVESTMENT */}
              <div className="bg-bg p-3 px-5 flex items-center gap-2 border-y border-border/50">
                <span className="text-[10px] font-black text-navy uppercase tracking-[0.2em] flex items-center gap-2">
                  <Wallet size={14} /> Fee Structure & Flexibility
                </span>
              </div>

              <ComparisonRow
                label="Course Fees"
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center">
                    <span className="text-base font-black text-navy">{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</span>
                    <span className="text-[10px] text-ink-3 font-medium">Total Online Program Fee</span>
                  </div>
                )}
              />
              <ComparisonRow
                label="EMI Starting"
                unis={universities}
                fn={u => (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-light rounded-lg border border-amber/20">
                    <span className="text-xs font-black text-amber-text italic">₹{u.emiFrom.toLocaleString()}/mo</span>
                    <ChevronRight size={10} className="text-amber animate-pulse" />
                  </div>
                )}
              />

              {/* Scholarship Row */}
              <div
                onClick={() => { setEnquiryUni('Scholarship Enquiry'); setEnquiryOpen(true) }}
                className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 transition-all hover:brightness-110"
              >
                <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch border-b border-orange-400/30">
                  <div className="p-4 flex items-center gap-2 bg-black/10">
                    <Lock size={16} className="text-white animate-bounce" />
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">Scholarship</span>
                  </div>
                  {universities.map(u => (
                    <div key={u.id} className="p-4 border-l border-white/10 flex flex-col items-center gap-1 justify-center">
                      <div className="text-xs font-bold text-white/90 text-center leading-snug mb-1">Save up to ₹50,000 — check eligibility now</div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/30 text-[10px] font-bold text-white group-hover:bg-white group-hover:text-orange-600 transition-all uppercase tracking-tighter">
                        <Zap size={10} fill="currentColor" /> Check Eligibility
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: CAREER OUTCOMES */}
              <div className="bg-sage-light p-3 px-5 flex items-center gap-2 border-y border-border/50">
                <span className="text-[10px] font-black text-sage uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp size={14} /> Career Impact & Salary
                </span>
              </div>

              <ComparisonRow
                label="Avg Salary"
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-black text-sage uppercase tracking-tight italic">{u.programDetails[program]?.avgSalary || (program === 'MCA' ? '₹4L - ₹10L' : '₹5L - ₹12L')}</span>
                    <TrendingUp size={14} className="text-sage/40" />
                  </div>
                )}
              />
              <ComparisonRow
                label="Top Hiring Partners"
                unis={universities}
                fn={u => (
                  <div className="flex flex-wrap justify-center gap-1">
                    {u.programDetails[program]?.topCompanies.slice(0, 4).map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-bg border border-border/40 text-[9px] font-bold text-ink-3">{c}</span>
                    ))}
                  </div>
                )}
              />
              <ComparisonRow
                label="Placement Support"
                unis={universities}
                fn={() => (
                  <div className="flex items-center gap-2 text-xs font-bold text-navy">
                    <CheckCircle size={14} className="text-sage" />
                    <span>LMS + Job Portal Access</span>
                  </div>
                )}
              />

              {/* SECTION: CURRICULUM */}
              <div className="bg-bg p-3 px-5 flex items-center gap-2 border-y border-border/50">
                <span className="text-[10px] font-black text-navy-light uppercase tracking-[0.2em] flex items-center gap-2">
                  <BookOpen size={14} /> Curriculum & Specialisations
                </span>
              </div>

              <ComparisonRow
                label="Specialisations"
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-black text-amber italic">{u.programDetails[program]?.specs.length || 0}</span>
                    <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
                      {u.programDetails[program]?.specs.slice(0, 3).map(s => (
                        <span key={s} className="text-[9px] font-bold text-ink-3 text-center leading-tight line-clamp-1">{s}</span>
                      ))}
                      {(u.programDetails[program]?.specs.length || 0) > 3 && <span className="text-[9px] text-amber font-bold">+{(u.programDetails[program]?.specs.length || 0) - 3} more</span>}
                    </div>
                  </div>
                )}
              />

              {/* ACTION BUTTON ROW */}
              <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch bg-bg/40">
                <div className="p-4 flex items-center justify-center font-bold text-xs text-ink-3 border-r border-border/50 bg-bg/20">
                  Ready to proceed?
                </div>
                {universities.map(u => (
                  <div key={u.id} className="p-5 border-l border-border/50 shadow-inner flex flex-col gap-3">
                    <button
                      onClick={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                      className="w-full btn-primary py-3 rounded-xl shadow-lg ring-4 ring-amber-light/50 font-black text-xs uppercase"
                    >
                      Enquire Now
                    </button>
                    <Link
                      href={`/universities/${u.id}/${progSlug(program)}`}
                      className="text-[10px] font-black text-center text-amber hover:text-amber-bright uppercase tracking-tighter"
                    >
                      View Detailed Analysis →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Proof Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              <div className="p-8 bg-navy rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-bright/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <h3 className="font-display text-2xl font-bold mb-4">India's Only Direct-to-Counsellor Guide</h3>
                <p className="text-white/70 text-sm mb-8 leading-relaxed">
                  We are not an automated search engine. Our database is verified by human experts who cross-check every UGC approval and NIRF update directly from government sources.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-amber">127+</span>
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Unis Verified</span>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-amber">24 Hr</span>
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Callback Guarantee</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border border-border rounded-3xl relative">
                <h3 className="font-display text-xl font-bold text-navy mb-4">Frequently Compared</h3>
                <div className="space-y-4">
                  {(program === 'MCA' ? [
                    "Amity Online MCA vs Jain Online MCA",
                    "LPU Online MCA vs Chandigarh University MCA",
                    "Manipal MUJ MCA vs Sikkim Manipal MCA",
                    "UPES Online MCA vs Galgotias MCA"
                  ] : [
                    "Amity Online vs Manipal Online",
                    "Jain Online vs Chandigarh University",
                    "LPU Online vs NMIMS Online",
                    "Sikkim Manipal vs Amrita AHEAD"
                  ]).map(c => (
                    <div key={c} className="flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-amber hover:bg-amber-light/10 transition-all cursor-pointer group">
                      <span className="text-xs font-bold text-ink-2 group-hover:text-navy">{c}</span>
                      <ChevronRight size={14} className="text-ink-3 group-hover:text-amber" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        universityName={enquiryUni}
      />
    </div>
  )
}

function ComparisonRow({ label, unis, fn, icon = null }: {
  label: string,
  unis: University[],
  fn: (u: University) => React.ReactNode,
  icon?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch border-b border-border/50 group hover:bg-bg/20 transition-colors">
      <div className="p-4 flex items-center gap-2 bg-bg/5 font-bold text-xs text-ink-3 border-r border-border/50">
        {icon} {label}
      </div>
      {unis.map(u => (
        <div key={u.id} className="p-4 py-6 border-l border-border/50 flex flex-col items-center justify-center text-center">
          {fn(u)}
        </div>
      ))}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center text-ink-3">
        Loading Comparison Engine...
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
