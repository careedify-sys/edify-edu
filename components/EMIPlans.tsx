import type { University, ProgramDetail } from '@/lib/data'
import Link from 'next/link'
import { formatINR } from '@/lib/format'
import { CreditCard } from 'lucide-react'
import { programmeEmiFrom } from '@/lib/seo/display-guards'

interface Props {
  u: University
  pd: ProgramDetail
  program: string
}

export default function EMIPlans({ u, pd, program }: Props) {
  // Don't render EMI section if emiFrom is 0 (uni doesn't offer EMI). The plans
  // divide u.feeMin, the MBA fee, so they are MBA-only too.
  if (programmeEmiFrom(u, program) <= 0) return null

  // A published plan table (feePlans) already carries the university's own
  // instalments and EMI. The fee / 6, 12, 24 grid below is edifyedu.in arithmetic and
  // contradicted it (Alliance 7,250 under a published 8,700 minimum over 20
  // months; JIIT 7,292 beside a published 5,850), so it is skipped there.
  // B3 batch 2 (2026-11-18): the grid is gone for every university. It was
  // u.feeMin / 6, 12 and 24, edifyedu.in arithmetic no university publishes (the
  // Amity, Uttaranchal, Shoolini and Adichunchanagiri sheets each flag it).

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>EMI Plans</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Starting at {formatINR(u.emiFrom)}/month. EMI options available through the university or education lending partners. Confirm interest structure with counsellor.
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
