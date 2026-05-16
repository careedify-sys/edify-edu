'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import EnquiryModal from '../EnquiryModal'

export default function MujVerdictTop() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        className="rounded-2xl mb-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0B1D35 0%, #142540 100%)',
          border: '1px solid rgba(212,146,42,0.3)',
          boxShadow: '0 8px 32px rgba(11,29,53,0.15)',
        }}
      >
        <div style={{ height: 3, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.18)' }}
            >
              <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
            </div>
            <div className="min-w-0">
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: '#22c55e' }}
              >
                Verified
              </div>
              <h2 className="font-bold text-white leading-tight mb-1.5" style={{ fontSize: 'clamp(1rem, 2.6vw, 1.25rem)' }}>
                Manipal University Jaipur is UGC-DEB approved and 100% legitimate
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Considering MUJ Online for your degree?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            <Link
              href="/coupons/manipal-jaipur-online-mba-discount-coupon-2026"
              data-cta="muj_blog_verdict_top_discount"
              className="text-center px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold no-underline transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
            >
              💰 See July 2026 Discount
            </Link>
            <Link
              href="/compare?a=manipal-university-jaipur-online"
              data-cta="muj_blog_verdict_top_compare"
              className="text-center px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold no-underline transition-colors hover:bg-white/[0.13]"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              📊 Compare MUJ vs Others
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              data-cta="muj_blog_verdict_top_counsellor"
              className="text-center px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold cursor-pointer transition-colors hover:bg-white/[0.13]"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              📞 Talk to Counsellor (Free)
            </button>
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        universityName="Manipal University Jaipur Online"
        universityId="manipal-university-jaipur-online"
        defaultProgram="MBA"
        sourcePage="muj_blog_verdict_top"
      />
    </>
  )
}
