'use client'

import { getSortRank } from '@/lib/data-slim'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, BarChart2, Plus, Minus,
  TrendingUp, Briefcase, Lock, Award,
  Wallet, BookOpen, ChevronRight, ChevronDown, ChevronUp,
  Info, ShieldCheck, Zap, Search, X, Star, GraduationCap, Users
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
    <div className="rounded-2xl overflow-hidden border border-amber/30 shadow-lg bg-white">
      {/* Header */}
      <div className="px-5 sm:px-8 py-5 bg-gradient-to-r from-amber/10 to-amber/5 border-b border-amber/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center text-white shadow-md shadow-amber/30 flex-shrink-0 mt-0.5">
            <BookOpen size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold text-navy leading-tight">
              Compare Syllabus of Any Two Online {program} Programs
            </h2>
            <p className="text-xs text-ink-3 mt-1">
              Select a university on each side to compare semester-wise subjects
              {program === 'MBA' ? ' and specialisations' : ''}
            </p>
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
          const accentColor = isA ? '#1e3a5f' : '#d97706'

          return (
            <div key={side} className="p-4 sm:p-6 flex flex-col gap-3">
              {/* University label pill */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-black"
                  style={{ background: accentColor }}
                >
                  {side}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-ink-3">{label}</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2.5 focus-within:border-amber focus-within:bg-white shadow-sm transition-all">
                  <Search size={14} className="text-ink-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowDrop(true) }}
                    onFocus={() => setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                    placeholder="Search university…"
                    className="flex-1 text-xs font-semibold text-ink bg-transparent outline-none min-w-0 placeholder:text-ink-3/60"
                    autoComplete="off"
                  />
                  {uniId && (
                    <button onClick={() => clearUni(side)} className="text-ink-3 hover:text-red transition-colors p-0.5">
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
                    <div className="p-3 rounded-xl bg-bg border border-border text-xs text-ink-3 text-center">
                      No syllabus data available for this university.<br />
                      <span className="font-semibold">Contact us for details.</span>
                    </div>
                  ) : specs.length === 0 ? (
                    <div className="p-3 rounded-xl bg-bg border border-border text-xs text-ink-3 text-center">
                      No specialisation data available yet.
                    </div>
                  ) : (
                    <select
                      value={spec}
                      onChange={e => setSpec(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl border border-border bg-bg px-3 py-2.5 text-ink focus:outline-none focus:border-amber shadow-sm transition-all"
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
                  <div className="text-[9px] font-black uppercase tracking-widest text-ink-3 mb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-navy inline-block" />
                    Sem 1 — Core Subjects
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {syllabus.sem1.split(' | ').map(s => s.trim()).filter(Boolean).map(subj => (
                      <span key={subj} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-bg border border-border/50 text-ink-3">{subj}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spec subjects (sem3/sem4) */}
              {spec && subjects.length > 0 && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-ink-3 mb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber inline-block" />
                    Sem 3–4 Electives — {spec}
                  </div>
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
                <div className="p-3 rounded-xl bg-bg border border-border text-xs text-ink-3 text-center">
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
        <div className="flex items-center gap-4 px-5 pb-4 pt-2 border-t border-amber/10 bg-amber/5">
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
  const [syllabusOpen, setSyllabusOpen] = useState(false)
  const [uniSearch, setUniSearch] = useState('')

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
  const filteredAvailable = uniSearch.length >= 1
    ? available.filter(u => (u.name || '').toLowerCase().includes(uniSearch.toLowerCase()) || (u.abbr || '').toLowerCase().includes(uniSearch.toLowerCase()))
    : available

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
    <div className="pb-20">
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d2240 0%, #1e3a5f 55%, #0d2240 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] opacity-5"
            style={{ background: 'radial-gradient(ellipse, #f59e0b 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          {/* Updated badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber/30 bg-amber/10 text-amber text-[11px] font-bold uppercase tracking-wider">
              <Star size={10} fill="currentColor" /> Updated for July 2026 Session
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4 leading-tight tracking-tight">
            Compare Online{' '}
            <span className="text-amber">{program}</span>{' '}
            Universities
          </h1>
          <p className="text-white/60 text-sm sm:text-base text-center max-w-2xl mx-auto mb-8 leading-relaxed">
            Side-by-side analysis of UGC DEB approved {program} programs. Compare real fees, NIRF rankings
            {program === 'MBA' ? ', specialisations' : ''} and semester-wise syllabus — all in one place.
          </p>

          {/* Program toggle — prominent pill tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center p-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm gap-1">
              {(['MBA', 'MCA'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setProgram(p); setSelectedIds(['jain-university-online', 'amity-university-online']) }}
                  className={clsx(
                    "px-7 py-2.5 text-sm font-bold rounded-xl transition-all duration-200",
                    program === p
                      ? "bg-amber text-white shadow-lg shadow-amber/30"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  Online {p}
                </button>
              ))}
            </div>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            {[
              { icon: <GraduationCap size={14} />, label: '127+ Universities', sub: 'Verified Database' },
              { icon: <ShieldCheck size={14} />, label: 'UGC DEB Verified', sub: 'All Programs Approved' },
              { icon: <Zap size={14} />, label: '24 Hr Callback', sub: 'Expert Counsellor' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/10">
                <span className="text-amber">{badge.icon}</span>
                <div>
                  <div className="text-white text-xs font-bold leading-tight">{badge.label}</div>
                  <div className="text-white/40 text-[10px] leading-tight">{badge.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── UNIVERSITY SELECTOR PANEL ────────────────────────────────────── */}
      <div className="border-b border-border bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Currently comparing */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider whitespace-nowrap">Comparing:</span>
              {universities.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-navy/5 border border-navy/15 group"
                >
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {getUniversityLogo(u.id) ? (
                      <img src={getUniversityLogo(u.id)!} alt={u.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-navy font-black text-[10px]">{u.abbr?.slice(0, 3)}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-navy max-w-[120px] truncate">{u.abbr || u.name.split(' ')[0]}</span>
                  <button
                    onClick={() => removeUni(u.id)}
                    className="p-1 rounded-lg text-ink-3 hover:bg-red-50 hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {selectedIds.length < 3 && (
                <span className="text-[11px] text-ink-3 font-medium px-2">
                  + add {3 - selectedIds.length} more
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-border" />

            {/* Search bar to add universities */}
            {selectedIds.length < 3 && (
              <div className="flex-1 min-w-[220px] max-w-xs relative">
                <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 focus-within:border-amber focus-within:bg-white transition-all">
                  <Search size={13} className="text-ink-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={uniSearch}
                    onChange={e => setUniSearch(e.target.value)}
                    placeholder={`Search ${program} university to add…`}
                    className="flex-1 text-xs font-medium text-ink bg-transparent outline-none placeholder:text-ink-3/60"
                    autoComplete="off"
                  />
                  {uniSearch && (
                    <button onClick={() => setUniSearch('')} className="text-ink-3 hover:text-ink transition-colors">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* University cards grid — only shown when searching or always show first N */}
          {selectedIds.length < 3 && (filteredAvailable.length > 0) && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filteredAvailable.slice(0, uniSearch ? 20 : 10).map(u => (
                <button
                  key={u.id}
                  onClick={() => { addUni(u.id); setUniSearch('') }}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg border border-border hover:border-amber hover:bg-amber-light/20 transition-all group min-w-0"
                  title={u.name}
                >
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-white rounded-lg border border-border/50">
                    {getUniversityLogo(u.id) ? (
                      <img src={getUniversityLogo(u.id)!} alt={u.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-navy font-black text-[9px]">{u.abbr?.slice(0, 3) || u.name.slice(0, 3)}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[11px] font-bold text-navy group-hover:text-amber-text transition-colors whitespace-nowrap max-w-[100px] truncate">
                      {u.abbr || u.name.split(' ')[0]}
                    </span>
                    {u.feeMin && (
                      <span className="text-[9px] text-ink-3 font-medium whitespace-nowrap">
                        from {formatFee(u.feeMin)}
                      </span>
                    )}
                  </div>
                  <Plus size={12} className="text-ink-3 group-hover:text-amber flex-shrink-0 ml-1" />
                </button>
              ))}
              {!uniSearch && filteredAvailable.length > 10 && (
                <span className="flex-shrink-0 flex items-center px-3 text-[11px] text-ink-3 font-medium whitespace-nowrap">
                  +{filteredAvailable.length - 10} more — search above
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

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
              <div className="mt-8 mb-8 p-6 bg-white border border-border rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-glow -mr-20 -mt-20 rounded-full blur-3xl opacity-40 pointer-events-none" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="w-10 h-10 bg-amber rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber/20 flex-shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy">The Edify Verdict</h3>
                    <p className="text-xs text-ink-3">Based on current rankings and placement data for Online {program}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-amber font-bold text-[10px] uppercase tracking-widest">
                      <Zap size={10} /> Highest Rank
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.bestNirf.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">NIRF Rank #{verdict.bestNirf.nirf}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-sage/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-sage font-bold text-[10px] uppercase tracking-widest">
                      <Wallet size={10} /> Best ROI
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.cheapest.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">Starting {formatFee(verdict.cheapest.feeMin)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-blue/30 transition-colors group">
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
            <div className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden overflow-x-auto">

              {/* Sticky Table Header */}
              <div
                ref={headerRef}
                className="sticky top-[73px] z-[35] bg-white border-b-2 border-border shadow-md"
              >
                <div
                  className="grid items-stretch"
                  style={{ gridTemplateColumns: `180px repeat(${universities.length}, minmax(220px, 1fr))` }}
                >
                  <div className="p-4 flex flex-col justify-center border-r border-border/50 bg-navy/3">
                    <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Comparing</span>
                    <span className="text-xs font-black text-amber mt-0.5">{universities.length} Online {program}</span>
                  </div>
                  {universities.map((u, idx) => {
                    const naacColor = u.naac?.includes('A++') ? '#166534' : u.naac?.includes('A+') ? '#92400E' : '#374151'
                    const naacBg = u.naac?.includes('A++') ? '#dcfce7' : u.naac?.includes('A+') ? '#fef3c7' : '#f3f4f6'
                    return (
                      <div
                        key={u.id}
                        className="p-4 border-r border-border/50 flex flex-col items-center text-center relative group min-w-[220px]"
                        style={{ borderTop: `3px solid ${idx === 0 ? '#1e3a5f' : idx === 1 ? '#d97706' : '#22c55e'}` }}
                      >
                        <button
                          onClick={() => removeUni(u.id)}
                          className="absolute right-2 top-2 p-1.5 rounded-full bg-bg text-ink-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                        <div className="h-12 flex items-center justify-center mb-2">
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
                        <div className="text-[11px] font-black text-navy leading-tight line-clamp-2 px-2 uppercase tracking-tight mb-2">{u.name}</div>
                        {u.naac && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                            style={{ background: naacBg, color: naacColor }}
                          >
                            <ShieldCheck size={9} />
                            NAAC {u.naac}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── SECTION: ACADEMIC CREDIBILITY */}
              <SectionDivider
                label="Academic Credibility & Trust"
                icon={<Award size={14} />}
                colorClass="bg-navy"
                textClass="text-amber-bright"
              />

              <ComparisonRow
                label="NIRF Ranking"
                icon={<BarChart2 size={12} className="text-amber" />}
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-navy italic">#{u.nirf || '—'}</span>
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
                    "px-4 py-1.5 rounded-full font-black text-sm border",
                    u.naac.includes('A++') ? "bg-sage-light text-sage border-sage/20" :
                    u.naac.includes('A+') ? "bg-amber-light text-amber-text border-amber/20" :
                    "bg-bg text-ink-2 border-border"
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
                          has
                            ? "bg-white border-sage/30 text-sage shadow-sm"
                            : "bg-bg border-border text-ink-3 opacity-40"
                        )}>
                          {ap}
                        </div>
                      )
                    })}
                  </div>
                )}
              />

              {/* ── SECTION: FEE STRUCTURE */}
              <SectionDivider
                label="Fee Structure & Flexibility"
                icon={<Wallet size={14} />}
                colorClass="bg-amber/10 border-y border-amber/20"
                textClass="text-amber-text"
                leftAccent="#d97706"
              />

              <ComparisonRow
                label="Course Fees"
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center">
                    <span className="text-base font-black text-navy">{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</span>
                    <span className="text-[10px] text-ink-3 font-medium mt-0.5">Total Online Program Fee</span>
                  </div>
                )}
              />
              <ComparisonRow
                label="EMI Starting"
                unis={universities}
                fn={u => (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-light rounded-xl border border-amber/20">
                    <span className="text-xs font-black text-amber-text italic">₹{u.emiFrom.toLocaleString()}/mo</span>
                    <ChevronRight size={10} className="text-amber" />
                  </div>
                )}
              />

              {/* Scholarship Row */}
              <div
                onClick={() => { setEnquiryUni('Scholarship Enquiry'); setEnquiryOpen(true) }}
                className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 transition-all hover:brightness-110"
              >
                <div
                  className="grid items-stretch border-b border-orange-400/30"
                  style={{ gridTemplateColumns: `180px repeat(${universities.length}, minmax(220px, 1fr))` }}
                >
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

              {/* ── SECTION: CAREER OUTCOMES */}
              <SectionDivider
                label="Career Impact & Salary"
                icon={<TrendingUp size={14} />}
                colorClass="bg-sage-light border-y border-sage/20"
                textClass="text-sage"
                leftAccent="#16a34a"
              />

              <ComparisonRow
                label="Avg Salary"
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-black text-sage uppercase tracking-tight italic">
                      {u.programDetails[program]?.avgSalary || (program === 'MCA' ? '₹4L - ₹10L' : '₹5L - ₹12L')}
                    </span>
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

              {/* ── SECTION: CURRICULUM */}
              <SectionDivider
                label="Curriculum & Specialisations"
                icon={<BookOpen size={14} />}
                colorClass="bg-bg border-y border-border/50"
                textClass="text-navy"
                leftAccent="#1e3a5f"
              />

              <ComparisonRow
                label="Specialisations"
                unis={universities}
                fn={u => (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-black text-amber italic">{u.programDetails[program]?.specs.length || 0}</span>
                    <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
                      {u.programDetails[program]?.specs.slice(0, 3).map(s => (
                        <span key={s} className="text-[9px] font-bold text-ink-3 text-center leading-tight line-clamp-1">{s}</span>
                      ))}
                      {(u.programDetails[program]?.specs.length || 0) > 3 && (
                        <span className="text-[9px] text-amber font-bold">+{(u.programDetails[program]?.specs.length || 0) - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              />

              {/* ── ACTION BUTTON ROW */}
              <div
                className="grid items-stretch bg-navy/3 border-t-2 border-border"
                style={{ gridTemplateColumns: `180px repeat(${universities.length}, minmax(220px, 1fr))` }}
              >
                <div className="p-4 flex items-center justify-center border-r border-border/50 bg-bg/30">
                  <div className="text-center">
                    <div className="text-[11px] font-black text-navy uppercase tracking-wider mb-0.5">Ready?</div>
                    <div className="text-[10px] text-ink-3 font-medium">Pick your university</div>
                  </div>
                </div>
                {universities.map(u => (
                  <div key={u.id} className="p-5 border-l border-border/50 flex flex-col gap-3">
                    <button
                      onClick={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                      className="w-full btn-primary py-3 rounded-xl shadow-lg ring-4 ring-amber-light/50 font-black text-xs uppercase tracking-wide"
                    >
                      Enquire Now
                    </button>
                    <Link
                      href={`/universities/${u.id}/${progSlug(program)}`}
                      className="text-[10px] font-black text-center text-amber hover:text-amber-bright uppercase tracking-tighter"
                    >
                      View Full Analysis →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SYLLABUS COMPARATOR — COLLAPSIBLE, BELOW TABLE ─────────── */}
            <div className="mt-8">
              <button
                onClick={() => setSyllabusOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 bg-white border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-amber/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber/10 flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                    <BookOpen size={16} className="text-amber" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-navy">Compare Syllabus Subjects</div>
                    <div className="text-[11px] text-ink-3 font-medium">Semester-wise subject breakdown for any two {program} universities</div>
                  </div>
                </div>
                <div className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  syllabusOpen
                    ? "bg-navy/5 text-navy"
                    : "bg-amber text-white shadow-sm shadow-amber/30"
                )}>
                  {syllabusOpen ? (
                    <><ChevronUp size={14} /> Collapse</>
                  ) : (
                    <><ChevronDown size={14} /> Compare Syllabus</>
                  )}
                </div>
              </button>

              {syllabusOpen && (
                <div className="mt-4">
                  <SyllabusComparison program={program} />
                </div>
              )}
            </div>

            {/* ── BOTTOM PROOF / CTA SECTION ──────────────────────────────── */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trust card */}
              <div className="p-8 rounded-3xl text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d2240 0%, #1e3a5f 100%)' }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-bright/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center mb-4">
                    <ShieldCheck size={20} className="text-amber" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 leading-tight">
                    India's Only Direct-to-Counsellor Guide
                  </h3>
                  <p className="text-white/60 text-sm mb-6 leading-relaxed">
                    We are not an automated search engine. Our database is verified by human experts who cross-check every UGC approval and NIRF update directly from government sources.
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-amber">127+</span>
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Unis Verified</span>
                    </div>
                    <div className="w-px h-10 bg-white/15" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-amber">24 Hr</span>
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Callback Guarantee</span>
                    </div>
                    <div className="w-px h-10 bg-white/15" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-amber">100%</span>
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">UGC DEB Approved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frequently compared */}
              <div className="p-6 bg-white border border-border rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-amber" />
                  <h3 className="font-display text-base font-bold text-navy">Frequently Compared</h3>
                </div>
                <div className="space-y-2">
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
                    <div
                      key={c}
                      className="flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-amber hover:bg-amber-light/10 transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-bold text-ink-2 group-hover:text-navy">{c}</span>
                      <ChevronRight size={14} className="text-ink-3 group-hover:text-amber flex-shrink-0" />
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

// ── Section Divider Component ──────────────────────────────────────────────
function SectionDivider({
  label,
  icon,
  colorClass,
  textClass,
  leftAccent,
}: {
  label: string
  icon: React.ReactNode
  colorClass: string
  textClass: string
  leftAccent?: string
}) {
  return (
    <div className={clsx('p-3 px-5 flex items-center gap-3', colorClass)}
      style={leftAccent ? { borderLeft: `4px solid ${leftAccent}` } : undefined}
    >
      <span className={clsx('text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2', textClass)}>
        {icon}
        {label}
      </span>
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
    <div
      className="grid items-stretch border-b border-border/40 group hover:bg-amber-light/5 transition-colors"
      style={{ gridTemplateColumns: `180px repeat(${unis.length}, minmax(220px, 1fr))` }}
    >
      <div className="p-4 flex items-center gap-2 bg-bg/30 font-bold text-xs text-ink-3 border-r border-border/50 group-hover:bg-bg/60 transition-colors">
        {icon}
        <span>{label}</span>
      </div>
      {unis.map((u, idx) => (
        <div
          key={u.id}
          className={clsx(
            "p-4 py-6 border-l border-border/40 flex flex-col items-center justify-center text-center",
            idx % 2 === 0 ? "bg-white" : "bg-bg/20"
          )}
        >
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
        <Zap className="animate-pulse mr-2" size={20} />
        Loading Comparison Engine...
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
