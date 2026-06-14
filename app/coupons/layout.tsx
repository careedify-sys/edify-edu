import type { Metadata } from 'next'
import { COUPONS } from '@/lib/coupons'

const universityCount = new Set(COUPONS.map(c => c.universityId)).size

export const metadata: Metadata = {
  title: `Online MBA Discount Coupons 2026 - Up to Rs 5,000 Off | ${universityCount} Universities`,
  description:
    `Verified online MBA discount coupon codes for ${universityCount} UGC-DEB approved universities. Up to Rs 5,000 off (Tuesday and Saturday IST), Rs 4,000 on other days. No paperwork, applied at enrollment.`,
  keywords: [
    'online mba discount coupon 2026', 'online mba coupon code',
    'online mba discount india', 'online mba coupon code 2026',
    'nmims online mba coupon', 'amity online mba coupon', 'symbiosis online mba coupon',
    'amity university online coupon', 'nmims online discount',
    'online mba fee discount india', 'lpu online mba offer', 'manipal online mba coupon',
    'online mba offer 2026', 'best online mba discount', 'mba fee discount code',
    'online mba special offer', 'mba coupon code india',
  ],
  openGraph: {
    title: `Online MBA Discount Coupons 2026 - Up to Rs 5,000 Off`,
    description:
      `Verified online MBA discount coupons across ${universityCount} UGC-DEB universities. Up to Rs 5,000 off on Tuesday and Saturday IST. No paperwork required.`,
    url: 'https://edifyedu.in/coupons',
    type: 'website',
  },
  alternates: {
    canonical: 'https://edifyedu.in/coupons',
  },
}

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
