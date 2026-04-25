import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BadgeCheck, Tag, Clock, ExternalLink } from 'lucide-react'
import { getCouponPage, COUPON_PAGE_SLUGS, type CouponPageData } from '@/lib/coupon-pages'
import { getExpiryISO } from '@/lib/coupons'
import CouponPageCTA from '@/components/CouponPageCTA'

export const revalidate = 3600

export function generateStaticParams() {
  return COUPON_PAGE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { slug } = params instanceof Promise ? await params : params
  const page = getCouponPage(slug)
  if (!page) return { title: 'Not Found' }

  const title = `${page.shortName} Online MBA Coupon Code 2026 -- Save ${page.maxSavings} | EdifyEdu`
  const description = `Verified ${page.shortName} Online MBA discount coupon for 2026. Save up to ${page.maxSavings} with merit scholarship + lump-sum payment. NAAC ${page.naac}. Independent recommendations.`

  return {
    title,
    description,
    alternates: { canonical: `https://edifyedu.in/coupons/${page.slug}` },
    openGraph: { title, description, url: `https://edifyedu.in/coupons/${page.slug}`, type: 'article' },
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {offerSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
          {page.universityName} MBA Discount Coupon Code {year} -- Save {page.maxSavings} (Verified)
        </h1>

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

        {/* CTA - Reveal code */}
        <CouponPageCTA page={page} />

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
            {page.universityName} holds NAAC {page.naac} accreditation and is UGC-DEB approved for online degree programmes. The online MBA degree is legally equivalent to a campus MBA under UGC 2020 regulations. The degree certificate does not mention "online" or "distance" mode. It is valid for UPSC, banking exams, PSU recruitment, and all private-sector employment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Most "coupon codes" for online MBA programmes are not retail coupons. They represent university-administered fee concessions: lump-sum payment discounts that save 5-12%, merit scholarships that waive 10-30% of the fee, early-bird offers with 15-30% additional savings, and category-specific waivers for defence personnel, divyaang candidates, and alumni. Understanding these categories helps you maximise your total savings before you even apply a coupon code.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <p className="text-xs text-amber-800"><strong>Honest disclaimer:</strong> EdifyEdu does not have a commercial referral relationship with {page.universityName}. The coupon codes shared here are publicly-available university scholarships, peer-to-peer referral codes, and verified payment-plan discounts. We recommend cross-checking the latest offers on {page.officialUrl} before making any payment. All fees and discount amounts are indicative and subject to change by the university.</p>
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
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>How to Apply the Coupon Code</h2>
          <div className="space-y-3">
            {[
              `Visit the official ${page.shortName} portal at ${page.officialUrl}`,
              'Click Apply Now and fill your basic details',
              'Complete the application and pay the application fee',
              `Contact your EdifyEdu advisor and mention code ${page.couponCode}`,
              'Advisor coordinates with university admissions to apply the discount',
              'You receive the reduced fee invoice before making payment',
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">{i + 1}</span>
                <p className="text-sm text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scholarship details */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Scholarships Available at {page.shortName} for Online MBA {year}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Beyond coupon codes, {page.universityName} offers several scholarship categories that can significantly reduce your fee. These scholarships are administered by the university directly and do not require an EdifyEdu code. However, in many cases, you can stack a university scholarship with an EdifyEdu code for maximum savings.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Merit-based scholarships are the most common. If you scored 60% or above in your graduation, you likely qualify for a 10-20% fee waiver at most universities including {page.shortName}. The scholarship is evaluated automatically during the admission process. You do not need to apply separately. Simply upload your graduation marksheets and the university admissions team will assess your eligibility.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Defence personnel (serving and retired), JCOs, and their dependents typically receive 15-20% fee waivers. Divyaang (differently-abled) candidates may receive up to 100% fee waiver with valid documentation. Sports achievers at national or state level may receive performance-based waivers. Alumni of the same university group often receive 5-10% additional discounts. Check with the {page.shortName} admissions team for the complete list of active scholarship categories.
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
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Most online MBA universities including {page.shortName} run two intake windows per year: January and July. Early-bird discounts, when available, are typically highest 4-6 weeks before the intake deadline. If you are planning to enrol in the July {year} batch, applying in May or June gives you the best chance of securing maximum discounts.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            However, do not wait for a better discount if the current offer is already strong. University fee structures change between batches, and a discount available today may not be available next month. The EdifyEdu advisor will tell you honestly whether the current discount is the best available or if waiting makes sense for your specific university and batch.
          </p>
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
