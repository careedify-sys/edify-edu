'use client'

import { useState } from 'react'
import EnquiryModal from './EnquiryModalDynamic'

type Variant = 'compare' | 'counsel' | 'verify' | 'shortlist'

const VARIANTS: Record<Variant, {
  eyebrow: string
  heading: string
  body: string
  buttonLabel: string
  source: string
}> = {
  compare: {
    eyebrow: 'Free side-by-side comparison',
    heading: 'Comparing this against 3-4 other options?',
    body: 'We will send you a side-by-side comparison covering fees, accreditation, placement data, and student reviews. Zero commission, zero sales pitch.',
    buttonLabel: 'Get My Free Comparison',
    source: 'blog-inline-compare',
  },
  counsel: {
    eyebrow: 'Free 15-minute call',
    heading: 'Not sure which university fits your career goal?',
    body: 'Talk to our independent counsellor in a free 15-minute call. We do not earn referral commissions from any university. Advice is purely based on your career goal.',
    buttonLabel: 'Book My Free Call',
    source: 'blog-inline-counsel',
  },
  verify: {
    eyebrow: 'Independent fee check',
    heading: 'Read something here that worried you?',
    body: 'Better to know before you pay 2 lakh. Free 15-minute conversation about your specific career goal. We will not pitch you anyone unless it genuinely fits.',
    buttonLabel: 'Get an Honest Answer',
    source: 'blog-inline-verify',
  },
  shortlist: {
    eyebrow: 'Personalised shortlist',
    heading: 'Want a shortlist built around your profile?',
    body: 'Tell us your work experience, budget, and target role. We will send 3 universities that genuinely fit. Built independently. No paid rankings.',
    buttonLabel: 'Build My Shortlist',
    source: 'blog-inline-shortlist',
  },
}

export default function BlogCTACard({ variant = 'counsel' }: { variant?: Variant }) {
  const [open, setOpen] = useState(false)
  const v = VARIANTS[variant]

  return (
    <>
      <div className="my-10 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-7 sm:p-8 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">
          {v.eyebrow}
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 leading-tight">
          {v.heading}
        </h3>
        <p className="text-slate-600 text-[15px] leading-relaxed mb-5 max-w-2xl">
          {v.body}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z"/>
          </svg>
          {v.buttonLabel}
        </button>
        <p className="text-[12px] text-slate-500 mt-4">
          EdifyEdu earns zero commissions. Independent advice only.
        </p>
      </div>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        sourcePage={v.source}
      />
    </>
  )
}
