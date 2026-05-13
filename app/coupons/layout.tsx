import type { Metadata } from 'next'
import { COUPONS } from '@/lib/coupons'
import { COUPONS_HUB_FAQS } from './faqs'

const universityCount = new Set(COUPONS.map(c => c.universityId)).size

export const metadata: Metadata = {
  title: `Online MBA Enrollment Bonus 2026 — Up to Rs 7,500 from edifyedu.in | ${universityCount} Universities`,
  description:
    `Tiered enrollment bonus from edifyedu.in across ${universityCount} UGC DEB online MBA and MCA universities. Maximum amount (Rs 4,000 to Rs 7,500) unlocks every Tuesday and Saturday in IST. Stack with university scholarships on top.`,
  keywords: [
    'online mba enrollment bonus', 'edifyedu bonus', 'online mba fees',
    'nmims online mba fees', 'amity online mba fees', 'symbiosis online mba fees',
    'online mba coupon code', 'amity university online coupon', 'nmims online coupon',
    'online mba fee discount india', 'lpu online mba offer', 'manipal online mba coupon',
    'online mba discount 2026', 'tuesday saturday mba bonus',
  ],
  openGraph: {
    title: `Online MBA Enrollment Bonus 2026 — Up to Rs 7,500 from edifyedu.in`,
    description:
      `Tiered enrollment bonus from edifyedu.in across ${universityCount} UGC DEB universities. Max unlocks every Tuesday and Saturday IST. Stack with university scholarships on top.`,
    url: 'https://edifyedu.in/coupons',
    type: 'website',
  },
  alternates: {
    canonical: 'https://edifyedu.in/coupons',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: COUPONS_HUB_FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
}

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
