import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BadgeCheck, Tag, Clock, ExternalLink, Phone } from 'lucide-react'
import { getCouponPage, COUPON_PAGE_SLUGS, type CouponPageData } from '@/lib/coupon-pages'
import { getExpiryISO, getTodaysBonus, TIER_AMOUNTS } from '@/lib/coupons'
import CouponPageCTA from '@/components/CouponPageCTA'
import CouponCountdown from '@/components/CouponCountdown'
import CouponScarcityBanner from '@/components/CouponScarcityBanner'

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
    ? `${page.shortName} Online MBA Fee ${year} — Rs ${page.totalFeeNum.toLocaleString('en-IN')} (Lowest in India) | edifyedu.in`
    : `${page.shortName} Online MBA Enrollment Bonus ${year} — Up to ${tierLabel} via edifyedu.in (${page.couponCode})`
  const description = page.couponCode === 'N/A'
    ? `${page.shortName} Online MBA fee is ${page.totalFee} — the lowest base fee from a NAAC A++ university. No enrollment bonus needed. Stack with SC/ST or category concessions. Verified for ${year}.`
    : `${page.shortName} Online MBA fee is ${page.totalFee}. Mention code ${page.couponCode} on your edifyedu.in advisor call for up to ${tierLabel} enrollment bonus (Tuesday and Saturday IST). University scholarships remain available on top. NAAC ${page.naac} accredited.`

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${page.shortName} online MBA enrollment bonus`,
      `${page.shortName} MBA fee ${year}`,
      `${page.couponCode} edifyedu`,
      `${page.shortName} online MBA fees`,
      `${page.shortName} online MBA scholarship`,
      `online MBA enrollment bonus India ${year}`,
      `${page.universityName} fee adjustment`,
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
    name: `${page.universityName} Online MBA ${year} Discount`,
    description: `Up to ${page.maxSavings} off via verified discount code and stackable scholarships`,
    price: page.totalFeeNum - page.maxSavingsNum,
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
    'Connect with our EdifyEdu counsellor on a free call or WhatsApp',
    `Mention the discount coupon code you received: ${page.couponCode}`,
    'Share your basic details (name, contact, eligibility) with the counsellor',
    `Counsellor verifies your eligibility and coordinates with ${page.shortName} admissions to apply the discount`,
    'You receive the reduced fee invoice before making any payment',
    'Complete the enrollment at the discounted fee, fully guided by your counsellor',
  ]

  // HowTo schema — strong AEO signal for "how to apply X coupon" queries.
  // Mirrors the visible 6-step section so AI search engines pull verbatim.
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Apply ${page.couponCode} Coupon for ${page.shortName} Online MBA ${year}`,
    description: `Six-step application flow to claim the verified ${page.couponCode} discount on ${page.universityName} Online MBA, save up to ${page.maxSavings}, and pay ${page.finalFee}.`,
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
    description: `UGC-DEB approved 2-year online MBA from ${page.universityName} (NAAC ${page.naac}). Programme fee ${page.totalFee}. With ${page.couponCode} plus scholarships, save up to ${page.maxSavings}.`,
    provider: { '@type': 'CollegeOrUniversity', name: page.universityName, sameAs: page.officialUrl },
    offers: {
      '@type': 'Offer',
      price: page.totalFeeNum - page.maxSavingsNum,
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
            ? `${page.universityName} Online MBA Fee ${year} - ${page.totalFee} (Lowest Base Fee)`
            : `${page.universityName} Online MBA Enrollment Bonus ${year} - Up to Rs ${tierMax.toLocaleString('en-IN')} via edifyedu.in`}
        </h1>

        {/* Scarcity banner + countdown */}
        {page.couponCode !== 'N/A' && (
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center mb-6">
            <CouponScarcityBanner tier={page.tier} fullWidth />
            <CouponCountdown tier={page.tier} variant="card" />
          </div>
        )}

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total Fee</p>
            <p className="text-lg font-extrabold" style={{ color: '#0f2756' }}>{page.totalFee}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-xs text-green-600 mb-1">Max Savings</p>
            <p className="text-lg font-extrabold text-green-700">{page.maxSavings}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-xs text-amber-600 mb-1">Final Fee</p>
            <p className="text-lg font-extrabold text-amber-700">{page.finalFee}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Accreditation</p>
            <p className="text-sm font-bold" style={{ color: '#0f2756' }}>NAAC {page.naac} · {page.nirf}</p>
          </div>
        </div>

        {/* Fee Breakdown Calculator */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f2756' }}>Your Fee Breakdown: See Exactly What You Pay</h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">

            {/* Row 1: Published Fee */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Fee</span>
                <p className="text-sm text-slate-600 mt-0.5">Official programme fee on {page.shortName} portal</p>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: '#0f2756' }}>{page.totalFee}</span>
            </div>

            {/* Row 2: University's Own Discount */}
            {(() => {
              const uniDiscount = page.discounts.find(d =>
                !d.type.toLowerCase().includes('edify') &&
                !d.type.toLowerCase().includes('defence') &&
                !d.type.toLowerCase().includes('divyaang') &&
                !d.type.toLowerCase().includes('merit') &&
                !d.type.toLowerCase().includes('alumni')
              )
              if (!uniDiscount) return null
              const savingText = uniDiscount.saving.match(/Rs\s*[\d,]+/)?.[0] || uniDiscount.saving
              const afterText = uniDiscount.saving.match(/pay\s*(Rs\s*[\d,]+)/i)?.[1]
              return (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-green-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">1</span>
                      <span className="text-sm font-bold text-green-800">{page.shortName} gives you {uniDiscount.type}</span>
                    </div>
                    {afterText && <p className="text-xs text-green-600 mt-1 ml-8">Fee drops to {afterText}</p>}
                    {!afterText && <p className="text-xs text-green-600 mt-1 ml-8">{uniDiscount.eligibility}</p>}
                  </div>
                  <span className="text-lg font-bold text-green-700">- {savingText}</span>
                </div>
              )
            })()}

            {/* Row 3: edifyedu.in Tier-based Bonus */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">2</span>
                  <span className="text-sm font-bold text-amber-800">
                    Rs {liveBonus.amount.toLocaleString('en-IN')} edifyedu.in enrollment bonus {liveBonus.isMaxWindow ? '(max window active)' : '(base amount today)'}
                  </span>
                </div>
                <p className="text-xs text-amber-600 mt-1 ml-8">
                  Mention code <strong>{page.couponCode}</strong> on the advisor call. Up to Rs {tierMax.toLocaleString('en-IN')} on Tuesday and Saturday in IST, Rs {tierBase.toLocaleString('en-IN')} on other days.
                </p>
              </div>
              <span className="text-lg font-bold text-amber-700">- Rs {liveBonus.amount.toLocaleString('en-IN')}</span>
            </div>

            {/* Final Fee */}
            <div className="flex items-center justify-between px-6 py-5" style={{ background: '#0f2756' }}>
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">You Actually Pay</span>
                <p className="text-sm text-white/60 mt-0.5">University discount + edifyedu.in bonus applied</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-white/40 line-through mr-2">{page.totalFee}</span>
                <span className="text-3xl font-extrabold text-white">{page.finalFee}</span>
              </div>
            </div>

            {/* Savings badge */}
            <div className="px-6 py-3 bg-green-600 text-center">
              <span className="text-sm font-bold text-white">Total savings: {page.maxSavings}. That is money you keep.</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">
            University discount requires one-time payment. edifyedu.in bonus applied during enrollment. Verify fees on {page.officialUrl}.
          </p>
        </section>

        {/* CTA - Reveal code */}
        <CouponPageCTA page={page} />

        {/* Phone CTA - direct counsellor call */}
        {page.couponCode !== 'N/A' && (
          <div className="mb-8 -mt-2 text-center">
            <a
              href={`tel:${COUNSELLOR_TEL}`}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-6 py-3 rounded-xl no-underline transition-colors"
            >
              <Phone className="w-4 h-4" />
              Or call edifyedu.in counsellor: {COUNSELLOR_TEL_DISPLAY}
            </a>
          </div>
        )}

        {/* Editorial intro - substantial for SEO */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>What Discount Opportunities Actually Exist at {page.shortName} in {year}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.shortName} offers multiple fee concession pathways for online MBA students in {year}. These include payment-plan discounts, merit-based scholarships, category-specific waivers, and verified EdifyEdu codes. The savings listed below are based on publicly available university scholarship programmes and verified fee structures from the official {page.shortName} portal.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The total programme fee for {page.universityName} Online MBA is {page.totalFee}. However, very few students actually pay this full amount. Through a combination of payment-plan optimisation, merit scholarships, and verified discount codes, most students reduce their effective fee by {page.maxSavings} or more. The key is understanding which discounts you qualify for and how to stack them correctly.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.universityName} holds NAAC {page.naac} accreditation and is UGC-DEB approved for online degree programmes. The online MBA degree is legally equivalent to a campus MBA under UGC 2020 regulations. Per UGC (Online Programmes) Regulations 2018, the degree certificate clearly identifies the programme as "Online" mode — this is the regulator's design and does not affect legal validity. It is valid for UPSC, banking exams, PSU recruitment, and all private-sector employment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Most "coupon codes" for online MBA programmes are not retail coupons. They represent university-administered fee concessions: lump-sum payment discounts that save 5-12%, merit scholarships that waive 10-30% of the fee, early-bird offers with 15-30% additional savings, and category-specific waivers for defence personnel, divyaang candidates, and alumni. Understanding these categories helps you maximise your total savings before you even claim the edifyedu.in enrollment bonus.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <p className="text-xs text-amber-800"><strong>Important clarification:</strong> the enrollment bonus shown on this page is from edifyedu.in, not from {page.universityName}. It is a tiered amount (this university is in the <strong>{page.tier}</strong> tier — up to Rs {tierMax.toLocaleString('en-IN')} on Tuesday and Saturday, Rs {tierBase.toLocaleString('en-IN')} on other days, IST). University scholarships (merit, defence, lump-sum discounts) listed above are separate and come directly from the university. Both can be availed together. Verify university-specific scholarships on {page.officialUrl}.</p>
          </div>
        </section>

        {/* Why discounts matter */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Why {page.shortName} Online MBA Fee Discounts Matter</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            An online MBA is a significant investment. At {page.totalFee}, {page.shortName} is positioned in the {page.totalFeeNum > 250000 ? 'premium' : page.totalFeeNum > 150000 ? 'mid-range' : 'affordable'} segment of online MBA pricing in India. For context, online MBA fees across UGC-DEB approved universities range from Rs 66,000 (IGNOU) to Rs 3,70,000 (Symbiosis without scholarship). Every rupee saved on fees is a rupee that improves your MBA return on investment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The average mid-career professional investing in an online MBA expects a 20-40% salary increase over 3-5 years post-completion. At {page.shortName}, with a {page.maxSavings} discount reducing your effective investment to {page.finalFee}, your breakeven period shortens by 3-6 months. This makes the financial case for the MBA stronger and reduces the risk of the investment not paying off.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            There are three types of students who benefit most from coupon codes: working professionals who can pay lump-sum and save on processing fees, recent graduates with 60%+ marks who qualify for automatic merit scholarships, and defence personnel or divyaang candidates who qualify for category-specific waivers of 20-100%. If you fall into any of these categories, the savings are real and worth pursuing.
          </p>
        </section>

        {/* All discount types table */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>All Discount Types Available at {page.shortName}</h2>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Discount Type</th>
                <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Eligibility</th>
                <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Saving</th>
              </tr></thead>
              <tbody>
                {page.discounts.map((d, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-2 font-medium text-slate-700">{d.type}</td>
                    <td className="px-4 py-2 text-slate-600">{d.eligibility}</td>
                    <td className="px-4 py-2 text-amber-700 font-semibold">{d.saving}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How to stack */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>How to Stack Discounts for Maximum Savings</h2>
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm text-green-800 leading-relaxed">{page.stackExample}</p>
          </div>
        </section>

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

        {/* Scholarship details */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Scholarships Available at {page.shortName} for Online MBA {year}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Beyond coupon codes, {page.universityName} offers several scholarship categories that can significantly reduce your fee. These scholarships are administered by the university directly and do not require an EdifyEdu code. However, in many cases, you can stack a university scholarship with an EdifyEdu code for maximum savings.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>1. Merit-Based Scholarship (10-20% Fee Waiver)</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Merit-based scholarships are the most common. If you scored 60% or above in your graduation, you likely qualify for a 10-20% fee waiver at most universities including {page.shortName}. The scholarship is evaluated automatically during the admission process. You do not need to apply separately. Simply upload your graduation marksheets and the university admissions team will assess your eligibility.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>2. Defence Personnel Waiver (15-20% Fee Waiver)</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Defence personnel (serving and retired), JCOs, and their dependents typically receive 15-20% fee waivers at {page.shortName}. Documentation required: defence ID card or service record. The waiver applies once and stacks with the EdifyEdu enrollment bonus.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>3. Divyaang Candidate Waiver (Up to 100% Fee Waiver)</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Divyaang (differently-abled) candidates with 40% or higher disability certificate may receive up to 100% fee waiver. {page.shortName} reviews the disability certificate during admission. This waiver is non-stackable but covers the full programme fee for qualifying candidates.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>4. Sports Achiever and Alumni Discount (5-10%)</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Sports achievers at national or state level may receive performance-based waivers. Alumni of the same university group often receive 5-10% additional discounts. Check with the {page.shortName} admissions team for the complete list of active scholarship categories for the {year} batch.
          </p>
        </section>

        {/* EMI compatibility */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>EMI + Discount Compatibility at {page.shortName}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{page.emiCompatible}</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Most students wonder whether coupon discounts work with EMI plans. The answer at most universities is yes. The discount reduces your total programme fee first, and the reduced amount is then split into monthly EMI instalments. This means you benefit from both: a lower total fee AND the convenience of monthly payments.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            However, verify the specific terms with {page.shortName} admissions before enrolling. Some universities apply the discount to the lump-sum option only, not to the semester-wise or EMI plans. Our EdifyEdu advisor will clarify the exact EMI terms for your chosen university during the free counselling call.
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
                  <td className="px-4 py-2 font-bold text-amber-700">{page.shortName} ({page.totalFee})</td>
                  <td className="px-4 py-2 font-bold text-amber-700">{page.maxSavings} via {page.couponCode}</td>
                </tr>
                {page.peerComparisons.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-2 text-slate-700">{p.uni}</td>
                    <td className="px-4 py-2 text-slate-600">{p.savings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to apply */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Best Time to Apply for {page.shortName} Online MBA Discount</h2>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>January Intake — Apply in November to December</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.shortName} runs a January intake each year. Early-bird discounts, when available, are typically highest 4-6 weeks before the intake deadline. Applying between mid-November and mid-December gives you the best chance of securing the maximum January-batch discount.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>July Intake — Apply in May to June</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The July {year} intake is the larger of the two batches. Early-bird windows usually open in May and tighten in late June. Applying between mid-May and mid-June ensures you lock in the early-bird scholarship plus the active EdifyEdu coupon code.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>Do Not Wait if the Current Offer is Already Strong</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            University fee structures change between batches, and a discount available today may not be available next month. The EdifyEdu advisor will tell you honestly whether the current discount is the best available or if waiting makes sense for your specific university and batch.
          </p>

          <h3 className="text-base font-bold mb-2 mt-5" style={{ color: '#0f2756' }}>Stacking Order for Maximum Savings</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            To maximise your savings, follow this order: (1) check if you qualify for merit scholarship based on graduation marks, (2) decide between lump-sum and semester-wise payment, (3) ask about any active early-bird or seasonal offer, (4) apply the EdifyEdu verified code on top. This four-step stacking approach consistently delivers the highest savings across all universities we work with.
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
                <li>- Your budget is around {page.totalFee}</li>
                <li>- You are a working professional who needs weekend-only classes</li>
                <li>- You want UGC-DEB approved degree valid for jobs and higher studies</li>
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800 mb-2">Consider alternatives if:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>- Budget is under Rs 1 lakh (<Link href="/coupons/ignou-online-mba-discount-coupon-2026" className="underline">IGNOU at Rs 66K</Link>)</li>
                <li>- You need campus-style placement drives</li>
                <li>- You want a specific specialisation not offered by {page.shortName}</li>
                <li>- You need a physical campus experience</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our <Link href="/compare" className="text-amber-700 underline">free comparison tool</Link> lets you compare {page.shortName} against any other UGC-DEB university by fees, NIRF rank, specialisations, and placement data. If you are unsure, our advisor will help you decide before you apply any coupon code. We earn zero commissions from any university, so our advice is genuinely neutral.
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
            <Link href="/blog/online-mba-fee-comparison-india-2026" className="rounded-xl border border-slate-200 bg-white p-4 no-underline hover:border-amber-400 transition-colors block">
              <p className="text-xs text-amber-600 font-bold uppercase mb-1">Fee Guide</p>
              <p className="text-sm font-bold" style={{ color: '#0f2756' }}>Online MBA Fee Comparison India {year}</p>
            </Link>
          </div>
        </section>

        {/* Trust footer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-xs text-slate-500">EdifyEdu earns zero referral commissions from {page.universityName}. All discount information is verified against official university sources. Updated monthly.</p>
        </div>
      </div>
    </>
  )
}
