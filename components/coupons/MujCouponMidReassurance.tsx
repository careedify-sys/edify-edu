'use client'

import { useState } from 'react'
import { CheckCircle2, Phone } from 'lucide-react'
import EnquiryModal from '../EnquiryModal'

const MUJ_COUPON = 'MUJ2026-4K'
const MUJ_DISCOUNT_LABEL = 'Up to Rs 5,000 (Tue/Sat IST)'

const TRUST_BULLETS = [
  "We don't take referral commission from MUJ. Your fees stay yours.",
  "We'll tell you honestly if MUJ isn't right for your goals.",
  "Counsellor confirms latest fees and batch dates before you pay.",
  "Zero pushy follow-up calls. You control the conversation.",
]

export default function MujCouponMidReassurance() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section
        className="rounded-2xl my-8 overflow-hidden"
        style={{
          background: '#F7F9FC',
          border: '1px solid rgba(212,146,42,0.25)',
        }}
      >
        <div style={{ height: 2, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
        <div className="p-5 sm:p-6">
          <h3 className="font-bold leading-snug mb-3" style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.25rem)', color: '#0B1D35' }}>
            Why claim this through edifyedu.in?
          </h3>

          <ul className="space-y-2.5 mb-5">
            {TRUST_BULLETS.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: '#3B5068' }}>
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen(true)}
            data-cta="muj_coupon_mid_counsellor"
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
          >
            <Phone size={14} />
            Get Counsellor Callback
          </button>
        </div>
      </section>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        universityName="Manipal University Jaipur (MUJ) Online"
        universityId="manipal-university-jaipur-online"
        defaultProgram="MBA"
        couponCode={MUJ_COUPON}
        couponDiscount={MUJ_DISCOUNT_LABEL}
        sourcePage="muj_coupon_mid_counsellor"
      />
    </>
  )
}
