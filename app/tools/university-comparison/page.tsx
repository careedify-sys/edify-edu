'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Filter, SortAsc, CheckCircle, XCircle } from 'lucide-react'
import { UNIS_SLIM } from '@/lib/data-slim'
import type { Program } from '@/lib/data-client'

const PROGRAMS: Program[] = ['MBA', 'MCA', 'BBA', 'BCA', 'M.A', 'M.Com', 'B.A', 'B.Com']

export default function UniversityComparisonPage() {
  const [search, setSearch] = useState('')
  const [program, setProgram] = useState<Program>('MBA')
  const [sortBy, setSortBy] = useState<'nirf' | 'fees' | 'name'>('nirf')
  const [maxFee, setMaxFee] = useState(500000)
  const [naacFilter, setNaacFilter] = useState<string[]>([])

  const filtered = useMemo(() => {
    return UNIS_SLIM
      .filter(u => {
        if (!u.programs.includes(program)) return false
        if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false
        if (u.feeMin > maxFee) return false
        if (naacFilter.length > 0 && !naacFilter.some(n => u.naac.includes(n))) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'nirf') return a.nirf - b.nirf
        if (sortBy === 'fees') return a.feeMin - b.feeMin
        return a.name.localeCompare(b.name)
      })
  }, [search, program, sortBy, maxFee, naacFilter])

  return (
    <div className="min-h-screen bg-surface">
      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'University Comparison Tool',
        description: 'Compare online universities in India by NIRF rank, fees, NAAC grade. Filter MBA, MCA, BBA programs.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web'
      })}} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2">
            <Link href="/" className="hover:text-amber">Home</Link>
            <ChevronRight size={12} />
            <Link href="/tools" className="hover:text-amber">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-amber font-semibold">University Comparison</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy mb-2">
            Compare Online Universities in India
          </h1>
          <p className="text-ink-2">
            Filter and compare {UNIS_SLIM.length}+ UGC-DEB approved universities by NIRF rank, fees, and NAAC grade.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-ink-3 block mb-1.5">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                <input
                  type="text"
                  placeholder="Search university..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-2 text-sm"
                />
              </div>
            </div>

            {/* Program */}
            <div>
              <label className="text-xs font-semibold text-ink-3 block mb-1.5">Program</label>
              <select
                value={program}
                onChange={e => setProgram(e.target.value as Program)}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-sm font-medium"
              >
                {PROGRAMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-semibold text-ink-3 block mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'nirf' | 'fees' | 'name')}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-sm font-medium"
              >
                <option value="nirf">NIRF Rank</option>
                <option value="fees">Lowest Fees</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Max Fee */}
            <div className="min-w-[180px]">
              <label className="text-xs font-semibold text-ink-3 block mb-1.5">
                Max Fee: ₹{(maxFee/100000).toFixed(1)}L
              </label>
              <input
                type="range"
                min="50000"
                max="500000"
                step="25000"
                value={maxFee}
                onChange={e => setMaxFee(Number(e.target.value))}
                className="w-full h-2 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-amber"
              />
            </div>

            {/* NAAC Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-3 block mb-1.5">NAAC</label>
              <div className="flex gap-1">
                {['A++', 'A+', 'A'].map(grade => (
                  <button
                    key={grade}
                    onClick={() => {
                      setNaacFilter(prev => 
                        prev.includes(grade) 
                          ? prev.filter(g => g !== grade)
                          : [...prev, grade]
                      )
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      naacFilter.includes(grade)
                        ? 'bg-amber text-white'
                        : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-ink-2">
            Showing <strong>{filtered.length}</strong> universities offering <strong>{program}</strong>
          </p>
          <Link href="/compare" className="text-sm text-amber font-semibold">
            Compare side-by-side →
          </Link>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-2 text-xs font-semibold text-ink-3 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">University</th>
                  <th className="px-4 py-3 text-center">NIRF</th>
                  <th className="px-4 py-3 text-center">NAAC</th>
                  <th className="px-4 py-3 text-right">Fees</th>
                  <th className="px-4 py-3 text-center">Location</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.slice(0, 50).map((u, idx) => (
                  <tr key={u.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        idx < 3 ? 'bg-amber text-white' : 'bg-surface-2 text-ink-3'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy text-sm">{u.name}</div>
                      <div className="text-xs text-ink-3">{u.programs.slice(0, 4).join(', ')}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.nirf < 200 ? (
                        <span className="font-bold text-sage">#{u.nirf}</span>
                      ) : (
                        <span className="text-ink-3 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.naac.includes('A++') ? 'bg-green-100 text-green-700' :
                        u.naac.includes('A+') ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {u.naac}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-navy text-sm">
                        ₹{(u.feeMin/1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-ink-3">onwards</div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-ink-2">
                      {u.city}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/universities/${u.id}`}
                        className="px-3 py-1.5 rounded-lg bg-amber/10 text-amber text-xs font-semibold hover:bg-amber hover:text-white transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 bg-white rounded-2xl border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-navy mb-4">
            How to Choose the Best Online University in India
          </h2>
          <div className="prose prose-sm max-w-none text-ink-2">
            <p>
              Choosing the right online university is crucial for your career. Here are the key factors 
              to consider when comparing universities:
            </p>
            <h3 className="text-navy font-semibold mt-6 mb-2">1. NIRF Ranking</h3>
            <p>
              NIRF (National Institutional Ranking Framework) is the official ranking by the Ministry of Education. 
              Universities in the top 50 typically have better placement records and industry recognition.
            </p>
            <h3 className="text-navy font-semibold mt-6 mb-2">2. NAAC Accreditation</h3>
            <p>
              NAAC grades range from A++ (highest) to C. A++ and A+ universities have rigorous quality standards 
              and are preferred by employers.
            </p>
            <h3 className="text-navy font-semibold mt-6 mb-2">3. UGC-DEB Approval</h3>
            <p>
              Only UGC-DEB approved universities can offer valid online degrees. Always verify approval status 
              at ugc.ac.in before enrolling.
            </p>
            <h3 className="text-navy font-semibold mt-6 mb-2">4. Fee Structure</h3>
            <p>
              Online {program} fees in India range from ₹40,000 to ₹4,00,000. Higher fees don't always mean 
              better quality. Compare the fee-to-ranking ratio for best value.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
