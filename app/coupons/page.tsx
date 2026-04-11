'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, Tag, Clock, Sparkles, BadgePercent, GraduationCap, ChevronRight } from 'lucide-react'
import { COUPONS, getCouponsByProgram, type Coupon } from '@/lib/coupons'
import EnquiryModal from '@/components/EnquiryModal'


type FilterTab = 'All' | 'MBA' | 'MCA'

const TABS: FilterTab[] = ['All', 'MBA', 'MCA']

const PROGRAM_COLOR: Record<string, string> = {
  MBA: 'bg-blue-100 text-blue-700 border-blue-200',
  MCA: 'bg-violet-100 text-violet-700 border-violet-200',
  All: 'bg-amber-100 text-amber-700 border-amber-200',
}

function CouponCard({
  coupon,
  onEnquire,
}: {
  coupon: Coupon
  onEnquire: (coupon: Coupon) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = coupon.code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [coupon.code])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Discount banner */}
      <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 px-5 pt-4 pb-5">
        {coupon.featured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/25 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}
        <div className="flex items-end gap-2">
          <span className="text-5xl font-extrabold text-white leading-none">{coupon.discount}%</span>
          <span className="text-white/80 text-sm font-semibold mb-1">OFF</span>
        </div>
        <p className="text-white/90 text-sm font-medium mt-1">{coupon.savings}</p>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        {/* University + program */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${PROGRAM_COLOR[coupon.program]}`}>
              {coupon.program === 'All' ? 'All Programs' : `Online ${coupon.program}`}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">{coupon.university}</h3>
        </div>

        {/* Coupon code copy box */}
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Coupon Code</p>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between gap-3 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 rounded-xl px-4 py-2.5 transition-all group"
            aria-label={`Copy coupon code ${coupon.code}`}
          >
            <span className="font-mono font-bold text-slate-800 text-sm tracking-widest group-hover:text-amber-700">
              {coupon.code}
            </span>
            <span className="shrink-0">
              {copied ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <Check className="w-4 h-4" /> Copied!
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400 text-xs font-medium group-hover:text-amber-600">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Expiry */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>Valid till <strong className="text-slate-600">{coupon.expiry}</strong></span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onEnquire(coupon)}
          className="w-full flex items-center justify-center gap-2 bg-navy text-white py-3 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors"
          style={{ background: 'var(--navy, #0f172a)' }}
        >
          Apply &amp; Enquire
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  const filtered = activeTab === 'All' ? COUPONS : COUPONS.filter(c => c.program === activeTab || c.program === 'All')

  function handleEnquire(coupon: Coupon) {
    setSelectedCoupon(coupon)
    setModalOpen(true)
  }

  // Sort: featured first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return a.university.localeCompare(b.university)
  })

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #b45309 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            <Tag className="w-3.5 h-3.5" />
            Verified Offers · Updated Apr 2026
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Exclusive Online Degree<br />
            <span className="text-amber-400">Discount Coupons 2026</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Verified offers on <strong className="text-white/90">UGC DEB approved universities</strong>.
            Save up to ₹30,000 on your Online MBA or MCA fee — apply code during your counselling call.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: <BadgePercent className="w-5 h-5" />, label: `${COUPONS.length} Active Coupons` },
              { icon: <GraduationCap className="w-5 h-5" />, label: '13 Universities' },
              { icon: <Sparkles className="w-5 h-5" />, label: 'UGC DEB Approved Only' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 text-amber-300/80 text-sm font-semibold">
                {s.icon}
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter tabs + Grid ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <span className="text-sm text-slate-500 font-medium mr-1 hidden sm:inline">Filter by program:</span>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${
                activeTab === tab
                  ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              {tab === 'All' ? `All (${COUPONS.length})` : `${tab} (${COUPONS.filter(c => c.program === tab || c.program === 'All').length})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No coupons found for this filter.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map(coupon => (
              <CouponCard key={coupon.code} coupon={coupon} onEnquire={handleEnquire} />
            ))}
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">All discounts verified by the Edify team</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apply your coupon code during the counselling call — our advisor will confirm the discount directly
              with the university&apos;s admissions desk. Offers valid for admissions in the current academic session.
              Terms &amp; conditions of each university apply.
            </p>
          </div>
        </div>
      </section>

      {/* ── EnquiryModal ─────────────────────────────────────────────────── */}
      {selectedCoupon && (
        <EnquiryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          universityName={selectedCoupon.university}
          universityId={selectedCoupon.universityId}
          defaultProgram={selectedCoupon.program === 'All' ? '' : selectedCoupon.program}
          sourcePage="/coupons"
          couponCode={selectedCoupon.code}
          couponDiscount={`${selectedCoupon.discount}% off`}
        />
      )}
    </>
  )
}
