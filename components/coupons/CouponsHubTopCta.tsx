'use client'

import { useState } from 'react'
import { ArrowRight, BadgeCheck, Compass } from 'lucide-react'
import EnquiryModal from '../EnquiryModal'

const TRUST_BULLETS = [
  'All discounts verified with universities',
  "Zero commission. We don't profit from your enrolment",
  'Honest advice on which university actually fits you',
]

export default function CouponsHubTopCta() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section
        className="max-w-4xl mx-auto px-4 sm:px-6"
        aria-labelledby="coupons-hub-top-cta-heading"
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B1D35 0%, #142540 100%)',
            border: '1px solid rgba(212,146,42,0.3)',
            boxShadow: '0 8px 32px rgba(11,29,53,0.2)',
          }}
        >
          <div style={{ height: 3, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
          <div className="p-6 sm:p-7">
            <div className="flex items-start gap-3 mb-4">
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,146,42,0.15)' }}
              >
                <Compass size={20} style={{ color: '#e0a93a' }} />
              </div>
              <div className="min-w-0">
                <h2
                  id="coupons-hub-top-cta-heading"
                  className="font-bold text-white leading-tight mb-2"
                  style={{ fontSize: 'clamp(1.15rem, 2.8vw, 1.4rem)' }}
                >
                  Not sure which university discount is right for you?
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Tell us your programme and budget. We'll show you the best 3 coupons matching your profile, plus tell you honestly whether each university is worth it.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              data-cta="coupons_hub_top_shortlist"
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-opacity hover:opacity-90 mb-5"
              style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
            >
              Get Personalised Coupon Shortlist
              <ArrowRight size={14} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {TRUST_BULLETS.map((t) => (
                <div
                  key={t}
                  className="flex items-start gap-2 text-xs sm:text-[13px] leading-snug"
                  style={{ color: 'rgba(255,255,255,0.78)' }}
                >
                  <BadgeCheck size={14} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultProgram="MBA"
        sourcePage="coupons_hub_top_shortlist"
      />
    </>
  )
}
