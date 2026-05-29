import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BadgeCheck, Tag, Clock, ExternalLink, Phone } from 'lucide-react'
import { getCouponPage, COUPON_PAGE_SLUGS, type CouponPageData } from '@/lib/coupon-pages'
import { getExpiryISO, getTodaysBonus, TIER_AMOUNTS } from '@/lib/coupons'
import CouponPageCTA from '@/components/CouponPageCTA'
import CouponCountdown from '@/components/CouponCountdown'
import CouponScarcityBanner from '@/components/CouponScarcityBanner'
import MujCouponTopUrgency from '@/components/coupons/MujCouponTopUrgency'
import MujCouponMidReassurance from '@/components/coupons/MujCouponMidReassurance'
import MujCouponEndCta from '@/components/coupons/MujCouponEndCta'

// Slug-conditional CTAs for high-CTR coupon pages. Component-injected so
// the data layer in lib/coupon-pages.ts stays clean.
const MUJ_COUPON_SLUG = 'manipal-jaipur-online-mba-discount-coupon-2026'

const COUNSELLOR_TEL = '+917061285806'
const COUNSELLOR_TEL_DISPLAY = '+91 70612 85806'

export const revalidate = 86400

export function generateStaticParams() {
  return COUPON_PAGE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { slug } = params instanceof Promise ? await params : params
  const page = getCouponPage(slug)
  if (!page) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const tierMax = TIER_AMOUNTS[page.tier].max
  const tierLabel = `Rs ${tierMax.toLocaleString('en-IN')}`
  const title = page.couponCode === 'N/A'
    ? `${page.shortName} Online MBA ${year} - UGC-DEB Approved, NAAC ${page.naac}`
    : `${page.shortName} Online MBA Discount Coupon ${year} - ${page.couponCode} (Up to ${tierLabel} Off)`
  const description = page.couponCode === 'N/A'
    ? `${page.shortName} Online MBA ${year}: UGC-DEB approved, NAAC ${page.naac} accredited. ${page.nirf}.`
    : `${page.shortName} Online MBA discount coupon ${year}: use code ${page.couponCode} for up to ${tierLabel} off your fees. Max on Tuesday and Saturday IST. NAAC ${page.naac}, UGC-DEB approved.`

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${page.shortName} online MBA discount coupon ${year}`,
      `${page.shortName} online MBA coupon code`,
      `${page.shortName} MBA fee ${year}`,
      `${page.couponCode}`,
      `${page.shortName} online MBA fees`,
      `${page.shortName} online MBA offer`,
      `online MBA discount coupon ${year}`,
      `online MBA coupon code India`,
      `online MBA fee discount`,
      `online MBA offer ${year}`,
      `best online MBA discount`,
      `${page.universityName} discount code`,
    ],
    alternates: { canonical: `https://edifyedu.in/coupons/${page.slug}` },
    openGraph: { title, description, url: `https://edifyedu.in/coupons/${page.slug}`, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CouponDetailPage({ params }: { params: any }) {
  const { slug } = params instanceof Promise ? await params : params
  const page = getCouponPage(slug)
  if (!page) notFound()

  const year = new Date().getFullYear()
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)
  const expiryStr = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const expiryISO = expiryDate.toISOString().split('T')[0]
  const tierMax = TIER_AMOUNTS[page.tier].max
  const tierBase = TIER_AMOUNTS[page.tier].base
  const liveBonus = getTodaysBonus(page.tier)

  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Coupons', item: 'https://edifyedu.in/coupons' },
      { '@type': 'ListItem', position: 3, name: `${page.shortName} Coupon`, item: `https://edifyedu.in/coupons/${page.slug}` },
    ],
  }

  const offerSchema = page.couponCode !== 'N/A' ? {
    '@context': 'https://schema.org', '@type': 'Offer',
    name: `${page.universityName} Online MBA ${year} Discount Coupon`,
    description: `Verified discount coupon ${page.couponCode}: up to ${page.maxSavings} off, applied at enrollment.`,
    category: 'Online Education Coupon',
    priceCurrency: 'INR',
    validThrough: expiryISO,
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'CollegeOrUniversity', name: page.universityName },
  } : null

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: page.faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const applicationSteps = [
    'Reveal the coupon code by submitting the quick form on this page',
    `Mention coupon ${page.couponCode} to our admission desk during your enrollment call`,
    'Share your basic details (name, contact, programme preference) to start the enrollment',
    `The admission desk coordinates with ${page.shortName} to apply the coupon discount at enrollment`,
    'You receive a fee invoice with the coupon discount applied before any payment',
    'Complete the enrollment in your preferred payment plan',
  ]

  // HowTo schema — strong AEO signal for "how to apply X coupon" queries.
  // Mirrors the visible 6-step section so AI search engines pull verbatim.
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Apply ${page.couponCode} Coupon for ${page.shortName} Online MBA ${year}`,
    description: `Six-step application flow to claim the verified ${page.couponCode} discount coupon on ${page.universityName} Online MBA and save up to ${page.maxSavings}.`,
    totalTime: 'P3D',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'INR', value: 0 },
    supply: [{ '@type': 'HowToSupply', name: 'Graduation marksheets and ID proof' }],
    step: applicationSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Step ${i + 1}`,
      text: s,
      url: `https://edifyedu.in/coupons/${page.slug}#step-${i + 1}`,
    })),
  }

  // Course schema — describes the underlying MBA programme so search engines
  // tie the coupon to the actual product.
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${page.universityName} Online MBA`,
    description: `UGC-DEB approved 2-year online MBA from ${page.universityName} (NAAC ${page.naac}). Verified discount coupon ${page.couponCode} saves up to ${page.maxSavings} at enrollment.`,
    provider: { '@type': 'CollegeOrUniversity', name: page.universityName, sameAs: page.officialUrl },
    offers: {
      '@type': 'Offer',
      category: 'Online Education',
      priceCurrency: 'INR',
      validThrough: expiryISO,
      url: `https://edifyedu.in/coupons/${page.slug}`,
      availability: 'https://schema.org/InStock',
    },
    educationalLevel: 'Postgraduate',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT2Y',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {offerSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-amber-600 no-underline">Home</Link>
          <ChevronRight size={11} />
          <Link href="/coupons" className="hover:text-amber-600 no-underline">Coupons</Link>
          <ChevronRight size={11} />
          <span className="text-slate-800 font-semibold">{page.shortName} Coupon</span>
        </nav>

        {/* H1 + Hero */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: '#0f2756' }}>
          {page.couponCode === 'N/A'
            ? `${page.universityName} Online MBA ${year} - UGC-DEB Approved`
            : `${page.universityName} Online MBA Discount Coupon ${year} - ${page.couponCode}`}
        </h1>

        {/* Scarcity banner + countdown */}
        {page.couponCode !== 'N/A' && (
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center mb-6">
            <CouponScarcityBanner tier={page.tier} fullWidth />
            <CouponCountdown tier={page.tier} variant="card" />
          </div>
        )}

        {/* Grab-the-coupon hero */}
        {page.couponCode !== 'N/A' && (
          <div className="rounded-2xl overflow-hidden mb-6 shadow-md" style={{ background: 'linear-gradient(135deg, #0f2756 0%, #1e3a8a 100%)' }}>
            <div className="px-6 py-7 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">Discount waiting on your fees</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
                You have <span className="text-amber-300">Rs {tierMax.toLocaleString('en-IN')}</span> off
              </p>
              <p className="text-sm text-white/80 max-w-md mx-auto">
                Available on your {page.shortName} Online MBA enrollment. Grab it before today&apos;s window closes.
              </p>
            </div>
          </div>
        )}

        {/* Programme info tiles - no fees, only details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Accreditation</p>
            <p className="text-base font-extrabold" style={{ color: '#0f2756' }}>NAAC {page.naac}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">NIRF Standing</p>
            <p className="text-base font-extrabold" style={{ color: '#0f2756' }}>{page.nirf}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Recognition</p>
            <p className="text-base font-extrabold" style={{ color: '#0f2756' }}>UGC-DEB</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Programme Mode</p>
            <p className="text-base font-extrabold" style={{ color: '#0f2756' }}>2-Yr Online</p>
          </div>
        </div>

        {/* Coupon snapshot - discount only, no fees */}
        {page.couponCode !== 'N/A' && (
          <section className="mb-8">
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Coupon Discount Available</p>
                  <p className="text-lg font-extrabold text-slate-900 mb-2">Up to Rs {tierMax.toLocaleString('en-IN')} off with coupon {page.couponCode}</p>
                  <ul className="text-sm text-slate-700 space-y-1.5">
                    <li className="flex items-start gap-2"><BadgeCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> Rs {tierMax.toLocaleString('en-IN')} on Tuesday and Saturday in IST</li>
                    <li className="flex items-start gap-2"><BadgeCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> Rs {tierBase.toLocaleString('en-IN')} on all other days</li>
                    <li className="flex items-start gap-2"><BadgeCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> No marksheet upload, no eligibility test, no paperwork</li>
                    <li className="flex items-start gap-2"><BadgeCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> Applied directly during enrollment by our admission desk</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Reveal the coupon code below. Our admission desk confirms the active amount and applies the discount during enrollment.
            </p>
          </section>
        )}

        {/* CTA - Reveal code */}
        <CouponPageCTA page={page} />

        {/* Slug-conditional top urgency CTA — MUJ coupon */}
        {slug === MUJ_COUPON_SLUG && <MujCouponTopUrgency />}

        {/* Phone CTA - direct counsellor call */}
        {page.couponCode !== 'N/A' && (
          <div className="mb-8 -mt-2 text-center">
            <a
              href={`tel:${COUNSELLOR_TEL}`}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-6 py-3 rounded-xl no-underline transition-colors"
            >
              <Phone className="w-4 h-4" />
              Or call our admission desk: {COUNSELLOR_TEL_DISPLAY}
            </a>
          </div>
        )}

        {/* Editorial intro - substantial for SEO */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>{page.shortName} Online MBA Discount Coupon {year}: What You Get</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The verified {page.shortName} online MBA discount coupon for {year} is <strong>{page.couponCode}</strong>. It carries an additional discount of up to Rs {tierMax.toLocaleString('en-IN')} on Tuesday and Saturday in IST, and Rs {tierBase.toLocaleString('en-IN')} on other days. The coupon is applied at the time of enrollment by our admission desk.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The coupon redemption is straightforward: no marksheet upload, no eligibility test, no paperwork beyond the standard enrollment process. Reveal the code below by submitting a short form, mention it on your enrollment call, and the discount is reflected in your invoice before any payment is made.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.universityName} holds NAAC {page.naac} accreditation and is UGC-DEB approved for online degree programmes. The online MBA degree is legally equivalent to a campus MBA under UGC 2020 regulations. Per UGC (Online Programmes) Regulations 2018, the degree certificate clearly identifies the programme as "Online" mode. It is valid for UPSC, banking exams, PSU recruitment, and all private-sector employment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Most students searching for "{page.shortName} online MBA coupon code" or "{page.shortName} MBA discount {year}" land on inflated coupon claims that turn out to be university-administered scholarships with separate eligibility checks and documentation requirements. This page lists only the verified, no-paperwork coupon discount of up to Rs {tierMax.toLocaleString('en-IN')}. For programme fee details and any university-administered scholarships, contact {page.universityName} admissions directly.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <p className="text-xs text-amber-800"><strong>How the coupon discount works:</strong> the coupon amount is tiered by day of week. On Tuesday and Saturday in IST it is Rs {tierMax.toLocaleString('en-IN')}, on other days it is Rs {tierBase.toLocaleString('en-IN')}. The amount is applied as a fee adjustment when you complete enrollment with code <strong>{page.couponCode}</strong>. The live amount and countdown to the next Tuesday or Saturday max window are shown at the top of this page.</p>
          </div>
        </section>

        {/* Why discounts matter */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Why the {page.couponCode} Coupon Code Matters</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            An online MBA is a significant investment. Every rupee saved at enrollment is a rupee that improves the return on your degree. The {page.couponCode} verified discount coupon is one of the few savings that students actually receive without paperwork or eligibility checks.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The coupon is independent of marksheet thresholds, category certificates, payment-plan choices, and intake-specific early-bird windows. Whether you pay lump-sum or via EMI, the coupon discount applies at the time of enrollment. Reveal the code, mention it on your enrollment call, and the discount is reflected in your invoice before any payment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The Tuesday and Saturday max-window design exists for one reason: it gives applicants a fixed, predictable date to plan around. If you enroll on a Tuesday or Saturday in IST, the coupon pays the maximum Rs {tierMax.toLocaleString('en-IN')}. If you enroll any other day, it pays Rs {tierBase.toLocaleString('en-IN')}. There is no hidden small print, no minimum batch fill, no application count gate.
          </p>
        </section>

        {/* Quick facts card - replaces the discounts table */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>{page.couponCode} Coupon at a Glance</h2>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700 w-1/2">Coupon code</td>
                  <td className="px-4 py-3 text-slate-700 font-mono font-bold">{page.couponCode}</td>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Discount value (Tue/Sat IST)</td>
                  <td className="px-4 py-3 text-amber-700 font-bold">Rs {tierMax.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Discount value (other days)</td>
                  <td className="px-4 py-3 text-amber-700 font-bold">Rs {tierBase.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Programme</td>
                  <td className="px-4 py-3 text-slate-600">{page.universityName} Online MBA {year}</td>
                </tr>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Programme duration</td>
                  <td className="px-4 py-3 text-slate-600">2 years (4 semesters)</td>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Coupon validity</td>
                  <td className="px-4 py-3 text-slate-600">Rolling, refreshed monthly</td>
                </tr>
                <tr className="bg-white border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Accreditation</td>
                  <td className="px-4 py-3 text-slate-600">NAAC {page.naac}, UGC-DEB approved</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-700">NIRF standing</td>
                  <td className="px-4 py-3 text-slate-600">{page.nirf}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Slug-conditional mid-page reassurance CTA — MUJ coupon */}
        {slug === MUJ_COUPON_SLUG && <MujCouponMidReassurance />}

        {/* Application steps */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>How to Apply the {page.couponCode} Coupon Code</h2>
          <p className="text-sm text-slate-600 mb-4">Apply the {page.couponCode} discount to your {page.shortName} Online MBA admission in six steps. Average time: 1-3 working days from first call to discounted invoice.</p>
          <div className="space-y-3">
            {applicationSteps.map((step, i) => (
              <div key={i} id={`step-${i + 1}`} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">{i + 1}</span>
                <p className="text-sm text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* University scholarships note */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>What About {page.shortName} Scholarships and Other Waivers?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.universityName} runs its own scholarship programmes for merit, defence personnel, divyaang candidates, sports achievers, alumni, and other categories. The eligibility, percentage, and documentation requirements for each category are set by the university directly and change between batches. We do not administer these scholarships and we cannot quote their current values on this page.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            If you think you qualify for any of these categories, ask the {page.shortName} admissions team directly during enrollment. They will confirm whether the scholarship is active for the {year} batch, what documents you need, and whether it can be combined with the {page.couponCode} coupon discount. Information about university scholarships should be verified on {page.officialUrl} or by speaking with {page.shortName} admissions.
          </p>
        </section>

        {/* SEO content section - targets all "online mba discount coupon" intent keywords */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Online MBA Discount Coupons in India {year}: Buyer&apos;s Guide</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Online MBA discount coupons are one of the most searched queries on Google in the Indian online-education space. Search volumes for "online MBA coupon code", "online MBA discount {year}", "best online MBA offer", and "MBA fee discount India" run into tens of thousands of monthly queries each. The reason is simple: every applicant wants to confirm they are getting a genuine, verifiable saving before enrolling.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            However, most "online MBA coupon" listings on the internet are inflated. They show large savings that are actually university-administered scholarships, not coupon discounts. The applicant then arrives at the enrollment desk and discovers the promised discount has eligibility rules, marksheet thresholds, or batch quotas that do not match what was advertised.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>How a Real MBA Coupon Code Differs from a Scholarship</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            A coupon code is a fixed, no-paperwork discount that any applicant can redeem at enrollment. A scholarship is a university-administered concession with eligibility rules (marksheets, category certificates, defence ID, sports achievements, alumni status). Most students search for "coupon" but receive scholarship-style answers that do not match the search intent.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The {page.couponCode} coupon on this page is the former. It is a fixed Rs {tierMax.toLocaleString('en-IN')} (Tue/Sat IST) or Rs {tierBase.toLocaleString('en-IN')} (other days) discount applied at enrollment. There is no marksheet check, no category certificate, no application essay. If you can complete the {page.shortName} online MBA enrollment, you can redeem the coupon.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>What "Online MBA Offer {year}" Searches Usually Mean</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            High-volume queries like "online MBA offer {year}", "online MBA special offer India", "online MBA fee waiver code", and "best online MBA discount" all refer to the same underlying intent: a verifiable, no-strings discount at the point of enrollment. The Rs {tierMax.toLocaleString('en-IN')} max coupon on this page sits in that exact niche across UGC-DEB approved universities.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Across the UGC-DEB approved online MBA universities we work with, coupon discounts settle into a narrow band. The bulk of programmes carry coupon savings in the Rs 4,000 to Rs 5,000 range, similar to what {page.shortName} offers via {page.couponCode}. Larger advertised savings on other sites usually refer to scholarships that are not bundled with any coupon.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>Tuesday and Saturday Max Window: Why It Matters</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The {page.couponCode} coupon pays its maximum value of Rs {tierMax.toLocaleString('en-IN')} only on Tuesday and Saturday in IST. On other days the coupon still works but at the base value of Rs {tierBase.toLocaleString('en-IN')}. The difference of Rs {(tierMax - tierBase).toLocaleString('en-IN')} is small in absolute terms but becomes meaningful if you are deciding between three or four programmes and trying to compare like-for-like.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Practical advice: time your enrollment call so the fee invoice is generated on a Tuesday or Saturday. The countdown timer at the top of this page tracks the next max window so you can plan around it. If you have already started enrollment on a base-amount day, ask the admission desk to schedule the final invoice generation on the next Tuesday or Saturday.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>Coupon Validity, Refreshes, and Stacking Rules</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The {page.couponCode} coupon is on a rolling 30-day validity that refreshes each month. The amount values (Rs {tierBase.toLocaleString('en-IN')} base, Rs {tierMax.toLocaleString('en-IN')} max) are reviewed and republished at the start of each calendar month based on the active enrollment cycle.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The coupon cannot be combined with other third-party coupon codes from other websites for the same university. If the university you choose has its own merit, defence, or divyaang scholarship and you qualify, ask the {page.shortName} admissions team whether the scholarship and this coupon can be combined. The university makes the final call.
          </p>
        </section>

        {/* EMI compatibility */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>EMI and Coupon Discount Compatibility at {page.shortName}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The {page.couponCode} coupon discount works with EMI payment plans at {page.shortName}. The coupon is applied at enrollment and the resulting balance can then be split into monthly EMI instalments. Whether the no-cost EMI window applies to the reduced balance is set by the university and confirmed at enrollment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Verify the specific EMI terms with {page.shortName} admissions before enrolling. Some universities apply coupon discounts to lump-sum payment only, not to semester-wise or EMI plans. Our admission desk will clarify the exact terms for the {year} batch during your free enrollment call.
          </p>
        </section>

        {/* What this coupon does NOT include */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>What This Coupon Does Not Include</h2>
          <ul className="text-sm text-slate-600 space-y-1.5">
            {page.exclusions.map((e, i) => <li key={i}>- {e}</li>)}
          </ul>
        </section>

        {/* Comparison vs peers */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>{page.shortName} Discount vs Other Universities</h2>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                <th className="px-4 py-2.5 text-left font-semibold text-slate-700">University</th>
                <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Max Coupon Savings</th>
              </tr></thead>
              <tbody>
                <tr className="bg-amber-50">
                  <td className="px-4 py-2 font-bold text-amber-700">{page.shortName}</td>
                  <td className="px-4 py-2 font-bold text-amber-700">{page.maxSavings} via {page.couponCode}</td>
                </tr>
                {page.peerComparisons.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-2 text-slate-700">{p.uni.replace(/\s*\(Rs\s*[\d,.+L]+\)/, '')}</td>
                    <td className="px-4 py-2 text-slate-600">{p.savings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to apply */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Best Time to Apply the {page.couponCode} Coupon Code</h2>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>January Intake: Enroll in November or December</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.shortName} runs a January intake each year. To redeem the {page.couponCode} coupon for the January batch, complete enrollment between mid-November and mid-December. The coupon refresh cycle aligns with the start of each calendar month, so the same Rs {tierMax.toLocaleString('en-IN')} max value applies across both months.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>July Intake: Enroll in May or June</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The July {year} intake is the larger of the two batches at {page.shortName}. Time your enrollment so the fee invoice is generated on a Tuesday or Saturday in May or June to lock in the Rs {tierMax.toLocaleString('en-IN')} maximum coupon value.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>Time Your Final Invoice on a Tuesday or Saturday</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The single most actionable timing tip: schedule the final fee invoice generation on a Tuesday or Saturday in IST. That single decision moves the coupon value from Rs {tierBase.toLocaleString('en-IN')} to Rs {tierMax.toLocaleString('en-IN')} - a difference of Rs {(tierMax - tierBase).toLocaleString('en-IN')} for zero extra effort. The countdown at the top of this page shows the next max window.
          </p>
        </section>

        {/* Who should and shouldn't use this coupon */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Is {page.shortName} Online MBA Right for You?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Before using a coupon code, make sure {page.shortName} is the right university for your career goal. A discount should not be the primary reason you choose a university. The right programme at full price will deliver better ROI than the wrong programme at a discount.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-bold text-green-800 mb-2">Good fit if:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>- You want NAAC {page.naac} accreditation on your degree</li>
                <li>- You are a working professional who needs weekend-only classes</li>
                <li>- You want a UGC-DEB approved degree valid for jobs and higher studies</li>
                <li>- {page.shortName} offers the specialisation that fits your career goal</li>
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800 mb-2">Consider alternatives if:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>- You need the most budget-friendly option (<Link href="/coupons/ignou-online-mba-discount-coupon-2026" className="underline">explore IGNOU</Link>)</li>
                <li>- You need campus-style placement drives</li>
                <li>- You want a specific specialisation not offered by {page.shortName}</li>
                <li>- You need a physical campus experience</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our <Link href="/compare" className="text-amber-700 underline">free comparison tool</Link> lets you compare {page.shortName} against any other UGC-DEB university by NIRF rank, specialisations, and placement data. If you are unsure, our admission desk will help you decide before you apply any coupon code. We earn zero commissions from any university, so our advice is genuinely neutral.
          </p>
        </section>

        {/* FAQs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f2756' }}>Frequently Asked Questions -- {page.shortName} Online MBA Coupon {year}</h2>
          <div className="space-y-3">
            {page.faqs.map((faq, i) => (
              <details key={i} className="rounded-xl border border-slate-200 bg-white">
                <summary className="px-5 py-3 text-sm font-semibold cursor-pointer" style={{ color: '#0f2756' }}>{faq.q}</summary>
                <p className="px-5 pb-4 text-sm text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Slug-conditional end-of-page hard close — MUJ coupon */}
        {slug === MUJ_COUPON_SLUG && <MujCouponEndCta />}

        {/* Related content */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Related Content</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href={`/blog/${page.blogSlug}`} className="rounded-xl border border-slate-200 bg-white p-4 no-underline hover:border-amber-400 transition-colors block">
              <p className="text-xs text-amber-600 font-bold uppercase mb-1">Blog Review</p>
              <p className="text-sm font-bold" style={{ color: '#0f2756' }}>{page.shortName} Online MBA Review {year}</p>
            </Link>
            <Link href={`/universities/${page.universityId}`} className="rounded-xl border border-slate-200 bg-white p-4 no-underline hover:border-amber-400 transition-colors block">
              <p className="text-xs text-amber-600 font-bold uppercase mb-1">University Page</p>
              <p className="text-sm font-bold" style={{ color: '#0f2756' }}>{page.universityName} -- Full Profile</p>
            </Link>
            <Link href="/coupons" className="rounded-xl border border-slate-200 bg-white p-4 no-underline hover:border-amber-400 transition-colors block">
              <p className="text-xs text-amber-600 font-bold uppercase mb-1">All Coupons</p>
              <p className="text-sm font-bold" style={{ color: '#0f2756' }}>View All 26 Discount Codes</p>
            </Link>
            <Link href="/compare" className="rounded-xl border border-slate-200 bg-white p-4 no-underline hover:border-amber-400 transition-colors block">
              <p className="text-xs text-amber-600 font-bold uppercase mb-1">Side-by-Side Comparison</p>
              <p className="text-sm font-bold" style={{ color: '#0f2756' }}>Compare {page.shortName} with Other UGC-DEB Universities</p>
            </Link>
          </div>
        </section>

        {/* Trust footer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-xs text-slate-500">EdifyEdu earns zero referral commissions from {page.universityName}. All coupon information is verified against official university sources. Updated monthly.</p>
        </div>

        {/* Buried legal disclaimer */}
        <div className="mt-12 pt-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            <strong className="text-slate-500">Disclosure and terms.</strong> edifyedu.in is an independent advisory and comparison platform. The discount coupon codes shown on this page represent enrollment-time fee adjustments coordinated by our admission desk during the enrollment process for the {year} batch and are not official discount offers issued, endorsed, sponsored, or administered by {page.universityName} or any of its affiliates. The coupon amounts (Rs {tierMax.toLocaleString('en-IN')} on Tuesday and Saturday in IST and Rs {tierBase.toLocaleString('en-IN')} on other days) are indicative for the current monthly cycle and may be revised, suspended, or withdrawn at any time without prior notice. Final acceptance, applicability, and amount of the discount at enrollment are at the sole discretion of the {page.universityName} admissions team and subject to verification of student details, programme availability, batch quotas, and applicable university policies in effect at the time of enrollment. University-administered scholarships (merit, defence, divyaang, sports, alumni, and similar categories) are separate from this coupon, are governed independently by {page.universityName}, and should be verified directly with the university via {page.officialUrl}. Coupon discounts are not transferable, not redeemable for cash, and cannot be combined with other third-party coupon codes for the same programme. Programme fees, accreditation status, and other figures referenced are sourced from publicly available university communications and are believed to be accurate at the time of publishing. Students are advised to independently verify all fees, accreditation, and discount applicability on the official {page.universityName} portal before making any payment. All trademarks, university names, and logos referenced are the property of their respective owners and used here for identification and comparison purposes only. By revealing or using a coupon code, you acknowledge these terms.
          </p>
        </div>
      </div>
    </>
  )
}
