import type { University, ProgramDetail } from '@/lib/data'
import Link from 'next/link'
import { formatINR } from '@/lib/format'
import { CreditCard } from 'lucide-react'

interface Props {
  u: University
  pd: ProgramDetail
}

export default function EMIPlans({ u, pd }: Props) {
  const totalFeeNum = u.feeMin
  const emi6  = Math.round(totalFeeNum / 6)
  const emi12 = Math.round(totalFeeNum / 12)
  const emi24 = Math.round(totalFeeNum / 24)

  const plans = [
    { label: '6 months', amount: emi6, badge: 'No cost EMI' },
    { label: '12 months', amount: emi12, badge: 'Popular' },
    { label: '24 months', amount: emi24, badge: 'Low monthly' },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>EMI Plans</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Starting at {formatINR(u.emiFrom)}/month. Zero-cost EMI options available directly through the university or education lending partners.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {plans.map(p => (
          <div key={p.label} className="rounded-lg border border-slate-200 p-3 text-center bg-slate-50">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">{p.badge}</div>
            <div className="text-lg font-black text-navy" style={{ color: '#0B1533' }}>{formatINR(p.amount)}</div>
            <div className="text-[11px] text-slate-500">/month · {p.label}</div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-4">
        EMI figures are indicative. Final EMI depends on loan tenure, lender, and credit score. Confirm exact amounts with the counsellor.
      </p>
      <Link
        href="/tools/emi-calculator"
        className="mt-3 inline-flex text-sm font-semibold no-underline"
        style={{ color: '#F4A024' }}
      >
        Calculate your exact EMI →
      </Link>
    </section>
  )
}
