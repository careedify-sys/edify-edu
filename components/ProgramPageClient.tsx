'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BookOpen, Star, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { getSortRank, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { cleanCareerOutcome } from '@/lib/format'
import type { Program, University } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

// ── Priority universities (highest enrollment) — always shown first ──
const PRIORITY_IDS = [
  'amity', 'chandigarh', 'jain', 'lpu', 'manipal-jaipur', 'mahe-manipal',
  'nmims', 'symbiosis', 'universi-of-petroleu-and', 'shoolini',
  'bharati-vidyapee-universi', 'amrita-vishwa-vidyapee', 'galgotia-universi',
]

// ── Universities with Dual Specialisation ─────────────────────
const DUAL_SPEC_IDS = [
  'amity', 'bharati-vidyapee-universi', 'chandigarh', 'jain', 'lpu',
  'noida-internat-universi', 'shoolini', 'manipal-jaipur', 'sikkim-manipal',
  'universi-of-lucknow', 'universi-of-mysore',
]

// ── Specialisation grouping ──────────────────────────────────────
const SPEC_GROUPS: Record<string, string[]> = {
  Finance:     ['Finance', 'Banking & Finance', 'Financial Management', 'Accounting & Finance', 'Investment Banking', 'Banking, Finance & Insurance', 'Corporate Finance', 'Financial Technology', 'Wealth Management', 'Capital Market', 'Banking & Insurance'],
  Marketing:   ['Marketing', 'Digital Marketing', 'Sales & Marketing', 'Brand Management', 'E-Commerce & Digital Marketing', 'International Marketing', 'Retail Management', 'Advertising & Brand Communication'],
  HR:          ['Human Resource Management', 'HR Analytics', 'Talent Acquisition', 'Organizational Behavior', 'Human Resources', 'People Management'],
  Technology:  ['Information Technology', 'Data Science', 'Artificial Intelligence', 'Machine Learning', 'AI & Machine Learning', 'Business Analytics', 'Cyber Security', 'Cloud Computing', 'Big Data Analytics', 'DevOps', 'Data Analytics', 'Business Intelligence', 'Digital Transformation', 'Fintech', 'Blockchain Technology'],
  Operations:  ['Operations Management', 'Supply Chain Management', 'Logistics & Supply Chain', 'Logistics & Supply Chain Management', 'Project Management', 'Production & Operations Management', 'Retail & Operations'],
  Healthcare:  ['Healthcare Management', 'Hospital & Healthcare Management', 'Hospital Management', 'Pharmaceutical Management', 'Hospital Administration'],
  Management:  ['General Management', 'International Business', 'Entrepreneurship', 'Media Management', 'Event Management', 'Rural Management', 'Agribusiness Management', 'Sports Management', 'Tourism & Hospitality Management', 'Travel & Tourism Management', 'Airlines & Airport Management', 'Aviation Management', 'Oil & Gas Management'],
}

// ── Spec normalization — collapse near-duplicate names ────────
const SPEC_CANONICAL: Record<string, string> = {
  'Human Resources': 'Human Resource Management',
  'HRM': 'Human Resource Management',
  'HR Management': 'Human Resource Management',
  'Information Technology (IT)': 'Information Technology',
  'IT Management': 'Information Technology',
  'Supply Chain Management': 'Logistics & Supply Chain Management',
  'Logistics & Supply Chain': 'Logistics & Supply Chain Management',
  'AI & Machine Learning': 'Artificial Intelligence & Machine Learning',
  'Artificial Intelligence': 'Artificial Intelligence & Machine Learning',
  'Machine Learning': 'Artificial Intelligence & Machine Learning',
  'Digital Marketing & E-Commerce': 'Digital Marketing',
  'Sales & Marketing': 'Marketing',
  'Banking & Finance': 'Finance & Banking',
  'Banking, Finance & Insurance': 'Finance & Banking',
  'Banking & Insurance': 'Finance & Banking',
}
function normalizeSpec(s: string): string { return SPEC_CANONICAL[s] || s }

function groupSpecs(specs: string[]): { group: string; items: string[] }[] {
  const used = new Set<string>()
  const groups: { group: string; items: string[] }[] = []
  for (const [groupName, keywords] of Object.entries(SPEC_GROUPS)) {
    const matched = specs.filter(s => !used.has(s) && keywords.some(k => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())))
    if (matched.length > 0) {
      matched.forEach(s => used.add(s))
      groups.push({ group: groupName, items: matched })
    }
  }
  const remaining = specs.filter(s => !used.has(s))
  if (remaining.length > 0) groups.push({ group: 'Other', items: remaining })
  return groups
}

interface Props {
  program: Program
  programSlug: string
  universities: University[]
  allSpecs: string[]
  initialSpec?: string
}

export default function ProgramPageClient({ program, programSlug, universities, allSpecs, initialSpec }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeSpec, setActiveSpec] = useState<string | null>(initialSpec || null)
  const [sortBy, setSortBy] = useState<'nirf'|'fees'>('nirf')
  const [activeSection, setActiveSection] = useState('universities')
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  function toggleGroup(g: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }
  function toggleExpand(g: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }

  // ── Priority sort ─────────────────────────────────────────────
  const sortedByPriority = (unis: University[]) => {
    const priority = unis.filter(u => PRIORITY_IDS.includes(u.id))
    const rest = unis.filter(u => !PRIORITY_IDS.includes(u.id))
    const sortFn = (a: University, b: University) =>
      sortBy === 'nirf' ? getSortRank(a) - getSortRank(b) : a.feeMin - b.feeMin
    return [
      ...priority.sort(sortFn),
      ...rest.sort(sortFn),
    ]
  }

  const filtered = activeSpec
    ? sortedByPriority(universities.filter(u =>
        u.programDetails?.[program]?.specs?.some(s => normalizeSpec(s) === activeSpec)
      ))
    : sortedByPriority(universities)

  // ── Deduplicate + normalize specs ────────────────────────────
  const uniqueSpecs = Array.from(new Set(allSpecs.map(normalizeSpec)))
  const specGroups = groupSpecs(uniqueSpecs)

  // ── Sticky nav active section detection ──────────────────────
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    universities:    useRef<HTMLDivElement>(null),
    specialisations: useRef<HTMLDivElement>(null),
    fees:            useRef<HTMLDivElement>(null),
    reviews:         useRef<HTMLDivElement>(null),
  }

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    Object.values(sectionRefs).forEach(ref => { if (ref.current) obs.observe(ref.current) })
    return () => obs.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const NAV_ITEMS = [
    { id: 'universities',    label: 'Universities' },
    { id: 'specialisations', label: 'Specialisations' },
    { id: 'fees',            label: 'Fees' },
    { id: 'reviews',         label: 'Reviews' },
  ]

  return (
    <>
      {/* ── Sticky Section Nav ────────────────────────────────── */}
      <div className="sticky top-[57px] z-40 mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-white border-b border-border shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: activeSection === item.id ? 'var(--navy)' : 'transparent',
                color: activeSection === item.id ? '#fff' : 'var(--ink-2)',
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setEnquiryOpen(true)}
            className="ml-auto shrink-0 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
            style={{ background: 'var(--amber)', color: '#fff' }}
          >
            Talk to an Advisor
          </button>
        </div>
      </div>

      {/* ── Specialisations ───────────────────────────────────── */}
      <div id="specialisations" ref={sectionRefs.specialisations} className="mt-10 scroll-mt-28">
        <div className="section-title mb-4">Popular {program} Specialisations</div>

        {/* Accordion — one row per category, expand to see specs */}
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {/* "All" reset row */}
          <button
            onClick={() => setActiveSpec(null)}
            className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
            style={{
              background: !activeSpec ? 'rgba(200,129,26,0.07)' : '#fff',
              color: !activeSpec ? 'var(--navy)' : 'var(--ink-2)',
            }}
          >
            <span className="text-sm font-bold">All {program}</span>
            {!activeSpec && <span className="text-[10px] font-bold text-amber-text uppercase tracking-wider">Active</span>}
          </button>

          {specGroups.map(({ group, items }) => {
            const isOpen = openGroups.has(group)
            const isExpanded = expandedGroups.has(group)
            const MAX = 8
            const visible = isExpanded ? items : items.slice(0, MAX)
            const hasActive = items.some(s => normalizeSpec(s) === activeSpec)
            return (
              <div key={group}>
                {/* Accordion header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-1"
                  style={{ background: hasActive ? 'rgba(200,129,26,0.04)' : undefined }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-ink-3">{group}</span>
                    {hasActive && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--amber)', color: '#fff' }}>
                        {activeSpec}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-ink-3">{items.length}</span>
                    <span className="text-ink-3 text-xs" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
                  </div>
                </button>

                {/* Spec pills — shown only when open */}
                {isOpen && (
                  <div className="px-4 pb-3 pt-1 bg-surface-1/50">
                    <div className="flex flex-wrap gap-1.5">
                      {visible.map(spec => {
                        const norm = normalizeSpec(spec)
                        const active = activeSpec === norm
                        return (
                          <button
                            key={spec}
                            onClick={() => setActiveSpec(active ? null : norm)}
                            className="px-3 py-1 rounded-full text-[11px] font-medium border transition-all"
                            style={{
                              borderColor: active ? 'var(--amber)' : 'var(--border)',
                              background: active ? 'var(--amber)' : '#fff',
                              color: active ? '#fff' : 'var(--ink-2)',
                            }}
                          >
                            {spec}
                          </button>
                        )
                      })}
                    </div>
                    {items.length > MAX && (
                      <button
                        onClick={() => toggleExpand(group)}
                        className="mt-2 text-[11px] font-bold text-amber-text hover:underline"
                      >
                        {isExpanded ? '▲ Show less' : `▼ +${items.length - MAX} more`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── University List ───────────────────────────────────── */}
      <div id="universities" ref={sectionRefs.universities} className="mt-10 scroll-mt-28">
        <div className="flex items-center justify-between mb-5">
          <div className="section-title">
            {activeSpec ? `${activeSpec} Universities` : `All ${program} Universities`}
            <span className="text-sm font-normal text-ink-3 ml-2">({filtered.length})</span>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-border">
            <button
              onClick={() => setSortBy('nirf')}
              className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
              style={{ background: sortBy === 'nirf' ? 'var(--navy)' : 'transparent', color: sortBy === 'nirf' ? '#fff' : 'var(--ink-3)' }}
            >
              Ranking
            </button>
            <button
              onClick={() => setSortBy('fees')}
              className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
              style={{ background: sortBy === 'fees' ? 'var(--navy)' : 'transparent', color: sortBy === 'fees' ? '#fff' : 'var(--ink-3)' }}
            >
              Lowest Fee
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((u, idx) => (
            <div key={u.id} className="card p-4 md:p-5 group hover:border-amber/40 transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-16 h-16 shrink-0 bg-white rounded-xl p-1.5 border border-border flex items-center justify-center overflow-hidden">
                  {u.logo
                    ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain"
                        onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; const p = t.parentElement; if (p) { p.style.background = u.color; p.innerHTML = `<span style="color:#fff;font-weight:800;font-size:16px;">${(u.abbr || u.name).slice(0, 2).toUpperCase()}</span>` } }} />
                    : <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, background: u.color, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>{(u.abbr || u.name).slice(0, 2).toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-amber-text uppercase tracking-wider">{u.naac} Accredited</span>
                    {u.nirf < 200 && <span className="text-xs text-ink-3">· NIRF #{u.nirf}</span>}
                    {DUAL_SPEC_IDS.includes(u.id) && (
                      <span style={{ background: '#0D9488', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                        Dual Spec ✓
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-navy group-hover:text-amber-text transition-colors leading-tight">
                    {u.name}
                  </h3>
                  {u.highlight && (
                    <div className="mt-1 text-[11px] text-ink-3 font-medium">{u.highlight}</div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-amber" />
                      <span>{u.programDetails?.[program]?.specs?.length || 0} Specialisations</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-amber" />
                      <span>From {formatFee(u.feeMin)}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex sm:flex-col justify-start gap-2 sm:justify-center">
                  <Link
                    href={`/universities/${u.id}/${programSlug}`}
                    className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy/90 text-center transition-all whitespace-nowrap"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setEnquiryOpen(true)}
                    className="text-xs font-bold text-amber-text hover:underline whitespace-nowrap"
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fees Section ─────────────────────────────────────── */}
      <div id="fees" ref={sectionRefs.fees} className="mt-12 scroll-mt-28">
        <div className="section-title mb-5">Fee Comparison</div>
        <div className="card p-5 overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 text-xs font-bold text-ink-3 uppercase tracking-wider">University</th>
                <th className="text-right pb-3 text-xs font-bold text-ink-3 uppercase tracking-wider">Total Fees</th>
                <th className="text-right pb-3 text-xs font-bold text-ink-3 uppercase tracking-wider">EMI/month</th>
                <th className="text-right pb-3 text-xs font-bold text-ink-3 uppercase tracking-wider">Specs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map(u => (
                <tr key={u.id} className="border-b border-border-light hover:bg-surface-1 transition-colors">
                  <td className="py-3 font-semibold text-navy">{u.name}</td>
                  <td className="py-3 text-right font-bold text-amber-text">{formatFee(u.feeMin)}–{formatFee(u.feeMax)}</td>
                  <td className="py-3 text-right text-ink-2">₹{u.emiFrom.toLocaleString()}</td>
                  <td className="py-3 text-right text-ink-3">{u.programDetails?.[program]?.specs?.length || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Reviews Section ──────────────────────────────────── */}
      <div id="reviews" ref={sectionRefs.reviews} className="mt-12 scroll-mt-28">
        <div className="section-title mb-5">Student Reviews & Ratings</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.slice(0, 4).map(u => (
            <div key={u.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: u.color }}>
                  {(u.abbr || u.name).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-navy text-sm leading-tight">{u.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= 4 ? '#F59E0B' : '#CBD5E1', fontSize: 14 }}>★</span>
                    ))}
                    <span className="text-xs text-ink-3 ml-1">4.0/5</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">
                {u.highlight} · {cleanCareerOutcome(u.programDetails?.[program]?.careerOutcome || '') || `Strong placement assistance for ${program} graduates.`}
              </p>
              <Link href={`/universities/${u.id}/${programSlug}`} className="text-xs font-bold text-amber-text mt-3 inline-block hover:underline">
                Read Full Review →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} defaultProgram={program} />
    </>
  )
}
