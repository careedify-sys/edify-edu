'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, ArrowRight, Scale } from 'lucide-react'
import EnquiryModal from '../EnquiryModal'

const MUJ_COUPON = 'MUJ2026-4K'
const MUJ_DISCOUNT_LABEL = 'Up to Rs 5,000 (Tue/Sat IST)'

export default function MujCouponTopUrgency() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="rounded-2xl my-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0B1D35 0%, #142540 100%)',
          border: '1px solid rgba(212,146,42,0.3)',
          boxShadow: '0 8px 32px rgba(11,29,53,0.2)',
        }}
      >
        <div style={{ height: 3, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl shrink-0 leading-none mt-0.5">🎯</div>
            <div className="min-w-0">
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: '#e0a93a' }}
              >
                <Clock size={11} className="inline -mt-0.5 mr-1" />
                Limited Window
              </div>
              <h2 className="font-bold text-white leading-tight mb-1.5" style={{ fontSize: 'clamp(1.05rem, 2.6vw, 1.3rem)' }}>
                Claim this discount before MUJ closes July 2026 admissions
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Get the coupon applied to your enrolment plus a free counselling call to confirm MUJ is your best fit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-cta="muj_coupon_top_claim"
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
            >
              Get Coupon Applied Free
              <ArrowRight size={14} />
            </button>
            <Link
              href="/compare?a=manipal-university-jaipur-online"
              data-cta="muj_coupon_top_compare"
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold no-underline transition-colors hover:bg-white/[0.13]"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Scale size={14} />
              Compare MUJ vs Other Universities First
            </Link>
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        universityName="Manipal University Jaipur (MUJ) Online"
        universityId="manipal-university-jaipur-online"
        defaultProgram="MBA"
        couponCode={MUJ_COUPON}
        couponDiscount={MUJ_DISCOUNT_LABEL}
        sourcePage="muj_coupon_top_claim"
      />
    </>
  )
}
