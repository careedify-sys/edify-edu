'use client'

import { getSortRank } from '@/lib/data-slim'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, BarChart2, Plus,
  TrendingUp, Lock, Award,
  Wallet, BookOpen, ChevronRight,
  ShieldCheck, Zap, Search, X, Star, GraduationCap, Users,
  Calendar, ArrowUp
} from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { getUniversityById } from '@/lib/data'
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
          <BookOpen size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Compare Syllabus Side by Side</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Select two universities to compare semester-wise subjects{program === 'MBA' ? ' and specialisations' : ''}
          </p>
        </div>
      </div>

      {/* Two-column selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
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
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</span>

              <div className="relative">
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 bg-white transition-colors">
                  <Search size={13} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowDrop(true) }}
                    onFocus={() => setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                    placeholder="Search university…"
                    className="flex-1 text-sm text-slate-700 bg-transparent outline-none min-w-0 placeholder:text-slate-400"
                    autoComplete="off"
                  />
                  {uniId && (
                    <button onClick={() => clearUni(side)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>

                {showDrop && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map(uni => (
                      <button
                        key={uni.id}
                        onMouseDown={() => selectUni(side, uni)}
                        className={clsx(
                          "w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-amber-50 transition-colors border-b border-slate-100 last:border-0",
                          uniId === uni.id && "bg-amber-50 text-amber-700 font-semibold"
                        )}
                      >
                        {uni.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {uniId && (
                <>
                  {hasNoSpecData(syllabus) ? (
                    <p className="text-xs text-slate-400 text-center py-2">No syllabus data available. <span className="font-medium">Contact us for details.</span></p>
                  ) : specs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">No specialisation data available yet.</p>
                  ) : (
                    <select
                      value={spec}
                      onChange={e => setSpec(e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="">— Select Specialisation —</option>
                      {specs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </>
              )}

              {spec && syllabus?.sem1 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Sem 1 — Core Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {syllabus.sem1.split(' | ').map(s => s.trim()).filter(Boolean).map(subj => (
                      <span key={subj} className="px-2 py-1 rounded-md text-[11px] bg-slate-50 border border-slate-200 text-slate-500">{subj}</span>
                    ))}
                  </div>
                </div>
              )}

              {spec && subjects.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Sem 3–4 Electives — {spec}</p>
                  <div className="space-y-1">
                    {subjects.map(subj => {
                      const inOther = otherSpec && otherSet.has(subj.toLowerCase())
                      return (
                        <div
                          key={subj}
                          className={clsx(
                            "px-2.5 py-1.5 rounded-lg text-xs border-l-2",
                            !otherSpec
                              ? "bg-slate-50 border-slate-200 text-slate-600"
                              : inOther
                              ? "bg-green-50 border-green-400 text-green-700"
                              : "bg-amber-50 border-amber-400 text-amber-700"
                          )}
                        >
                          {subj}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {spec && subjects.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No data for this specialisation. <span className="font-medium">Contact us.</span></p>
              )}
            </div>
          )
        })}
      </div>

      {(specA || specB) && (
        <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block" />
            Common subject
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
            Unique subject
          </span>
        </div>
      )}
    </div>
  )
}

function NaacBadge({ grade }: { grade?: string }) {
  if (!grade) return <span className="text-slate-400 text-sm">—</span>
  const cls =
    grade.includes('A++') ? 'bg-green-100 text-green-700 border-green-200'
    : grade.includes('A+') ? 'bg-amber-100 text-amber-700 border-amber-200'
    : grade.includes('A') ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', cls)}>
      <ShieldCheck size={11} />
      NAAC {grade}
    </span>
  )
}

function ApprovalBadges({ approvals }: { approvals: string[] }) {
  const checks = ['UGC DEB', 'AICTE', 'WES', 'QS']
  return (
    <div className="flex flex-wrap gap-1.5">
      {checks.map(ap => {
        const has = approvals.some(a => a.toLowerCase().includes(ap.toLowerCase()))
        return (
          <span
            key={ap}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border",
              has
                ? "bg-white border-green-200 text-green-700"
                : "bg-slate-50 border-slate-200 text-slate-300 line-through"
            )}
          >
            {has && <CheckCircle size={10} className="text-green-500" />}
            {ap}
          </span>
        )
      })}
    </div>
  )
}

function UniCard({
  u, idx, program, onRemove, onEnquire,
}: {
  u: University; idx: number; program: 'MBA' | 'MCA'; onRemove: () => void; onEnquire: () => void
}) {
  const pd = u.programDetails?.[program]
  const specs = pd?.specs || []
  const companies = pd?.topCompanies || []
  const salary = pd?.avgSalary || (program === 'MCA' ? '₹4L – ₹10L' : '₹5L – ₹12L')

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-start gap-3">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-slate-50 rounded-xl border border-slate-100">
          {getUniversityLogo(u.id) ? (
            <img src={getUniversityLogo(u.id)!} alt={u.name} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-slate-500 font-bold text-sm">{u.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-snug">{u.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {u.nirf && <span className="text-xs font-bold text-slate-700">#{u.nirf} NIRF</span>}
            <NaacBadge grade={u.naac} />
          </div>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
          <X size={14} />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Course Fees</span>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-800">{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">EMI from ₹{u.emiFrom.toLocaleString()}/mo</p>
          </div>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Approvals</span>
          <ApprovalBadges approvals={u.approvals} />
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Salary</span>
          <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
            <ArrowUp size={13} className="text-green-500" />
            {salary}
          </span>
        </div>
        {specs.length > 0 && (
          <div className="px-4 py-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">{specs.length} Specialisations</span>
            <div className="flex flex-wrap gap-1">
              {specs.slice(0, 5).map(s => (
                <span key={s} className="px-2 py-1 rounded-md text-[11px] bg-slate-50 border border-slate-200 text-slate-600">{s}</span>
              ))}
              {specs.length > 5 && (
                <span className="px-2 py-1 rounded-md text-[11px] bg-amber-50 border border-amber-200 text-amber-600">+{specs.length - 5} more</span>
              )}
            </div>
          </div>
        )}
        {companies.length > 0 && (
          <div className="px-4 py-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Hiring Partners</span>
            <p className="text-xs text-slate-600 leading-relaxed">{companies.slice(0, 6).join(', ')}</p>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Placement Support</span>
          <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
            <CheckCircle size={12} className="text-green-500" />
            LMS + Job Portal
          </span>
        </div>
      </div>

      <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
        <button onClick={onEnquire} className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
          Enquire Now
        </button>
        <Link href={`/universities/${u.id}/${progSlug(program)}`} className="text-xs text-center text-amber-600 hover:text-amber-700 font-semibold">
          View Full Analysis →
        </Link>
      </div>
    </div>
  )
}

function SectionDivider({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 bg-slate-50 border-y border-slate-100 flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function ComparisonRow({ label, unis, fn, icon = null }: {
  label: string; unis: University[]; fn: (u: University, idx: number) => React.ReactNode; icon?: React.ReactNode
}) {
  return (
    <div
      className="grid items-stretch border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
      style={{ gridTemplateColumns: `160px repeat(${unis.length}, minmax(200px, 1fr))` }}
    >
      <div className="p-4 flex items-center gap-2 text-xs font-medium text-slate-500 border-r border-slate-100 sticky left-0 z-10 bg-white">
        {icon}
        <span>{label}</span>
      </div>
      {unis.map((u, idx) => (
        <div key={u.id} className="p-4 py-5 border-l border-slate-100 flex flex-col items-center justify-center text-center bg-white">
          {fn(u, idx)}
        </div>
      ))}
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
  const [uniSearch, setUniSearch] = useState('')

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
      <div className="min-h-[400px] bg-white flex items-center justify-center text-slate-400">
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
    ? available.filter(u => (u.name || '').toLowerCase().includes(uniSearch.toLowerCase()))
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

  function FeeDisplay({ u }: { u: University }) {
    return (
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800">{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Total program fee</p>
      </div>
    )
  }

  function EmiDisplay({ u }: { u: University }) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Calendar size={13} className="text-amber-500" />
        <span className="font-bold text-slate-800">₹{u.emiFrom.toLocaleString()}/mo</span>
      </div>
    )
  }

  function SpecDisplay({ u }: { u: University }) {
    const specs = u.programDetails?.[program]?.specs || []
    if (!specs.length) return <span className="text-slate-400 text-xs">—</span>
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-lg font-bold text-slate-700">{specs.length}</span>
        <div className="flex flex-wrap justify-center gap-1">
          {specs.slice(0, 3).map(s => (
            <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">{s}</span>
          ))}
          {specs.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600">+{specs.length - 3}</span>
          )}
        </div>
      </div>
    )
  }

  function SalaryDisplay({ u }: { u: University }) {
    const salary = u.programDetails?.[program]?.avgSalary || (program === 'MCA' ? '₹4L – ₹10L' : '₹5L – ₹12L')
    return (
      <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
        <ArrowUp size={13} className="text-green-500" />
        {salary}
      </span>
    )
  }

  function CompaniesDisplay({ u }: { u: University }) {
    const companies = u.programDetails?.[program]?.topCompanies || []
    if (!companies.length) return <span className="text-slate-400 text-xs">—</span>
    return (
      <p className="text-[11px] text-slate-600 text-center leading-relaxed max-w-[180px]">
        {companies.slice(0, 5).join(', ')}
      </p>
    )
  }

  return (
    <div className="pb-20 bg-white">
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

      {/* ── PROGRAM TOGGLE (inside client) ───────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Program toggle */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex p-1 rounded-xl border border-slate-200 bg-slate-50 gap-1">
              {(['MBA', 'MCA'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setProgram(p); setSelectedIds(['jain-university-online', 'amity-university-online']) }}
                  className={clsx(
                    "px-5 py-1.5 text-sm font-semibold rounded-lg transition-all",
                    program === p
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white"
                  )}
                >
                  Online {p}
                </button>
              ))}
            </div>
          </div>

          {/* Selected pills row */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Comparing:</span>
            {universities.map((u) => (
              <div key={u.id} className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg bg-slate-100 border border-slate-200">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {getUniversityLogo(u.id) ? (
                    <img src={getUniversityLogo(u.id)!} alt={u.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-slate-500 font-bold text-[9px]">{u.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 max-w-[130px] truncate">{u.name}</span>
                <button onClick={() => removeUni(u.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                  <X size={11} />
                </button>
              </div>
            ))}
            {selectedIds.length < 3 && (
              <span className="text-[11px] text-slate-400 font-medium">+ add {3 - selectedIds.length} more</span>
            )}
          </div>

          {selectedIds.length < 3 && (
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-amber-400 bg-white transition-colors max-w-sm">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={uniSearch}
                onChange={e => setUniSearch(e.target.value)}
                placeholder={`Search ${program} university to add…`}
                className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
                autoComplete="off"
              />
              {uniSearch && (
                <button onClick={() => setUniSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {selectedIds.length < 3 && filteredAvailable.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {filteredAvailable.slice(0, uniSearch ? 20 : 12).map(u => (
                <button
                  key={u.id}
                  onClick={() => { addUni(u.id); setUniSearch('') }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all text-[11px] font-medium text-slate-600 hover:text-amber-700"
                >
                  <Plus size={11} className="text-slate-400" />
                  {u.name}
                </button>
              ))}
              {!uniSearch && filteredAvailable.length > 12 && (
                <span className="text-[11px] text-slate-400 self-center px-1">+{filteredAvailable.length - 12} — search above</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {universities.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <BarChart2 size={28} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-700 mb-2">No Universities Selected</p>
            <p className="text-slate-400 mb-7 text-sm">Add up to 3 universities to compare their fees and rankings.</p>
            <Link href="/universities" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Browse All Universities
            </Link>
          </div>
        ) : (
          <div>
            {verdict && (
              <div className="mt-6 mb-6 border border-slate-200 rounded-2xl bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">The Edify Verdict</p>
                    <p className="text-[11px] text-slate-400">Based on rankings and placement data for Online {program}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Highest Rank</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-0.5">{verdict.bestNirf.name}</p>
                    <p className="text-xs text-slate-400">NIRF #{verdict.bestNirf.nirf}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-semibold text-green-500 uppercase tracking-wider mb-1">Best Value</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-0.5">{verdict.cheapest.name}</p>
                    <p className="text-xs text-slate-400">From {formatFee(verdict.cheapest.feeMin)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Career Reach</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-0.5">{verdict.bestSalary.name}</p>
                    <p className="text-xs text-slate-400">Top Hiring Index for {program}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-semibold">
                  <Star size={10} fill="currentColor" /> Featured Tool
                </span>
                <span className="text-[11px] text-slate-400">Compare semester-wise subjects instantly</span>
              </div>
              <SyllabusComparison program={program} />
            </div>

            {/* Mobile: cards stacked */}
            <div className="md:hidden space-y-4 mb-8">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">University Details</p>
              {universities.map((u, idx) => (
                <UniCard
                  key={u.id}
                  u={u}
                  idx={idx}
                  program={program}
                  onRemove={() => removeUni(u.id)}
                  onEnquire={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                />
              ))}
            </div>

            {/* Desktop: side-by-side table */}
            <div className="hidden md:block mb-8 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="sticky top-[57px] z-[35] border-b border-slate-200 bg-white">
                  <div className="grid" style={{ gridTemplateColumns: `160px repeat(${universities.length}, minmax(200px, 1fr))` }}>
                    <div className="p-4 border-r border-slate-100 bg-slate-50">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Comparing</span>
                      <span className="text-xs font-bold text-amber-600 mt-0.5 block">{universities.length} Online {program}</span>
                    </div>
                    {universities.map((u, idx) => (
                      <div
                        key={u.id}
                        className="p-4 border-r border-slate-100 flex flex-col items-center text-center relative group min-w-[200px]"
                        style={{ borderTop: `2px solid ${idx === 0 ? '#1e3a5f' : idx === 1 ? '#d97706' : '#16a34a'}` }}
                      >
                        <button
                          onClick={() => removeUni(u.id)}
                          className="absolute right-2 top-2 p-1 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        >
                          <X size={12} />
                        </button>
                        <div className="h-10 flex items-center justify-center mb-2">
                          {getUniversityLogo(u.id) ? (
                            <img src={getUniversityLogo(u.id)!} alt={u.name} style={{ maxHeight: '100%', maxWidth: '130px', objectFit: 'contain' }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-snug line-clamp-2 px-2 mb-1.5">{u.name}</p>
                        <NaacBadge grade={u.naac} />
                      </div>
                    ))}
                  </div>
                </div>

                <SectionDivider label="Academic Credibility" icon={<Award size={13} />} />
                <ComparisonRow label="NIRF Rank" icon={<BarChart2 size={12} className="text-amber-500" />} unis={universities}
                  fn={(u) => u.nirf ? <span className="text-lg font-bold text-slate-800">#{u.nirf}</span> : <span className="text-slate-300">—</span>}
                />
                <ComparisonRow label="NAAC Grade" icon={<ShieldCheck size={12} className="text-slate-400" />} unis={universities}
                  fn={(u) => <NaacBadge grade={u.naac} />}
                />
                <ComparisonRow label="Approvals" icon={<CheckCircle size={12} className="text-slate-400" />} unis={universities}
                  fn={(u) => <ApprovalBadges approvals={u.approvals} />}
                />

                <SectionDivider label="Fee Structure" icon={<Wallet size={13} />} />
                <ComparisonRow label="Course Fees" unis={universities} fn={(u) => <FeeDisplay u={u} />} />
                <ComparisonRow label="EMI Option" unis={universities} fn={(u) => <EmiDisplay u={u} />} />

                <div
                  onClick={() => { setEnquiryUni('Scholarship Enquiry'); setEnquiryOpen(true) }}
                  className="cursor-pointer bg-amber-500 hover:bg-amber-600 transition-colors"
                >
                  <div className="grid items-stretch" style={{ gridTemplateColumns: `160px repeat(${universities.length}, minmax(200px, 1fr))` }}>
                    <div className="p-4 flex items-center gap-2 bg-black/10">
                      <Lock size={14} className="text-white" />
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">Scholarship</span>
                    </div>
                    {universities.map(u => (
                      <div key={u.id} className="p-4 border-l border-white/20 flex flex-col items-center justify-center gap-1">
                        <p className="text-xs font-medium text-white text-center">Save up to ₹50,000 — check eligibility</p>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] font-semibold text-white border border-white/30 hover:bg-white hover:text-amber-600 transition-all uppercase tracking-tight">
                          Check Now
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <SectionDivider label="Career Outcomes" icon={<TrendingUp size={13} />} />
                <ComparisonRow label="Avg Salary" unis={universities} fn={(u) => <SalaryDisplay u={u} />} />
                <ComparisonRow label="Hiring Partners" unis={universities} fn={(u) => <CompaniesDisplay u={u} />} />
                <ComparisonRow label="Placement Support" unis={universities}
                  fn={() => (
                    <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <CheckCircle size={13} className="text-green-500" />
                      LMS + Job Portal
                    </span>
                  )}
                />

                <SectionDivider label="Curriculum" icon={<BookOpen size={13} />} />
                <ComparisonRow label="Specialisations" unis={universities} fn={(u) => <SpecDisplay u={u} />} />

                <div className="grid bg-slate-50 border-t border-slate-200" style={{ gridTemplateColumns: `160px repeat(${universities.length}, minmax(200px, 1fr))` }}>
                  <div className="p-4 flex items-center justify-center border-r border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 text-center">Ready to pick your university?</p>
                  </div>
                  {universities.map(u => (
                    <div key={u.id} className="p-4 border-l border-slate-100 flex flex-col gap-2">
                      <button onClick={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                        Enquire Now
                      </button>
                      <Link href={`/universities/${u.id}/${progSlug(program)}`} className="text-[11px] font-semibold text-center text-amber-600 hover:text-amber-700">
                        View Full Analysis →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d2240 0%, #1e3a5f 100%)' }}>
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                    <ShieldCheck size={18} className="text-amber-400" />
                  </div>
                  <p className="text-base font-bold text-white mb-2 leading-tight">
                    India&apos;s Only Direct-to-Counsellor Guide
                  </p>
                  <p className="text-white/50 text-sm mb-5 leading-relaxed">
                    Our database is verified by human experts who cross-check every UGC approval and NIRF update from government sources.
                  </p>
                  <div className="flex items-center gap-5">
                    <div>
                      <span className="text-xl font-bold text-amber-400 block">127+</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">Unis Verified</span>
                    </div>
                    <div className="w-px h-8 bg-white/15" />
                    <div>
                      <span className="text-xl font-bold text-amber-400 block">24 Hr</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">Callback</span>
                    </div>
                    <div className="w-px h-8 bg-white/15" />
                    <div>
                      <span className="text-xl font-bold text-amber-400 block">100%</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">UGC DEB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={15} className="text-amber-500" />
                  <p className="text-sm font-bold text-slate-800">Frequently Compared</p>
                </div>
                <div className="space-y-2">
                  {(program === 'MCA' ? [
                    { label: "Amity Online MCA vs JAIN Online MCA", href: "/compare?a=amity-university-online&b=jain-university-online" },
                    { label: "LPU Online MCA vs Chandigarh University MCA", href: "/compare?a=lovely-professional-university-online&b=chandigarh-university-online" },
                    { label: "Manipal MUJ MCA vs Sikkim Manipal MCA", href: "/compare?a=manipal-university-jaipur-online&b=sikkim-manipal-university-online" },
                    { label: "UPES Online MCA vs Galgotias MCA", href: "/compare?a=upes-online&b=galgotias-university-online" },
                  ] : [
                    { label: "Amity Online MBA vs NMIMS Online MBA", href: "/compare?a=amity-university-online&b=nmims-online" },
                    { label: "Symbiosis Online MBA vs Manipal MUJ MBA", href: "/compare?a=symbiosis-university-online&b=manipal-university-jaipur-online" },
                    { label: "JAIN Online MBA vs Chandigarh University MBA", href: "/compare?a=jain-university-online&b=chandigarh-university-online" },
                    { label: "LPU Online MBA vs Amrita Online MBA", href: "/compare?a=lovely-professional-university-online&b=amrita-vishwa-vidyapeetham-online" },
                  ]).map(c => (
                    <Link
                      key={c.label}
                      href={c.href}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-all group no-underline"
                    >
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800">{c.label}</span>
                      <ChevronRight size={13} className="text-slate-400 group-hover:text-amber-500 flex-shrink-0" />
                    </Link>
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

export default function CompareClient() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] bg-white flex items-center justify-center text-slate-400">
        <Zap className="animate-pulse mr-2" size={20} />
        Loading Comparison Engine...
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
