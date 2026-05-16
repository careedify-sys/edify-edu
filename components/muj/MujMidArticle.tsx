'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import EnquiryModal from '../EnquiryModal'

const COMPARISONS = [
  {
    href: '/compare?a=manipal-university-jaipur-online&b=lovely-professional-university-online',
    title: 'MUJ vs LPU Online',
    desc: 'Which is better for working professionals?',
    slug: 'lpu',
  },
  {
    href: '/compare?a=manipal-university-jaipur-online&b=amity-university-online',
    title: 'MUJ vs Amity Online',
    desc: 'Fees, placement, and recognition compared',
    slug: 'amity',
  },
  {
    href: '/compare?a=manipal-university-jaipur-online&b=chandigarh-university-online',
    title: 'MUJ vs Chandigarh University',
    desc: 'Specialisations and student support',
    slug: 'cu',
  },
]

export default function MujMidArticle() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        className="rounded-2xl my-7 overflow-hidden"
        style={{
          background: '#F7F9FC',
          border: '1px solid rgba(212,146,42,0.25)',
        }}
      >
        <div style={{ height: 2, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
        <div className="p-5 sm:p-6">
          <h3 className="font-bold leading-snug mb-2" style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.25rem)', color: '#0B1D35' }}>
            Now that you know MUJ Online is legit. The real question is whether it's the right fit for you.
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3B5068' }}>
            Here's how MUJ stacks up against other Tier-2 online universities:
          </p>

          <div className="space-y-2 mb-5">
            {COMPARISONS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                data-cta={`muj_blog_mid_compare_${c.slug}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline transition-colors hover:bg-white"
                style={{ background: '#fff', border: '1px solid #E2E8F4' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: '#0B1D35' }}>{c.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#64788A' }}>{c.desc}</div>
                </div>
                <ArrowRight size={16} className="shrink-0" style={{ color: '#c9922a' }} />
              </Link>
            ))}
          </div>

          <div
            className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ background: 'linear-gradient(135deg,#0B1D35 0%,#142540 100%)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white mb-0.5">Still confused?</div>
              <div className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Get a free, unbiased comparison report tailored to your profile and career goals.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              data-cta="muj_blog_mid_compare_report"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-opacity hover:opacity-90 cursor-pointer shrink-0"
              style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
            >
              <FileText size={14} />
              Get My Free Comparison Report
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
        sourcePage="muj_blog_mid_compare_report"
      />
    </>
  )
}
