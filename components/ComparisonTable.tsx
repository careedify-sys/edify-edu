import type { University, Program } from '@/lib/data'
import { getDisplayFee } from '@/lib/fees'
import { formatNirfBadge } from '@/lib/data-slim'
import Link from 'next/link'
import { CheckCircle, XCircle, Minus } from 'lucide-react'

interface Props {
  current: University
  peers: University[]
  program: string
  programSlug: string
}

type Verdict = 'yes' | 'no' | 'mid'

function cell(val: Verdict) {
  if (val === 'yes') return <CheckCircle size={14} className="text-green-500 mx-auto" />
  if (val === 'no')  return <XCircle size={14} className="text-red-400 mx-auto" />
  return <Minus size={14} className="text-slate-300 mx-auto" />
}

// Was "#11" from u.nirf on every page, so an MBA comparison showed University
// ranks with no category. Management table first for management programmes.
function nirfCell(uni: University, program: string): string {
  const prefer = /^(mba|bba|pgdm)/i.test(program) ? 'management' : 'university'
  return formatNirfBadge(uni, { style: 'short', prefer }) ?? 'Not ranked'
}

// Was uni.feeMin, which is MBA-led, so BBA and BCA pages compared MBA fees.
function feeCell(uni: University, program: string): string {
  const f = getDisplayFee(uni, program as Program)
  return f.ok && f.compact ? f.compact : 'On request'
}

function naacWeight(naac: string): number {
  const MAP: Record<string, number> = { 'A++': 4, 'A+': 3, 'A': 2, 'B++': 1, 'B+': 0, 'B': -1 }
  return MAP[naac] ?? -2
}

export default function ComparisonTable({ current: u, peers, program, programSlug }: Props) {
  if (!peers.length) return null
  const unis = [u, ...peers.slice(0, 3)]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 overflow-x-auto">
      <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1533' }}>How {u.abbr} Compares</h2>
      <p className="text-sm text-slate-500 mb-5">
        Side-by-side comparison with {peers.slice(0, 3).map(p => p.abbr).join(', ')} for Online {program}. Data sourced from NAAC, NIRF, UGC DEB.
      </p>

      <div className="min-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-slate-500 font-semibold w-32">Metric</th>
              {unis.map((uni, i) => (
                <th key={uni.id} className={`px-3 py-2 text-center font-bold ${i === 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-700'}`}>
                  {i === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      {uni.abbr}
                      <span className="text-[9px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-black">YOU</span>
                    </span>
                  ) : uni.abbr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: `${program} fees`,
                render: (uni: University) => (
                  <td className="px-3 py-2 text-center text-slate-700 font-semibold">
                    {feeCell(uni, program)}
                  </td>
                ),
              },
              {
                label: 'NAAC Grade',
                render: (uni: University) => (
                  <td className={`px-3 py-2 text-center font-bold ${naacWeight(uni.naac) >= 3 ? 'text-green-700' : naacWeight(uni.naac) >= 1 ? 'text-amber-700' : 'text-slate-600'}`}>
                    {""+(uni.naac || '\u2014')}
                  </td>
                ),
              },
              {
                label: 'NIRF Rank',
                render: (uni: University) => (
                  <td className="px-3 py-2 text-center text-slate-600">{nirfCell(uni, program)}</td>
                ),
              },
              {
                label: 'Online Exam',
                render: (uni: University) => (
                  <td className="px-3 py-2 text-center">{cell(uni.examMode === 'Online' || uni.examMode === 'Assignment-based' ? 'yes' : 'mid')}</td>
                ),
              },
              {
                label: 'PSU Eligible',
                render: (uni: University) => (
                  <td className="px-3 py-2 text-center">{cell(uni.psuEligible ? 'yes' : 'no')}</td>
                ),
              },
            ].map(row => (
              <tr key={row.label} className="border-t border-slate-100 even:bg-slate-50">
                <td className="px-3 py-2 text-slate-500">{row.label}</td>
                {unis.map(uni => row.render(uni))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4">
        <Link href="/compare" className="text-sm font-semibold no-underline" style={{ color: '#F4A024' }}>
          Full side-by-side comparison tool →
        </Link>
      </div>
    </section>
  )
}
