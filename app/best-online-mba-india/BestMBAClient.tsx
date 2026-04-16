'use client'
import { useState } from 'react'
import EnquiryModal from '@/components/EnquiryModalDynamic'

export default function BestMBAClient() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, #0B1D35, #1a3a5c)' }}>
        <h2 className="text-2xl font-bold text-white mb-2">Not Sure Which Online MBA is Right for You?</h2>
        <p className="text-white/60 mb-6 max-w-md mx-auto text-sm leading-relaxed">
          Tell us your budget, target career, and current qualification — our education advisors will shortlist the best fit for you at no cost.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
          Get Free Personalised Advice →
        </button>
        <p className="text-white/40 text-xs mt-3">No spam. No pressure. Just guidance.</p>
      </div>
      <EnquiryModal isOpen={open} onClose={() => setOpen(false)} universityName="Online MBA" universityId="best-online-mba" />
    </>
  )
}
