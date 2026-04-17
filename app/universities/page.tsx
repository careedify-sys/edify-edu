'use client'
import { getSortRank } from '@/lib/data-slim'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim as formatFee } from '@/lib/data-slim'
import UniversityCard from '@/components/UniversityCard'
import type { Program } from '@/lib/data'

const PROGRAMS: Program[] = ['MBA', 'MCA', 'BBA', 'BCA', 'B.A', 'B.Com', 'M.A', 'M.Com', 'M.Sc']
const REGIONS = ['North', 'West', 'South', 'East', 'Central']
const NAAC_GRADES = ['A++', 'A+', 'A', 'B++']

export default function UniversitiesPage() {
  const [search,    setSearch]    = useState('')
  const [programs,  setPrograms]  = useState<string[]>([])
  const [regions,   setRegions]   = useState<string[]>([])
  const [naacFilter,setNaacFilter]= useState<string[]>([])
  const [maxFee,    setMaxFee]    = useState(600000)
  const [sort,      setSort]      = useState('nirf')
  const [showFilters,setShowFilters] = useState(false)

  function toggle(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const filtered = useMemo(() => {
    let res = UNIS_SLIM.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.abbr.toLowerCase().includes(search.toLowerCase()) && !u.city.toLowerCase().includes(search.toLowerCase())) return false
      if (programs.length && !programs.some(p => u.programs.includes(p as Program))) return false
      if (regions.length && !regions.includes(u.region)) return false
      if (naacFilter.length && !naacFilter.includes(u.naac)) return false
      if (u.feeMin > maxFee) return false
      return true
    })
    if (sort === 'nirf')    res.sort((a,b) => getSortRank(a) - getSortRank(b))
    else if (sort === 'nirfm') res.sort((a,b) => (a.nirfMgt||999) - (b.nirfMgt||999))
    else if (sort === 'feeAsc')  res.sort((a,b) => a.feeMin - b.feeMin)
    else if (sort === 'feeDesc') res.sort((a,b) => b.feeMax - a.feeMax)
    else if (sort === 'name')    res.sort((a,b) => a.name.localeCompare(b.name))
    return res
  }, [search, programs, regions, naacFilter, maxFee, sort])

  const activeFilters = programs.length + regions.length + naacFilter.length + (maxFee < 600000 ? 1 : 0)

  function reset() {
    setSearch(''); setPrograms([]); setRegions([]); setNaacFilter([])
    setMaxFee(600000); setSort('nirf')
  }

  const Chip = ({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) => (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={{ background: active ? 'var(--navy)':'#fff', color: active ? 'var(--amber-bright)':'var(--ink-2)', border: active ? '1.5px solid #1A2F4E':'1.5px solid #E2E8F4', }}>
      {label}
    </button>
  )

  return (
    <main style={{ minHeight:'100vh', background:'var(--bg)' }}>

      {/* Page header */}
      <header style={{ background:'linear-gradient(160deg,#1A2F4E,#264573)', borderBottom:'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="section-label mb-3" style={{ color:'rgba(245,158,11,0.8)' }}>UGC DEB Approved</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-3"
            style={{ fontFamily:"'Fraunces',serif" }}>
            125+ Best Online Universities India 2026 — UGC DEB Approved
          </h1>
          <p className="text-sm max-w-lg" style={{ color:'rgba(255,255,255,0.5)', lineHeight:'1.7' }}>
            All UGC DEB approved. Sorted by NIRF rank by default. Filter by program, region, NAAC grade and fees.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Search + Sort + Filter toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
            <input type="text" placeholder="Search universities, city..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="search-input w-full pl-10 pr-4 py-3 rounded-xl"
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                <X className="w-4 h-4 text-ink-3" />
              </button>
            )}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="form-input px-4 py-3 rounded-xl cursor-pointer" style={{ minWidth:'200px' }}>
            <option value="nirf">Sort: NIRF Overall Rank</option>
            <option value="nirfm">Sort: NIRF Management Rank</option>
            <option value="feeAsc">Sort: Fees Low → High</option>
            <option value="feeDesc">Sort: Fees High → Low</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: showFilters ? 'var(--navy)':'#fff', color: showFilters ? 'var(--amber-bright)':'var(--ink-2)', border: showFilters ? '1.5px solid #1A2F4E':'1.5px solid #E2E8F4', }}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilters > 0 && <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ background:'var(--amber-bright)', color:'var(--navy)' }}>{activeFilters}</span>}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-5 mb-5 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">

              <div>
                <div className="text-xs font-bold mb-2.5 uppercase tracking-wider text-ink-3">Program</div>
                <div className="flex flex-wrap gap-1.5">
                  {PROGRAMS.map(p => <Chip key={p} label={p} active={programs.includes(p)} onClick={() => toggle(programs, setPrograms, p)} />)}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold mb-2.5 uppercase tracking-wider text-ink-3">Region</div>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map(r => <Chip key={r} label={r} active={regions.includes(r)} onClick={() => toggle(regions, setRegions, r)} />)}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold mb-2.5 uppercase tracking-wider text-ink-3">NAAC Grade</div>
                <div className="flex flex-wrap gap-1.5">
                  {NAAC_GRADES.map(g => <Chip key={g} label={g} active={naacFilter.includes(g)} onClick={() => toggle(naacFilter, setNaacFilter, g)} />)}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold mb-2.5 uppercase tracking-wider text-ink-3">
                  Max Fees: {formatFee(maxFee)}
                </div>
                <input type="range" min={50000} max={600000} step={25000}
                  value={maxFee} onChange={e => setMaxFee(Number(e.target.value))}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-xs mt-1 text-ink-3">
                  <span>₹50K</span><span>₹6L</span>
                </div>
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={reset} className="text-xs font-semibold text-red-600">
                  × Clear all filters ({activeFilters})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color:'var(--ink-2)' }}>
            <span>{filtered.length} universities found</span>
            {activeFilters > 0 && <span className="text-ink-3"> (filtered from {UNIS_SLIM.length})</span>}
          </h2>
          {activeFilters > 0 && (
            <button onClick={reset} className="text-xs font-semibold text-red-600">Clear filters</button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center bg-white">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-semibold mb-2" style={{ color:'var(--navy)' }}>No universities match your filters</p>
            <button onClick={reset} className="text-sm font-semibold text-amber">Clear all filters →</button>
          </div>
        ) : (
          <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 list-none p-0 m-0">
            {filtered.map((u, idx) => (
              <li key={u.id}>
                <UniversityCard u={u} highlightProgram={programs[0]} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
