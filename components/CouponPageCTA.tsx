'use client'

import { useState } from 'react'
import { Tag, CheckCircle2 } from 'lucide-react'
import EnquiryModal from './EnquiryModalDynamic'
import type { CouponPageData } from '@/lib/coupon-pages'
import { TIER_AMOUNTS, getTodaysBonus } from '@/lib/coupons'
import CouponCountdown from './CouponCountdown'

export default function CouponPageCTA({ page }: { page: CouponPageData }) {
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  if (page.couponCode === 'N/A') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center mb-8">
        <Tag className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">No coupon needed - {page.shortName} has the lowest fee</h3>
        <p className="text-sm text-slate-500 mb-4">{page.shortName} at {page.totalFee} is already the most affordable online MBA from a NAAC {page.naac} university. Apply directly on {page.officialUrl}.</p>
        <a href={`https://${page.officialUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors no-underline">
          Apply on {page.officialUrl}
        </a>
      </div>
    )
  }

  const tierMax = TIER_AMOUNTS[page.tier].max
  const tierBase = TIER_AMOUNTS[page.tier].base
  const liveAmount = getTodaysBonus(page.tier).amount

  return (
    <>
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6 sm:p-8 text-center mb-8">
        {revealed ? (
          <>
            <div className="inline-flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">Discount confirmed for you</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
              Rs {liveAmount.toLocaleString('en-IN')} saved on your fees
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Your coupon code is unlocked. Mention <strong>{page.couponCode}</strong> on your enrollment call and the discount is reflected in your invoice before payment.
            </p>
            <div className="inline-flex items-center gap-3 bg-white border-2 border-dashed border-amber-400 rounded-xl px-6 py-3 mb-4">
              <Tag className="w-5 h-5 text-amber-500" />
              <span className="font-mono font-extrabold text-amber-700 text-xl tracking-widest">{page.couponCode}</span>
            </div>
            <div className="flex justify-center mb-4">
              <CouponCountdown tier={page.tier} variant="inline" />
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z"/>
              </svg>
              Speak to Admission Desk Now
            </button>
            <p className="text-xs text-slate-500 mt-3">Free call. No spam. Our admission desk applies the discount during enrollment.</p>
          </>
        ) : (
          <>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
              Verified Discount Coupon - {page.shortName} Online MBA {new Date().getFullYear()}
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Up to Rs {tierMax.toLocaleString('en-IN')} off your fees
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Rs {tierMax.toLocaleString('en-IN')} on Tuesday and Saturday in IST, Rs {tierBase.toLocaleString('en-IN')} on other days. Grab the coupon before today&apos;s window closes.
            </p>
            <div className="inline-flex items-center gap-3 bg-white border-2 border-dashed border-amber-400 rounded-xl px-6 py-3 mb-4">
              <Tag className="w-5 h-5 text-amber-500" />
              <span className="font-mono font-extrabold text-amber-700 text-xl tracking-widest">
                {page.couponCode.slice(0, Math.ceil(page.couponCode.length * 0.6)) + '••••'}
              </span>
            </div>
            <div className="flex justify-center mb-4">
              <CouponCountdown tier={page.tier} variant="inline" />
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Fill a 30-second form to reveal the code. Our admission desk will confirm today&apos;s active discount amount.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z"/>
              </svg>
              Grab This Discount Coupon
            </button>
            <p className="text-xs text-slate-500 mt-3">Free. No spam. Coupon applied at enrollment by our admission desk.</p>
          </>
        )}
      </div>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setRevealed(true)}
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
