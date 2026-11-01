'use client'

// DBA Finder. Filters on budget, immersion, refund-before-start and
// specialisations only. Eligibility is deliberately NOT a filter: the source
// wording is too loose to automate, so each card shows eligibilityText verbatim.
// Results never sit behind the form.
//
// Receives FinderItem props from the server, never data/dba-programmes itself:
// importing that module here would ship the held-back fees in the JS bundle.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import DbaEnquiryForm from './DbaEnquiryForm'

export interface FinderItem {
  slug: string
  name: string
  feeWithImmersion: number | null
  feeWithoutImmersion: number | null
  singleFee: number | null
  eligibilityText: string
  refundPolicyText: string
  refundBeforeStart: boolean
  specialisationCount: number | null
  totalCreditsText: string | null
}

type Immersion = 'either' | 'yes' | 'no'
type YesNo = 'no' | 'yes'

const BUDGETS = [0, 600000, 700000, 800000, 1000000, 1250000]

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

function applicableFee(p: FinderItem, immersion: Immersion): { fee: number; label: string } | null {
  if (immersion === 'yes') {
    if (p.feeWithImmersion != null) return { fee: p.feeWithImmersion, label: 'with immersion' }
    if (p.singleFee != null) return { fee: p.singleFee, label: 'single fee, no immersion split' }
    return null
  }
  if (immersion === 'no') {
    if (p.feeWithoutImmersion != null) return { fee: p.feeWithoutImmersion, label: 'without immersion' }
    if (p.singleFee != null) return { fee: p.singleFee, label: 'single fee, no immersion split' }
    return null
  }
  if (p.singleFee != null) return { fee: p.singleFee, label: 'single fee, no immersion split' }
  if (p.feeWithoutImmersion != null) return { fee: p.feeWithoutImmersion, label: 'lowest, without immersion' }
  return null
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 10,
  border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a',
}

export default function DbaFinder({ items }: { items: FinderItem[] }) {
  const [budget, setBudget] = useState(0)
  const [immersion, setImmersion] = useState<Immersion>('either')
  const [refund, setRefund] = useState<YesNo>('no')
  const [specs, setSpecs] = useState<YesNo>('no')
  const [showForm, setShowForm] = useState(false)

  const { matches, unpriced } = useMemo(() => {
    const filtered = items.filter(p =>
      (refund === 'no' || p.refundBeforeStart) &&
      (specs === 'no' || p.specialisationCount != null),
    )
    const matches: { p: FinderItem; fee: ReturnType<typeof applicableFee> }[] = []
    const unpriced: FinderItem[] = []
    for (const p of filtered) {
      const fee = applicableFee(p, immersion)
      if (!fee) { unpriced.push(p); continue }
      if (budget && fee.fee > budget) continue
      matches.push({ p, fee })
    }
    matches.sort((a, b) => a.fee!.fee - b.fee!.fee)
    return { matches, unpriced }
  }, [items, budget, immersion, refund, specs])

  const shortlist = [...matches.map(m => m.p.name), ...unpriced.map(p => p.name)]
  const filterNote = [
    `Finder: max budget ${budget ? inr(budget) : 'any'}`,
    `immersion ${immersion}`,
    `refund before start required ${refund}`,
    `needs specialisations ${specs}`,
    `shortlist ${shortlist.length ? shortlist.join(', ') : 'none'}`,
  ].join('; ')

  return (
    <div className="rounded-2xl border p-4 sm:p-6 my-6" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>
          Maximum budget
          <select style={selectStyle} value={budget} onChange={e => setBudget(Number(e.target.value))}>
            {BUDGETS.map(b => <option key={b} value={b}>{b ? `Up to ${inr(b)}` : 'Any budget'}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>
          Campus immersion wanted
          <select style={selectStyle} value={immersion} onChange={e => setImmersion(e.target.value as Immersion)}>
            <option value="either">Either</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>
          Refund before start required
          <select style={selectStyle} value={refund} onChange={e => setRefund(e.target.value as YesNo)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>
          Need specialisations
          <select style={selectStyle} value={specs} onChange={e => setSpecs(e.target.value as YesNo)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
      </div>

      <p className="text-sm font-semibold mb-3" style={{ color: '#0f172a' }} aria-live="polite">
        {matches.length + unpriced.length} of {items.length} programmes match
      </p>

      <div className="grid gap-3">
        {matches.map(({ p, fee }) => <ResultCard key={p.slug} p={p} feeLine={`${inr(fee!.fee)} (${fee!.label})`} />)}
        {unpriced.map(p => (
          <ResultCard key={p.slug} p={p} feeLine="Fee not yet confirmed. Talk to our counsellor for the current fee." />
        ))}
        {matches.length + unpriced.length === 0 && (
          <p className="text-sm" style={{ color: '#64748b' }}>
            No programme matches all four filters. Loosen one, or ask our counsellor to look at your case.
          </p>
        )}
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-5 w-full sm:w-auto font-bold rounded-xl px-6 py-3 text-[15px]"
          style={{ background: '#f97316', color: '#ffffff', border: 'none', cursor: 'pointer' }}
        >
          Get this shortlist checked
        </button>
      ) : (
        <DbaEnquiryForm source="dba-finder" extraNote={filterNote} id="dba-finder-form" />
      )}
    </div>
  )
}

function ResultCard({ p, feeLine }: { p: FinderItem; feeLine: string }) {
  return (
    <div className="rounded-xl bg-white border p-4" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <Link href={`/online-dba/${p.slug}`} className="font-bold text-base hover:underline" style={{ color: '#0f172a' }}>
          {p.name}
        </Link>
        <span className="text-sm font-semibold" style={{ color: '#f97316' }}>{feeLine}</span>
      </div>
      <dl className="grid gap-1 text-sm" style={{ color: '#334155' }}>
        <div><dt className="inline font-semibold">Eligibility: </dt><dd className="inline">{p.eligibilityText}</dd></div>
        <div><dt className="inline font-semibold">Refund: </dt><dd className="inline">{p.refundPolicyText}</dd></div>
        {p.specialisationCount != null && (
          <div><dt className="inline font-semibold">Specialisations: </dt><dd className="inline">{p.specialisationCount}</dd></div>
        )}
        {p.totalCreditsText && (
          <div><dt className="inline font-semibold">Credits: </dt><dd className="inline">{p.totalCreditsText}</dd></div>
        )}
      </dl>
    </div>
  )
}
