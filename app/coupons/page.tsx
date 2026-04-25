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
import Link from 'next/link'
import { COUPONS, getExpiryDisplay, type Coupon } from '@/lib/coupons'
import { COUPON_PAGE_SLUGS } from '@/lib/coupon-pages'
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
          <span className="text-3xl font-extrabold text-white leading-none">₹10,000</span>
          <span className="text-white/80 text-sm font-semibold mb-1">BONUS</span>
        </div>
        <p className="text-white/90 text-sm font-medium mt-1">EdifyEdu Enrollment Bonus on this university</p>
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
            Valid till <strong className="text-slate-600">{getExpiryDisplay(coupon)}</strong>
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={() => onEnquire(coupon)}
          className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: 'var(--navy, #0f172a)' }}
        >
          Apply &amp; Enquire
          <ChevronRight className="w-4 h-4" />
        </button>
        {COUPON_PAGE_SLUGS.some(s => s.includes(coupon.universityId.split('-')[0])) && (
          <Link
            href={`/coupons/${COUPON_PAGE_SLUGS.find(s => s.includes(coupon.universityId.split('-')[0])) || ''}`}
            className="w-full flex items-center justify-center gap-1 text-amber-700 py-2 rounded-xl text-xs font-semibold hover:bg-amber-50 transition-colors no-underline"
          >
            View full discount details
          </Link>
        )}
      </div>
    </div>
  )
}

// ── FAQ Accordion ──────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What is the best online MBA coupon code for 2026?',
    a: 'When you enroll through EdifyEdu using any coupon code, you receive a flat ₹10,000 enrollment bonus from EdifyEdu. This is separate from any university scholarship. For example, use AMITY25 for Amity or NMIMS15 for NMIMS. The bonus is applied as a fee adjustment during your advisor-assisted enrollment.',
  },
  {
    q: 'How much can I save with EdifyEdu coupons?',
    a: 'EdifyEdu provides a flat ₹10,000 enrollment bonus on any of the 21 listed universities. This bonus is from EdifyEdu, not the university. Universities may offer their own separate scholarships (merit-based, defence, lump-sum payment discounts) which you can avail on top of the EdifyEdu bonus.',
  },
  {
    q: 'Are these coupon codes verified?',
    a: 'Yes. The ₹10,000 EdifyEdu enrollment bonus is guaranteed when you enroll through our advisor. The bonus is from EdifyEdu, not the university. Your advisor will explain exactly how it is applied before you make any payment.',
  },
  {
    q: 'Can I use a coupon code with EMI?',
    a: 'Yes. The EdifyEdu bonus is applied to your total fee first, and you can then pay the reduced balance via EMI. For example, if your university fee is ₹2,00,000 and you receive the ₹10,000 bonus, your EMI is calculated on ₹1,90,000. Your advisor will clarify the exact terms.',
  },
  {
    q: 'How to get Amity University Online discount coupon?',
    a: 'Use coupon code AMITY25 during your advisor call to get ₹10,000 EdifyEdu enrollment bonus on Amity Online MBA. For MCA, use AMITYMCA20 for ₹10,000 EdifyEdu bonus. Click "Reveal Code" on the Amity card above to get the code.',
  },
  {
    q: 'Is there a coupon code for JAIN Online MBA?',
    a: 'Yes. JAIN20 gives ₹10,000 EdifyEdu enrollment bonus on JAIN Online programmes. For MCA specifically, use JAINMCA15 for ₹10,000 EdifyEdu bonus. Both codes are valid through April 2026.',
  },
  {
    q: 'How to apply LPU Online MBA or MCA discount code?',
    a: 'Use LPU20 for ₹10,000 EdifyEdu bonus on LPU Online MBA or LPUMCA20 for ₹10,000 EdifyEdu bonus on LPU Online MCA. Mention the code to your EdifyEdu advisor during the call.',
  },
  {
    q: 'Can I get a discount on Manipal Online MCA?',
    a: 'Yes. Use MANIPALMCA15 for ₹10,000 EdifyEdu bonus on Manipal MUJ Online MCA. For Online MBA, use MANIPAL20 for ₹10,000 EdifyEdu bonus with ₹10,000 EdifyEdu bonus.',
  },
  {
    q: 'What is the Chandigarh University Online discount code?',
    a: 'Use CHANDIGARH15 for ₹10,000 EdifyEdu bonus on Chandigarh University Online MBA, or CUMCA20 for ₹10,000 EdifyEdu bonus on the MCA program.',
  },
  {
    q: 'Is there an NMIMS Online coupon code?',
    a: 'Yes. NMIMS15 gives ₹10,000 EdifyEdu bonus on NMIMS Online MBA . Apply this code via your EdifyEdu advisor during the admissions call.',
  },
  {
    q: 'Is there a Symbiosis Online MBA coupon code?',
    a: 'Yes. Use SYMBIOSIS20 for ₹10,000 EdifyEdu bonus on Symbiosis SSODL Online MBA, on the total program fee.',
  },
  {
    q: 'Does Sikkim Manipal University have an online discount?',
    a: 'Yes. Coupon code SMU20 gives ₹10,000 EdifyEdu bonus on Sikkim Manipal University Online MBA or MCA programs, with ₹10,000 EdifyEdu bonus.',
  },
  {
    q: 'Is there a Sharda University Online coupon code?',
    a: 'Yes. SHARDA20 gives ₹10,000 EdifyEdu bonus on Sharda University Online programs (MBA or MCA), with ₹10,000 EdifyEdu bonus.',
  },
  {
    q: 'Can I get a discount at Bharati Vidyapeeth Online?',
    a: 'Yes. Use BVP20 for ₹10,000 EdifyEdu bonus on Bharati Vidyapeeth Online MBA or MCA, with ₹10,000 EdifyEdu bonus.',
  },
  {
    q: 'Are there coupon codes for Galgotias University Online?',
    a: 'Yes. GALGOTIAS15 offers ₹10,000 EdifyEdu bonus on Galgotias University Online programs, on your fee.',
  },
  {
    q: 'Is there an Amrita Online discount code?',
    a: 'Yes. AMRITA15 gives ₹10,000 EdifyEdu bonus on Amrita Online MBA or MCA programs, with ₹10,000 EdifyEdu bonus.',
  },
  {
    q: 'Are EdifyEdu coupon codes the same as university scholarships?',
    a: 'No. University scholarships are merit-based fee waivers (10-30%) awarded by the university based on your graduation marks. The EdifyEdu enrollment bonus is a separate Rs 10,000 benefit from EdifyEdu, not the university. You can stack both: get a university merit scholarship AND receive the Rs 10,000 EdifyEdu bonus. They are independent of each other.',
  },
  {
    q: 'Can I use multiple discount codes together?',
    a: 'It depends on the university. Most universities allow stacking a merit scholarship with a payment-plan discount (lump-sum savings). However, two referral codes typically cannot be combined. Our advisor will clarify the exact stacking rules for your chosen university during the call.',
  },
  {
    q: 'Do online MBA coupon codes work on EMI plans?',
    a: 'In most cases, yes. The coupon discount reduces the total programme fee first, and you then pay the reduced balance via EMI. For example, Amity MBA with AMITY25 reduces the fee by up to Rs 30,000. The remaining amount can be split into 24-month no-cost EMI. Our advisor will confirm EMI compatibility for your specific university.',
  },
  {
    q: 'What is the difference between a coupon code and a referral code?',
    a: 'A coupon code is a discount applied by the university or its authorized partner (like EdifyEdu) during the admission process. A referral code is shared by an existing student to a new applicant, typically saving Rs 2,000-10,000 on application or tuition. Both are valid savings methods. We provide coupon codes verified with university admissions teams.',
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
            Verified Offers · Updated Monthly
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Online MBA Discount Coupons 2026
            <br />
            <span className="text-amber-400">Verified Codes for {new Set(COUPONS.map(c => c.universityId)).size} UGC-DEB Universities</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Get an <strong className="text-white/90">exclusive ₹10,000 enrollment bonus</strong> from EdifyEdu on any UGC DEB approved online MBA or MCA. This bonus is from EdifyEdu, not the university. It is applied as a fee adjustment during your advisor-assisted enrollment. Universities may offer their own separate scholarships on top.
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

      {/* ── Editorial Intro ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">How the EdifyEdu Enrollment Bonus Works</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          When you enroll in an online MBA or MCA through EdifyEdu, you receive a <strong>flat Rs 10,000 enrollment bonus from EdifyEdu</strong>. This bonus is from EdifyEdu, not from the university. It is applied as a fee adjustment during your advisor-assisted enrollment. Universities offer their own separate scholarships (merit-based, defence, lump-sum payment discounts) which you can avail on top of the EdifyEdu bonus.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Types of Online MBA Discounts Available</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Discount Type</th><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Typical Saving</th><th className="px-4 py-2.5 text-left font-semibold text-slate-700">How It Works</th></tr></thead>
            <tbody>
              {[
                ['Lump-sum payment', '5-12%', 'Pay full fee upfront, save on processing'],
                ['Annual payment', '3-5%', 'Pay yearly instead of semester-wise'],
                ['Merit scholarship', '10-30%', 'Based on graduation marks (60%+ typically)'],
                ['Early-bird offer', '15-30%', 'Apply before university deadline'],
                ['Defence/Divyaang waiver', 'Up to 100%', 'Category-specific, with documentation'],
                ['Alumni discount', '5-10%', 'For students from same university'],
                ['Referral code', 'Rs 2,000-10,000', 'Peer-to-peer sharing discount'],
              ].map(([type, saving, how], i) => (
                <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-2 font-medium text-slate-700">{type}</td>
                  <td className="px-4 py-2 text-amber-700 font-semibold">{saving}</td>
                  <td className="px-4 py-2 text-slate-600">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">How to Maximise Your Savings (3 Steps)</h3>
        <div className="space-y-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700"><strong>Step 1:</strong> Apply for the university's own merit scholarship first. It is free and automatic at most universities if you have 60%+ in graduation.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700"><strong>Step 2:</strong> Choose lump-sum payment if you can afford it. This saves 5-12% on top of any scholarship. At Amity, this alone saves Rs 18,000.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700"><strong>Step 3:</strong> Time your application during an early-bird window. Some universities offer 15-30% additional discount for early enrollment. Ask our advisor for the current deadline.</p>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5 mb-6">
          <p className="text-sm text-green-800"><strong>Total potential savings:</strong> Rs 10,000 EdifyEdu bonus + university's own scholarships (merit 10-30%, lump-sum 5-12%, defence/divyaang waivers). For example, at MUJ: university 15% upfront discount (Rs 27,000) + EdifyEdu Rs 10,000 bonus = Rs 37,000 total savings on Rs 1,80,000 fee.</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-800"><strong>Important clarification:</strong> The Rs 10,000 enrollment bonus is from EdifyEdu, not from the university. It is EdifyEdu's incentive for students who enroll through our advisory service. University scholarships (merit, defence, lump-sum discounts) are separate and come directly from the university. Both can be availed together. Verify university-specific scholarships on each university's official portal.</p>
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
            <p className="text-sm font-bold text-slate-800 mb-0.5">Rs 10,000 EdifyEdu Enrollment Bonus</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              This bonus is from EdifyEdu, not the university. It is applied as a fee adjustment when you enroll through our advisor. Universities offer their own separate scholarships which you can avail on top. Mention your coupon code during the free advisor call.
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
          couponDiscount="₹10,000 EdifyEdu Bonus"
        />
      )}
    </>
  )
}
