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

        {/* Editorial intro */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>What Discount Opportunities Actually Exist at {page.shortName}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {page.shortName} offers multiple fee concession pathways for online MBA students. These include payment-plan discounts, merit-based scholarships, category-specific waivers, and verified EdifyEdu codes. The savings listed below are based on publicly available university scholarship programmes and verified fee structures.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <p className="text-xs text-amber-800"><strong>Honest disclaimer:</strong> EdifyEdu does not have a commercial referral relationship with {page.universityName}. The coupon codes shared here are publicly-available university scholarships, peer-to-peer referral codes, and verified payment-plan discounts. Cross-check the latest offers on {page.officialUrl} before applying.</p>
          </div>
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

        {/* EMI compatibility */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>EMI + Discount Compatibility</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{page.emiCompatible}</p>
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

        {/* FAQs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f2756' }}>Frequently Asked Questions -- {page.shortName} Coupon</h2>
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
