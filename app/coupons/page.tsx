'use client'

import { useState, useCallback } from 'react'
import {
  Copy,
  Check,
  Tag,
  Clock,
  Sparkles,
  BadgePercent,
  GraduationCap,
  ChevronRight,
  Lock,
  Eye,
  ChevronDown,
} from 'lucide-react'
import { COUPONS, type Coupon } from '@/lib/coupons'
import EnquiryModal from '@/components/EnquiryModal'

// ── Types ──────────────────────────────────────────────────────────────────

type FilterTab = 'All' | 'MBA' | 'MCA'

const TABS: FilterTab[] = ['All', 'MBA', 'MCA']

const PROGRAM_COLOR: Record<string, string> = {
  MBA: 'bg-blue-100 text-blue-700 border-blue-200',
  MCA: 'bg-violet-100 text-violet-700 border-violet-200',
  All: 'bg-amber-100 text-amber-700 border-amber-200',
}

// Build a masked preview: show first 4 chars then bullets, e.g. "AMIT••••"
function maskCode(code: string): string {
  const visible = Math.min(4, Math.max(2, Math.floor(code.length / 2)))
  return code.slice(0, visible) + '•'.repeat(code.length - visible)
}

// ── Coupon Card ────────────────────────────────────────────────────────────

function CouponCard({
  coupon,
  revealed,
  onReveal,
  onEnquire,
}: {
  coupon: Coupon
  revealed: boolean
  onReveal: (coupon: Coupon) => void
  onEnquire: (coupon: Coupon) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
    } catch {
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
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${PROGRAM_COLOR[coupon.program]}`}
            >
              {coupon.program === 'All' ? 'All Programs' : `Online ${coupon.program}`}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">{coupon.university}</h3>
        </div>

        {/* Coupon code — locked or revealed */}
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Coupon Code</p>

          {revealed ? (
            /* ── REVEALED: copy button ── */
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between gap-3 bg-slate-50 border-2 border-dashed border-amber-400 hover:bg-amber-50 rounded-xl px-4 py-2.5 transition-all group"
              aria-label={`Copy coupon code ${coupon.code}`}
            >
              <span className="font-mono font-bold text-amber-700 text-sm tracking-widest">
                {coupon.code}
              </span>
              <span className="shrink-0">
                {copied ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <Check className="w-4 h-4" /> Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </span>
                )}
              </span>
            </button>
          ) : (
            /* ── LOCKED: masked + reveal button ── */
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-2.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono font-bold text-slate-400 text-sm tracking-widest select-none">
                  {maskCode(coupon.code)}
                </span>
              </div>
              <button
                onClick={() => onReveal(coupon)}
                className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Reveal Code — Fill Quick Form
              </button>
            </div>
          )}
        </div>

        {/* Expiry */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>
            Valid till <strong className="text-slate-600">{coupon.expiry}</strong>
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onEnquire(coupon)}
          className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: 'var(--navy, #0f172a)' }}
        >
          Apply &amp; Enquire
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── FAQ Accordion ──────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What is the best online MBA coupon code for 2026?',
    a: 'The highest-value codes for 2026 are AMITY25 (25% off Amity University Online MBA, save up to ₹30,000) and SYMBIOSIS20 (20% off Symbiosis SSODL MBA, save up to ₹25,000). All codes are verified by the EdifyEdu team and valid through April 2026.',
  },
  {
    q: 'How much can I save with EdifyEdu coupons?',
    a: 'You can save between ₹10,000 and ₹30,000 depending on the university and program. Discounts range from 15% to 25% across 21 UGC DEB approved universities offering Online MBA and MCA.',
  },
  {
    q: 'Are these coupon codes verified?',
    a: 'Yes. Every coupon code on this page is verified directly with the university admissions team. Our EdifyEdu team confirms the discount live on the call before you make any payment.',
  },
  {
    q: 'Can I use a coupon code with EMI?',
    a: 'In most cases, yes. The coupon discount is applied to the total program fee first, and you can then pay the reduced balance via EMI. Our advisor will clarify the specific terms for your chosen university.',
  },
  {
    q: 'How to get Amity University Online discount coupon?',
    a: 'Use coupon code AMITY25 during your advisor call to get 25% off on Amity University Online MBA (saves up to ₹30,000). For MCA, use AMITYMCA20 for 20% off. Click "Reveal Code" on the Amity card above to get the code.',
  },
  {
    q: 'Is there a coupon code for JAIN Online MBA?',
    a: 'Yes. JAIN20 gives 20% off on JAIN Online MBA and all programs (saves up to ₹20,000). For MCA specifically, use JAINMCA15 for 15% off. Both codes are valid through April 2026.',
  },
  {
    q: 'How to apply LPU Online MBA or MCA discount code?',
    a: 'Use LPU20 for 20% off on LPU Online MBA (saves ₹18,000) or LPUMCA20 for 20% off on LPU Online MCA. Mention the code to your EdifyEdu advisor during the call.',
  },
  {
    q: 'Can I get a discount on Manipal Online MCA?',
    a: 'Yes. Use MANIPALMCA15 for 15% off on Manipal MUJ Online MCA (saves up to ₹14,000). For Online MBA, use MANIPAL20 for 20% off saving up to ₹22,000.',
  },
  {
    q: 'What is the Chandigarh University Online discount code?',
    a: 'Use CHANDIGARH15 for 15% off on Chandigarh University Online MBA (saves ₹12,000), or CUMCA20 for 20% off on the MCA program (saves ₹16,000).',
  },
  {
    q: 'Is there an NMIMS Online coupon code?',
    a: 'Yes. NMIMS15 gives 15% off on NMIMS Online MBA saving up to ₹20,000. Apply this code via your EdifyEdu advisor during the admissions call.',
  },
  {
    q: 'Is there a Symbiosis Online MBA coupon code?',
    a: 'Yes. Use SYMBIOSIS20 for 20% off on Symbiosis SSODL Online MBA, saving up to ₹25,000 on the total program fee.',
  },
  {
    q: 'Does Sikkim Manipal University have an online discount?',
    a: 'Yes. Coupon code SMU20 gives 20% off on Sikkim Manipal University Online MBA or MCA programs, saving up to ₹16,000.',
  },
  {
    q: 'Is there a Sharda University Online coupon code?',
    a: 'Yes. SHARDA20 gives 20% off on Sharda University Online programs (MBA or MCA), saving up to ₹18,000.',
  },
  {
    q: 'Can I get a discount at Bharati Vidyapeeth Online?',
    a: 'Yes. Use BVP20 for 20% off on Bharati Vidyapeeth Online MBA or MCA, saving up to ₹14,000.',
  },
  {
    q: 'Are there coupon codes for Galgotias University Online?',
    a: 'Yes. GALGOTIAS15 offers 15% off on Galgotias University Online programs, saving up to ₹10,000 on your fee.',
  },
  {
    q: 'Is there an Amrita Online discount code?',
    a: 'Yes. AMRITA15 gives 15% off on Amrita Online MBA or MCA programs, saving up to ₹12,000.',
  },
]

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(i: number) {
    setOpenIndex(prev => (prev === i ? null : i))
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Section header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
          <Tag className="w-3.5 h-3.5" />
          Frequently Asked Questions
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          Everything about Online MBA &amp; MCA<br className="hidden sm:block" /> Discount Coupons 2026
        </h2>
        <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          Common questions about coupon codes, savings, and how to apply discounts on your
          UGC DEB approved online degree.
        </p>
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-amber-200'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-slate-800 text-sm sm:text-base leading-snug pr-2">
                  {item.q}
                </span>
                <ChevronDown
                  className={`shrink-0 w-5 h-5 text-amber-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-amber-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  // tracks which coupon codes have been revealed after form submission
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set())
  // tracks which coupon triggered the reveal flow (before reveal is confirmed)
  const [revealPending, setRevealPending] = useState<Coupon | null>(null)

  const filtered =
    activeTab === 'All' ? COUPONS : COUPONS.filter(c => c.program === activeTab || c.program === 'All')

  // Sort: featured first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return a.university.localeCompare(b.university)
  })

  function handleReveal(coupon: Coupon) {
    setRevealPending(coupon)
    setSelectedCoupon(coupon)
    setModalOpen(true)
  }

  function handleEnquire(coupon: Coupon) {
    setRevealPending(null)
    setSelectedCoupon(coupon)
    setModalOpen(true)
  }

  function handleModalClose() {
    setModalOpen(false)
    // If modal was opened via "Reveal Code", mark that code as revealed
    if (revealPending) {
      setRevealedCodes(prev => {
        const next = new Set(prev)
        next.add(revealPending.code)
        return next
      })
      setRevealPending(null)
    }
  }

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
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            <Tag className="w-3.5 h-3.5" />
            Verified Offers · Updated Apr 2026
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Exclusive Online Degree
            <br />
            <span className="text-amber-400">Discount Coupons 2026</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Verified offers on{' '}
            <strong className="text-white/90">UGC DEB approved universities</strong>. Save up to
            ₹30,000 on your Online MBA or MCA fee — reveal the code, fill a quick form, and apply
            during your advisor call.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: <BadgePercent className="w-5 h-5" />, label: `${COUPONS.length} Active Coupons` },
              { icon: <GraduationCap className="w-5 h-5" />, label: '21 Universities' },
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
              {tab === 'All'
                ? `All (${COUPONS.length})`
                : `${tab} (${COUPONS.filter(c => c.program === tab || c.program === 'All').length})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No coupons found for this filter.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map(coupon => (
              <CouponCard
                key={coupon.code}
                coupon={coupon}
                revealed={revealedCodes.has(coupon.code)}
                onReveal={handleReveal}
                onEnquire={handleEnquire}
              />
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
              Reveal the coupon code by filling the quick enquiry form — our advisor will confirm the
              discount directly with the university&apos;s admissions desk. Offers valid for admissions
              in the current academic session. Terms &amp; conditions of each university apply.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-100">
        <FaqAccordion />
      </div>

      {/* ── EnquiryModal ─────────────────────────────────────────────────── */}
      {selectedCoupon && (
        <EnquiryModal
          isOpen={modalOpen}
          onClose={handleModalClose}
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
