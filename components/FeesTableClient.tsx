'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import feesData from '@/data/fees-hub-data.json'

type University = (typeof feesData)[number]

const NAAC_ORDER: Record<string, number> = { 'A++': 0, 'A+': 1, 'A': 2, 'B++': 3, 'B+': 4 }
const ALL_PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'M.Com', 'MA', 'MSc', 'BA']
const ALL_NAAC = ['A++', 'A+', 'A']
const ALL_REGIONS = ['North', 'South', 'East', 'West', 'Central']

function NaacBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    'A++': 'bg-emerald-100 text-emerald-800',
    'A+': 'bg-blue-100 text-blue-800',
    'A': 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${colors[grade] ?? 'bg-gray-100 text-gray-700'}`}>
      {grade}
    </span>
  )
}

type Sort = 'fee-asc' | 'fee-desc' | 'nirf' | 'naac'

export default function FeesTableClient() {
  const [prog, setProg] = useState('All')
  const [naacFilter, setNaacFilter] = useState('All')
  const [region, setRegion] = useState('All')
  const [sort, setSort] = useState<Sort>('fee-asc')

  const filtered = useMemo(() => {
    let rows = feesData as University[]
    if (prog !== 'All') rows = rows.filter(u => u.programs.includes(prog))
    if (naacFilter !== 'All') rows = rows.filter(u => u.naac === naacFilter)
    if (region !== 'All') rows = rows.filter(u => u.region === region)
    return [...rows].sort((a, b) => {
      if (sort === 'fee-asc') return a.feeMin - b.feeMin
      if (sort === 'fee-desc') return b.feeMax - a.feeMax
      if (sort === 'naac') return (NAAC_ORDER[a.naac] ?? 9) - (NAAC_ORDER[b.naac] ?? 9)
      // nirf: treat 999 as last
      const an = a.nirf >= 999 ? 9999 : a.nirf
      const bn = b.nirf >= 999 ? 9999 : b.nirf
      return an - bn
    })
  }, [prog, naacFilter, region, sort])

  function SortBtn({ label, value }: { label: string; value: Sort }) {
    const active = sort === value
    return (
      <button
        onClick={() => setSort(value)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
          active ? 'bg-navy text-white border-navy' : 'bg-white text-ink-2 border-border hover:border-navy'
        }`}
      >
        {label}
        {active && (sort === 'fee-asc' ? <ChevronUp size={12} className="inline ml-0.5" /> : <ChevronDown size={12} className="inline ml-0.5" />)}
      </button>
    )
  }

  function FilterChips({
    label,
    options,
    value,
    onChange,
  }: {
    label: string
    options: string[]
    value: string
    onChange: (v: string) => void
  }) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-ink-3 shrink-0">{label}:</span>
        {['All', ...options].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              value === opt
                ? 'bg-amber text-white border-amber'
                : 'bg-white text-ink-2 border-border hover:border-amber'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2.5">
          <FilterChips label="Program" options={ALL_PROGRAMS} value={prog} onChange={setProg} />
          <div className="flex flex-wrap gap-4">
            <FilterChips label="NAAC" options={ALL_NAAC} value={naacFilter} onChange={setNaacFilter} />
            <FilterChips label="Region" options={ALL_REGIONS} value={region} onChange={setRegion} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-ink-3 shrink-0">Sort:</span>
            <SortBtn label="Fee: Low to High" value="fee-asc" />
            <SortBtn label="Fee: High to Low" value="fee-desc" />
            <SortBtn label="NIRF Rank" value="nirf" />
            <SortBtn label="NAAC Grade" value="naac" />
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-ink-3">
        Showing <strong className="text-navy">{filtered.length}</strong> universities
      </div>

      {/* Desktop table */}
      <div className="max-w-7xl mx-auto px-4 hidden md:block">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-navy">University</th>
                <th className="text-center px-3 py-3 font-semibold text-navy w-16">NAAC</th>
                <th className="text-center px-3 py-3 font-semibold text-navy w-20">NIRF</th>
                <th className="text-left px-3 py-3 font-semibold text-navy">Programs</th>
                <th className="text-right px-3 py-3 font-semibold text-navy w-36">Total Fee</th>
                <th className="text-right px-3 py-3 font-semibold text-navy w-24">EMI from</th>
                <th className="px-3 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-gray-50/40'
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/universities/${u.id}`} className="font-semibold text-navy hover:text-amber transition-colors leading-snug">
                      {u.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <NaacBadge grade={u.naac} />
                  </td>
                  <td className="px-3 py-3 text-center text-ink-2 text-xs">
                    {u.nirf < 999 ? `#${u.nirf}` : '—'}
                    {u.nirfMgt && u.nirfMgt < 999 ? (
                      <div className="text-ink-3 text-[10px]">Mgt #{u.nirfMgt}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.programs.slice(0, 4).map(p => (
                        <span key={p} className="bg-surface-2 text-ink-2 text-[11px] px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                      {u.programs.length > 4 && (
                        <span className="text-ink-3 text-[11px]">+{u.programs.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-navy">{u.feeStr}</td>
                  <td className="px-3 py-3 text-right text-ink-2">{u.emiStr}</td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/universities/${u.id}`}
                      className="inline-flex items-center gap-1 text-amber text-xs font-semibold hover:underline"
                    >
                      View <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-ink-3">No universities match the selected filters.</div>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="max-w-7xl mx-auto px-4 md:hidden space-y-3 pb-8">
        {filtered.map(u => (
          <div key={u.id} className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link href={`/universities/${u.id}`} className="font-semibold text-navy text-sm leading-snug hover:text-amber transition-colors">
                {u.name}
              </Link>
              <NaacBadge grade={u.naac} />
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {u.programs.map(p => (
                <span key={p} className="bg-surface-2 text-ink-2 text-[11px] px-1.5 py-0.5 rounded">{p}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-bold text-navy">{u.feeStr}</div>
                <div className="text-xs text-ink-3">EMI from {u.emiStr}</div>
              </div>
              <div className="text-right">
                {u.nirf < 999 && <div className="text-xs text-ink-2">NIRF #{u.nirf}</div>}
                <Link
                  href={`/universities/${u.id}`}
                  className="mt-1 inline-flex items-center gap-1 text-amber text-xs font-semibold hover:underline"
                >
                  View details <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink-3">No universities match the selected filters.</div>
        )}
      </div>
    </div>
  )
}
