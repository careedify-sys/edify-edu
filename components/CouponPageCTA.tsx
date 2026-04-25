'use client'

import { useState } from 'react'
import { Tag } from 'lucide-react'
import EnquiryModal from './EnquiryModalDynamic'
import type { CouponPageData } from '@/lib/coupon-pages'

export default function CouponPageCTA({ page }: { page: CouponPageData }) {
  const [open, setOpen] = useState(false)

  if (page.couponCode === 'N/A') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center mb-8">
        <Tag className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">No coupon needed -- {page.shortName} has the lowest fee</h3>
        <p className="text-sm text-slate-500 mb-4">{page.shortName} at {page.totalFee} is already the most affordable online MBA from a NAAC {page.naac} university. Apply directly on {page.officialUrl}.</p>
        <a href={`https://${page.officialUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors no-underline">
          Apply on {page.officialUrl}
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6 sm:p-8 text-center mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Verified {page.shortName} Coupon Code</div>
        <div className="inline-flex items-center gap-3 bg-white border-2 border-dashed border-amber-400 rounded-xl px-6 py-3 mb-4">
          <Tag className="w-5 h-5 text-amber-500" />
          <span className="font-mono font-extrabold text-amber-700 text-xl tracking-widest">{page.couponCode.slice(0, Math.ceil(page.couponCode.length * 0.6))}••••</span>
        </div>
        <p className="text-sm text-slate-600 mb-4">Fill a 30-second form and our advisor will share the full active code valid for this month.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors text-base"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z"/>
          </svg>
          Reveal Full Coupon Code
        </button>
        <p className="text-xs text-slate-500 mt-3">Free. No spam. Our advisor confirms the discount with {page.shortName} admissions.</p>
      </div>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        universityName={page.universityName}
        universityId={page.universityId}
        defaultProgram="MBA"
        sourcePage={`/coupons/${page.slug}`}
        couponCode={page.couponCode}
        couponDiscount={page.couponDiscount}
      />
    </>
  )
}
