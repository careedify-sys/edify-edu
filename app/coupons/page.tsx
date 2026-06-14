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
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { COUPONS, getExpiryDisplay, getTodaysBonus, type Coupon } from '@/lib/coupons'
import { COUPON_PAGE_SLUGS } from '@/lib/coupon-pages'
import EnquiryModal from '@/components/EnquiryModal'
import CouponCountdown from '@/components/CouponCountdown'
import CouponScarcityBanner from '@/components/CouponScarcityBanner'
import CouponsHubTopCta from '@/components/coupons/CouponsHubTopCta'
import CouponsHubBottomCta from '@/components/coupons/CouponsHubBottomCta'
import { COUPONS_HUB_FAQS } from './faqs'

const COUNSELLOR_TEL = '+917061285806'
const COUNSELLOR_TEL_DISPLAY = '+91 70612 85806'

const hubFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: COUPONS_HUB_FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

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

  const todayBonus = getTodaysBonus(coupon.tier)

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
          <span className="text-3xl font-extrabold text-white leading-none">
            Rs {todayBonus.amount.toLocaleString('en-IN')}
          </span>
          <span className="text-white/80 text-sm font-semibold mb-1">
            {todayBonus.isMaxWindow ? 'MAX TODAY' : 'BONUS'}
          </span>
        </div>
        <p className="text-white/90 text-sm font-medium mt-1">
          Verified discount coupon on this programme
        </p>
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

        {/* Countdown to next max window */}
        <CouponCountdown tier={coupon.tier} variant="card" />

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
        <a
          href={`tel:${COUNSELLOR_TEL}`}
          className="w-full flex items-center justify-center gap-2 text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-amber-600" />
          Or call counsellor: {COUNSELLOR_TEL_DISPLAY}
        </a>
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
// Visible FAQ list is imported from layout.tsx so the JSON-LD schema and the
// rendered accordion are guaranteed to match. Edit both by editing the
// COUPONS_HUB_FAQS export in layout.tsx.

const FAQ_ITEMS = COUPONS_HUB_FAQS

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
          Online MBA Discount Coupon FAQs<br className="hidden sm:block" /> 2026
        </h2>
        <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          How the coupon discount works, Tuesday and Saturday max windows, and how to redeem
          it on your UGC DEB approved online degree.
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
    // Plain close (ESC, X, backdrop click, "Done" after success). Does NOT
    // reveal the code — reveal is gated to handleModalSuccess so dismissing
    // the form without submitting cannot leak any coupon.
    setModalOpen(false)
    setRevealPending(null)
  }

  function handleModalSuccess() {
    // Fired only by EnquiryModal after a successful POST to /api/enquiry.
    // If the modal was opened via "Reveal Code", unlock that specific code
    // now. The modal stays on its success screen until the user dismisses.
    if (revealPending) {
      const code = revealPending.code
      setRevealedCodes(prev => {
        if (prev.has(code)) return prev
        const next = new Set(prev)
        next.add(code)
        return next
      })
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubFaqSchema) }} />
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
            Verified · Tuesday and Saturday Max Discount
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Online MBA Discount Coupons 2026
            <br />
            <span className="text-amber-400">
              Up to Rs 5,000 off across {new Set(COUPONS.map(c => c.universityId)).size} UGC DEB universities
            </span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Verified online MBA discount coupons for {new Set(COUPONS.map(c => c.universityId)).size} UGC-DEB approved universities. Each coupon carries a fixed <strong className="text-white/90">discount of up to Rs 5,000</strong> applied at enrollment. The maximum amount unlocks every Tuesday and Saturday in IST. No paperwork, no marksheet upload, no eligibility test.
          </p>

          {/* Live countdown to next max window */}
          <div className="flex justify-center mb-8">
            <CouponCountdown tier="premium" variant="hero" />
          </div>

          {/* Phone CTA — hero placement */}
          <a
            href={`tel:${COUNSELLOR_TEL}`}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl no-underline transition-colors mb-8"
          >
            <Phone className="w-4 h-4" />
            Call counsellor: {COUNSELLOR_TEL_DISPLAY}
          </a>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: <BadgePercent className="w-5 h-5" />, label: `${COUPONS.length} Active Coupons` },
              { icon: <GraduationCap className="w-5 h-5" />, label: `${new Set(COUPONS.map(c => c.universityId)).size} Universities` },
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
        <div className="mb-6">
          <CouponScarcityBanner tier="premium" fullWidth />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">How These Online MBA Discount Coupons Work</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Each verified coupon code on this page carries a fixed discount of up to <strong>Rs 5,000</strong> applied at the time of enrollment for the {new Date().getFullYear()} batch. The maximum amount is live every <strong>Tuesday and Saturday in IST</strong>. On other days, the base amount of Rs 4,000 applies. No marksheet upload, no eligibility test, no category certificate. Just reveal the code, mention it to our admission desk during enrollment, and the discount is reflected in your fee invoice before any payment.
        </p>

        <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Day of week (IST)</th><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Coupon discount</th><th className="px-4 py-2.5 text-left font-semibold text-slate-700">When to enroll</th></tr></thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-4 py-2 font-medium text-slate-700">Tuesday and Saturday</td>
                <td className="px-4 py-2 text-amber-700 font-semibold">Rs 5,000 (max)</td>
                <td className="px-4 py-2 text-slate-600">Best day to lock in the discount</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-700">All other days</td>
                <td className="px-4 py-2 text-amber-700 font-semibold">Rs 4,000 (base)</td>
                <td className="px-4 py-2 text-slate-600">Coupon still works, smaller amount</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Online MBA Coupon Codes Search Intent: What Students Are Looking For</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Searches for "online MBA discount coupon", "online MBA coupon code 2026", "best MBA fee discount", "online MBA offer", and "MBA fee waiver code" all share one intent: a verifiable, no-paperwork discount applied at enrollment. The verified coupons on this page sit in that exact niche.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Most online-MBA coupon listings on the internet quote large, inflated savings figures. Those numbers usually refer to university-administered scholarships (merit, defence, divyaang, alumni) that have separate eligibility checks and documentation requirements, and are not bundled with any coupon code. The Rs 4,000 to Rs 5,000 figures on this page are the realistic, verifiable coupon discount that applies to every applicant at enrollment.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">How to Get the Maximum Discount in 3 Steps</h3>
        <div className="space-y-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700"><strong>Step 1:</strong> Pick the university you want and reveal its coupon code by submitting the quick form on the card. The code is delivered immediately.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700"><strong>Step 2:</strong> Time your enrollment call so the fee invoice is generated on a Tuesday or Saturday in IST. That single timing decision moves the coupon value from Rs 4,000 to Rs 5,000.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700"><strong>Step 3:</strong> Mention the coupon code during enrollment. The discount is reflected in your invoice before any payment is made.</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-800"><strong>Note on university scholarships.</strong> Some universities run their own scholarship programmes (merit, defence personnel, divyaang, sports, alumni). These are administered directly by the university with their own eligibility rules and documentation. They are separate from the coupon codes on this page. To check what scholarships you may qualify for, contact the university admissions team directly during enrollment.</p>
        </div>
      </section>

      {/* ── CTA #1 — Top decision helper (above coupon listings) ─────────── */}
      <CouponsHubTopCta />

      {/* ── Filter tabs + Grid ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
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

        {/* CTA #2 — Bottom lead form (after listings, before footer trust block) */}
        <CouponsHubBottomCta />

        {/* Footer trust block */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">Verified discount coupons, no paperwork</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each coupon delivers a fixed discount of up to Rs 5,000 (Tuesday or Saturday in IST) or Rs 4,000 (other days), applied at the point of enrollment. No marksheet upload, no eligibility test. Reveal the code, mention it during enrollment, the discount is reflected in your fee invoice before payment.
            </p>
          </div>
        </div>

        {/* Buried legal disclaimer */}
        <div className="mt-10 pt-5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            <strong className="text-slate-500">Disclosure and terms.</strong> edifyedu.in is an independent advisory and comparison platform. The discount coupon codes shown on this page represent enrollment-time fee adjustments coordinated by our admission desk during the enrollment process for the {new Date().getFullYear()} batch and are not official discount offers issued, endorsed, sponsored, or administered by the listed universities or any of their affiliates. The coupon amounts (Rs 5,000 on Tuesday and Saturday in IST and Rs 4,000 on other days) are indicative for the current monthly cycle and may be revised, suspended, or withdrawn at any time without prior notice. Final acceptance, applicability, and amount of the discount at enrollment are at the sole discretion of the respective university admissions team and subject to verification of student details, programme availability, batch quotas, and applicable university policies in effect at the time of enrollment. University-administered scholarships (merit, defence, divyaang, sports, alumni, and similar categories) are separate from these coupons, are governed independently by each university, and should be verified directly with the university. Coupon discounts are not transferable, not redeemable for cash, and cannot be combined with other third-party coupon codes for the same programme. Programme fees, accreditation status, and other figures referenced are sourced from publicly available university communications and are believed to be accurate at the time of publishing. Students are advised to independently verify all fees, accreditation, and discount applicability on the official university portal before making any payment. All trademarks, university names, and logos referenced are the property of their respective owners and used here for identification and comparison purposes only. By revealing or using a coupon code, you acknowledge these terms.
          </p>
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
          onSuccess={handleModalSuccess}
          universityName={selectedCoupon.university}
          universityId={selectedCoupon.universityId}
          defaultProgram={selectedCoupon.program === 'All' ? '' : selectedCoupon.program}
          sourcePage="/coupons"
          couponCode={selectedCoupon.code}
          couponDiscount={selectedCoupon.savings}
        />
      )}

      {/* ── Sticky phone CTA bar (mobile-first) ─────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-900 border-t border-amber-500/40 shadow-lg">
        <a
          href={`tel:${COUNSELLOR_TEL}`}
          className="flex items-center justify-center gap-2 px-4 py-3 text-amber-300 font-bold text-sm no-underline"
        >
          <Phone className="w-4 h-4" />
          Call our admission desk: {COUNSELLOR_TEL_DISPLAY}
        </a>
      </div>
    </>
  )
}
