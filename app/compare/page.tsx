'use client'

import { getSortRank } from '@/lib/data-slim'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, BarChart2, Plus, Minus,
  TrendingUp, Briefcase, Lock, Award,
  Wallet, BookOpen, ChevronRight, ChevronDown, ChevronUp,
  Info, ShieldCheck, Zap, Search, X, Star, GraduationCap, Users,
  Calendar, ArrowUp
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
    <div className="rounded-3xl overflow-hidden border-2 border-amber/40 shadow-2xl bg-white">
      {/* Hero Header */}
      <div
        className="px-6 sm:px-10 py-8"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0d2240 60%, #1a1a2e 100%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            <BookOpen size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              Compare Syllabus Side by Side
            </h2>
            <p className="text-white/60 text-sm mt-1.5 leading-relaxed">
              Select any two universities to compare semester-wise subjects
              {program === 'MBA' ? ' and specialisations' : ''} — instantly see what each teaches
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
            <div
              key={side}
              className="p-5 sm:p-7 flex flex-col gap-4"
              style={{ borderTop: `3px solid ${accentColor}` }}
            >
              {/* University label pill */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-black shadow-md"
                  style={{ background: accentColor }}
                >
                  {side}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-ink-3">{label}</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-bg border-2 border-border rounded-xl px-3 py-3 focus-within:border-amber focus-within:bg-white shadow-sm transition-all">
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
                      className="w-full text-xs font-semibold rounded-xl border-2 border-border bg-bg px-3 py-3 text-ink focus:outline-none focus:border-amber shadow-sm transition-all"
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
        <div className="flex items-center gap-4 px-6 pb-5 pt-3 border-t border-amber/10 bg-amber/5">
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

// ── NIRF Rank Badge ──────────────────────────────────────────────────────────
function NirfBadge({ rank }: { rank?: number | string }) {
  if (!rank) return <span className="text-ink-3 font-bold text-sm">—</span>
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5282 100%)',
          borderColor: '#f59e0b',
          boxShadow: '0 4px 16px rgba(30,58,95,0.3)',
        }}
      >
        <div className="text-center leading-none">
          <div className="text-[9px] font-bold text-amber/80 uppercase tracking-wider">#</div>
          <div className="text-xl font-black text-white leading-none">{rank}</div>
        </div>
      </div>
      <span className="text-[9px] text-ink-3 uppercase font-bold tracking-wider">NIRF Rank</span>
    </div>
  )
}

// ── NAAC Grade Badge ─────────────────────────────────────────────────────────
function NaacBadge({ grade }: { grade?: string }) {
  if (!grade) return <span className="text-ink-3 font-bold text-sm">—</span>
  const styles =
    grade.includes('A++') ? { bg: '#14532d', text: '#fff', border: '#166534', glow: '#22c55e' }
    : grade.includes('A+') ? { bg: '#92400e', text: '#fff', border: '#d97706', glow: '#f59e0b' }
    : grade.includes('A') ? { bg: '#1e40af', text: '#fff', border: '#3b82f6', glow: '#60a5fa' }
    : { bg: '#374151', text: '#fff', border: '#6b7280', glow: '#9ca3af' }
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm shadow-md"
      style={{
        background: styles.bg,
        color: styles.text,
        border: `2px solid ${styles.border}`,
        boxShadow: `0 0 12px ${styles.glow}40`,
      }}
    >
      <ShieldCheck size={14} />
      NAAC {grade}
    </div>
  )
}

// ── Fee Range Bar ────────────────────────────────────────────────────────────
function FeeRangeBar({ feeMin, feeMax, colIdx }: { feeMin: number; feeMax: number; colIdx: number }) {
  const colors = ['#1e3a5f', '#d97706', '#16a34a']
  const color = colors[colIdx] || colors[0]
  const maxPossible = 300000
  const minPct = Math.min((feeMin / maxPossible) * 100, 100)
  const maxPct = Math.min((feeMax / maxPossible) * 100, 100)
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[180px]">
      <div className="flex items-end justify-between w-full gap-1">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-ink-3 font-bold uppercase tracking-wide">Min</span>
          <span className="text-sm font-black" style={{ color }}>{formatFee(feeMin)}</span>
        </div>
        <span className="text-ink-3 text-xs font-bold mb-0.5">—</span>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-ink-3 font-bold uppercase tracking-wide">Max</span>
          <span className="text-sm font-black" style={{ color }}>{formatFee(feeMax)}</span>
        </div>
      </div>
      <div className="relative w-full h-3 bg-bg rounded-full overflow-hidden border border-border/50">
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${minPct}%`,
            width: `${maxPct - minPct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            minWidth: 12,
          }}
        />
      </div>
      <span className="text-[9px] text-ink-3 font-medium">Total Program Fee</span>
    </div>
  )
}

// ── EMI Display ──────────────────────────────────────────────────────────────
function EmiDisplay({ emiFrom }: { emiFrom: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber/30 bg-amber/5">
        <Calendar size={14} className="text-amber flex-shrink-0" />
        <span className="text-base font-black text-amber-text">
          &#x20B9;{emiFrom.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-ink-3">/mo</span>
      </div>
      <span className="text-[9px] text-ink-3 font-medium uppercase tracking-wider">No-Cost EMI Available</span>
    </div>
  )
}

// ── Approval Badges ──────────────────────────────────────────────────────────
function ApprovalBadges({ approvals }: { approvals: string[] }) {
  const checks = ['UGC DEB', 'AICTE', 'WES', 'QS']
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {checks.map(ap => {
        const has = approvals.some(a => a.toLowerCase().includes(ap.toLowerCase()))
        return (
          <div
            key={ap}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all",
              has
                ? "bg-white border-green-300 text-green-700 shadow-sm shadow-green-100"
                : "bg-bg border-border/30 text-ink-3 line-through opacity-35"
            )}
          >
            {has && <CheckCircle size={10} className="text-green-500 flex-shrink-0" />}
            {ap}
          </div>
        )
      })}
    </div>
  )
}

// ── Salary Range Display ─────────────────────────────────────────────────────
function SalaryDisplay({ salary, colIdx }: { salary: string; colIdx: number }) {
  const colors = ['#1e3a5f', '#d97706', '#16a34a']
  const color = colors[colIdx] || colors[0]
  const display = salary || '₹4L – ₹10L'
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[180px]">
      <div className="flex items-center gap-2">
        <ArrowUp size={16} className="text-green-500" />
        <span className="text-lg font-black" style={{ color }}>{display}</span>
      </div>
      <div className="relative w-full h-2.5 bg-bg rounded-full overflow-hidden border border-border/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: '70%',
            background: `linear-gradient(90deg, ${color}40, ${color})`,
          }}
        />
      </div>
      <span className="text-[9px] text-ink-3 font-medium uppercase tracking-wider">Avg CTC Post Graduation</span>
    </div>
  )
}

// ── Company Pills ────────────────────────────────────────────────────────────
const PILL_COLORS = [
  { bg: '#eff6ff', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#f0fdf4', text: '#15803d' },
  { bg: '#faf5ff', text: '#6b21a8' },
  { bg: '#fff1f2', text: '#be123c' },
]
function CompanyPills({ companies }: { companies: string[] }) {
  if (!companies || companies.length === 0) return <span className="text-ink-3 text-xs">—</span>
  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-[200px]">
      {companies.slice(0, 6).map((c, i) => (
        <span
          key={c}
          className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
          style={{ background: PILL_COLORS[i % PILL_COLORS.length].bg, color: PILL_COLORS[i % PILL_COLORS.length].text }}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

// ── Specialisation Display ───────────────────────────────────────────────────
function SpecDisplay({ specs, colIdx }: { specs: string[]; colIdx: number }) {
  const colors = ['#1e3a5f', '#d97706', '#16a34a']
  const color = colors[colIdx] || colors[0]
  const pillBg = colIdx === 0 ? '#eff6ff' : colIdx === 1 ? '#fef3c7' : '#f0fdf4'
  const pillText = color
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        {specs.length}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none max-w-full">
        {specs.slice(0, 4).map(s => (
          <span
            key={s}
            className="flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap"
            style={{ background: pillBg, color: pillText }}
          >
            {s}
          </span>
        ))}
        {specs.length > 4 && (
          <span className="flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold text-amber-text bg-amber/10">
            +{specs.length - 4} more
          </span>
        )}
      </div>
      <span className="text-[9px] text-ink-3 font-medium uppercase tracking-wider">Specialisations</span>
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

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-6 sm:pt-12 sm:pb-10">
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
            <div className="flex items-center p-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm gap-1 w-full sm:w-auto">
              {(['MBA', 'MCA'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setProgram(p); setSelectedIds(['jain-university-online', 'amity-university-online']) }}
                  className={clsx(
                    "flex-1 sm:flex-none px-7 py-2.5 text-sm font-bold rounded-xl transition-all duration-200",
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Currently comparing */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider whitespace-nowrap">Comparing:</span>
              {universities.map((u, idx) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-navy/5 border border-navy/15 group"
                >
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {getUniversityLogo(u.id) ? (
                      <img src={getUniversityLogo(u.id)!} alt={u.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span
                        className="text-white font-black text-[9px] w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: idx === 0 ? '#1e3a5f' : idx === 1 ? '#d97706' : '#16a34a' }}
                      >
                        {u.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-navy max-w-[140px] truncate" title={u.name}>{u.name}</span>
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
            <div className="mt-3 flex flex-col sm:flex-row sm:flex-nowrap gap-2 sm:overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                      <span className="text-navy font-black text-[9px]">{u.name.slice(0, 3).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[11px] font-bold text-navy group-hover:text-amber-text transition-colors max-w-[120px] truncate" title={u.name}>
                      {u.name}
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

            {/* ── SYLLABUS COMPARATOR — HERO FEATURE, ABOVE TABLE ──────── */}
            <div className="mt-8 mb-10">
              {/* Featured Tool amber badge */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm"
                  style={{ background: '#f59e0b', color: '#fff', boxShadow: '0 2px 8px rgba(245,158,11,0.35)' }}
                >
                  <Star size={11} fill="currentColor" /> Featured Tool
                </span>
                <span className="text-[11px] text-ink-3 font-medium">The most powerful feature on this page</span>
              </div>
              <SyllabusComparison program={program} />
            </div>

            {/* Comparison Grid */}
            <div className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>

              {/* Sticky Table Header */}
              <div
                ref={headerRef}
                className="sticky top-[73px] z-[35] bg-white border-b-2 border-border shadow-md"
              >
                <div
                  className="grid items-stretch"
                  style={{ gridTemplateColumns: `180px repeat(${universities.length}, minmax(220px, 1fr))` }}
                >
                  <div className="p-4 flex flex-col justify-center border-r border-border/50 bg-navy/3 sticky left-0 z-10">
                    <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Comparing</span>
                    <span className="text-xs font-black text-amber mt-0.5">{universities.length} Online {program}</span>
                  </div>
                  {universities.map((u, idx) => {
                    const colColors = ['#1e3a5f', '#d97706', '#16a34a']
                    return (
                      <div
                        key={u.id}
                        className="p-4 border-r border-border/50 flex flex-col items-center text-center relative group min-w-[220px]"
                        style={{ borderTop: `3px solid ${colColors[idx]}` }}
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
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base"
                              style={{ background: colColors[idx] }}
                            >
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] font-black text-navy leading-tight line-clamp-2 px-2 uppercase tracking-tight mb-2">{u.name}</div>
                        <NaacBadge grade={u.naac} />
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
                fn={(u, idx) => <NirfBadge rank={u.nirf} />}
              />
              <ComparisonRow
                label="NAAC Grade"
                icon={<ShieldCheck size={12} className="text-sage" />}
                unis={universities}
                fn={(u, idx) => <NaacBadge grade={u.naac} />}
              />
              <ComparisonRow
                label="Approvals"
                icon={<CheckCircle size={12} className="text-blue" />}
                unis={universities}
                fn={(u, idx) => <ApprovalBadges approvals={u.approvals} />}
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
                fn={(u, idx) => (
                  <FeeRangeBar feeMin={u.feeMin} feeMax={u.feeMax} colIdx={idx} />
                )}
              />
              <ComparisonRow
                label="EMI Starting"
                unis={universities}
                fn={(u, idx) => <EmiDisplay emiFrom={u.emiFrom} />}
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
                  <div className="p-4 flex items-center gap-2 bg-black/10 sticky left-0 z-10">
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
                fn={(u, idx) => (
                  <SalaryDisplay
                    salary={u.programDetails[program]?.avgSalary || (program === 'MCA' ? '₹4L – ₹10L' : '₹5L – ₹12L')}
                    colIdx={idx}
                  />
                )}
              />
              <ComparisonRow
                label="Top Hiring Partners"
                unis={universities}
                fn={(u, idx) => (
                  <CompanyPills companies={u.programDetails[program]?.topCompanies || []} />
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
                fn={(u, idx) => (
                  <SpecDisplay
                    specs={u.programDetails[program]?.specs || []}
                    colIdx={idx}
                  />
                )}
              />

              {/* ── ACTION BUTTON ROW */}
              <div
                className="grid items-stretch bg-navy/3 border-t-2 border-border"
                style={{ gridTemplateColumns: `180px repeat(${universities.length}, minmax(220px, 1fr))` }}
              >
                <div className="p-4 flex items-center justify-center border-r border-border/50 bg-bg/30 sticky left-0 z-10">
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
            </div>{/* /overflow-x-auto */}
            </div>{/* /Comparison Grid */}

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
  fn: (u: University, idx: number) => React.ReactNode,
  icon?: React.ReactNode
}) {
  return (
    <div
      className="grid items-stretch border-b border-border/40 group hover:bg-amber-light/5 transition-colors"
      style={{ gridTemplateColumns: `180px repeat(${unis.length}, minmax(220px, 1fr))` }}
    >
      <div className="p-4 flex items-center gap-2 bg-bg/30 font-bold text-xs text-ink-3 border-r border-border/50 group-hover:bg-bg/60 transition-colors sticky left-0 z-10">
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
          style={{ borderTop: `2px solid ${idx === 0 ? '#1e3a5f20' : idx === 1 ? '#d9770620' : '#16a34a20'}` }}
        >
          {fn(u, idx)}
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
