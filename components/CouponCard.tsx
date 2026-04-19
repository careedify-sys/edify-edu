import type { Coupon } from '@/lib/coupons'
import Link from 'next/link'
import { Tag, ChevronRight } from 'lucide-react'

interface Props {
  coupon: Coupon | null | undefined
  universityId: string
  program: string
}

export default function CouponCard({ coupon, universityId, program }: Props) {
  const code = coupon?.code || `EDIFY-${universityId.slice(0, 4).toUpperCase()}-${program}`
  const savings = coupon?.savings || 'Ask counsellor for discount'
  const expiry  = coupon?.expiry  || '30 Jun 2026'

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={14} className="text-green-600" />
        <h3 className="text-sm font-bold text-green-800">Save with EdifyEdu Coupon</h3>
      </div>

      {/* Coupon display */}
      <div className="rounded-lg border-2 border-dashed border-green-300 bg-white px-4 py-3 text-center mb-3">
        <div className="text-lg font-black tracking-widest text-green-700 font-mono">{code}</div>
        <div className="text-xs text-green-600 mt-0.5">{savings} · Expires {expiry}</div>
      </div>

      {/* How it works */}
      <div className="space-y-1.5 mb-3">
        {[
          'Submit the counselling form above',
          'Our counsellor calls you within 24h',
          'Apply the coupon code at enrolment',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-green-700">
            <span className="w-4 h-4 rounded-full bg-green-200 text-green-700 text-[9px] font-black flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      <Link
        href="/coupons"
        className="flex items-center justify-between text-xs font-semibold text-green-700 hover:text-green-800 no-underline"
      >
        <span>View all EdifyEdu coupons</span>
        <ChevronRight size={13} />
      </Link>
    </div>
  )
}
