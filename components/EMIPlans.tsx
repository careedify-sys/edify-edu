import type { University, ProgramDetail } from '@/lib/data'
import Link from 'next/link'
import { formatINR } from '@/lib/format'
import { CreditCard } from 'lucide-react'

interface Props {
  u: University
  pd: ProgramDetail
}

const NBFC_PARTNERS = [
  { name: 'Fibe',       key: 'fibe' },
  { name: 'GrayQuest',  key: 'grayquest' },
  { name: 'Techfino',   key: 'techfino' },
  { name: 'Avanse',     key: 'avanse' },
]

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
        Starting at {formatINR(u.emiFrom)}/month via EdifyEdu-partnered NBFCs: Fibe, GrayQuest, Techfino, and Avanse. No cost EMI available on select credit cards.
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

      {/* NBFC logo strip */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, textAlign: 'center' }}>
          Our lending partners
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {NBFC_PARTNERS.map(nbfc => (
            <div
              key={nbfc.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                background: '#f8fafc',
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
              }}
            >
              <span style={{ fontSize: 14 }}>✓</span>
              {nbfc.name}
            </div>
          ))}
        </div>
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
