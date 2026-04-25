import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online MBA Enrollment Bonus 2026 -- Rs 10,000 Off via EdifyEdu | 26 Universities',
  description:
    'Get Rs 10,000 EdifyEdu enrollment bonus on online MBA or MCA at 26 UGC-DEB universities. This bonus is from EdifyEdu, not the university. Stack with university scholarships for extra savings.',
  keywords: [
    'online mba fees', 'nmims online mba fees', 'amity online mba fees', 'symbiosis online mba fees',
    'online mba coupon code', 'amity university online coupon', 'nmims online coupon',
    'online mba fee discount india', 'lpu online mba offer', 'manipal online mba coupon',
    'edifyedu bonus', 'online mba discount 2026',
  ],
  openGraph: {
    title: 'Online MBA Enrollment Bonus 2026 -- Rs 10,000 from EdifyEdu | EdifyEdu',
    description:
      'Rs 10,000 EdifyEdu enrollment bonus on 26 UGC-DEB universities. Separate from university scholarships. Stack both for maximum savings.',
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
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the EdifyEdu enrollment bonus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EdifyEdu provides a flat Rs 10,000 enrollment bonus when you enroll in an online MBA or MCA through our advisor. This bonus is from EdifyEdu, not from the university. Universities may offer their own separate scholarships on top.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the EdifyEdu bonus work with university scholarships?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'They are independent. University scholarships (merit, defence, lump-sum discounts) come from the university. The Rs 10,000 EdifyEdu bonus comes from EdifyEdu. You can receive both. For example, MUJ offers 15% upfront discount (Rs 27,000) from the university, plus Rs 10,000 from EdifyEdu.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the EdifyEdu bonus available on all universities?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Rs 10,000 EdifyEdu enrollment bonus is available on all 26 universities listed on this page. Mention your coupon code during the free advisor call.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use the EdifyEdu bonus with EMI payment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The bonus reduces your total fee first, and you pay the remaining balance via EMI. Your advisor will clarify the exact EMI terms for your chosen university.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this discount from the university or from EdifyEdu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Rs 10,000 bonus is from EdifyEdu, not from the university. EdifyEdu provides this as an enrollment incentive. Universities offer their own separate scholarships which you can avail on top of the EdifyEdu bonus.',
      },
    },
  ],
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
