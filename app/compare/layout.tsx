import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Online MBA India 2026 — Fees, Rankings & ROI | Edify',
  description: 'Side-by-side comparison of 127+ UGC approved online universities in India 2026. Compare MBA, MCA, BBA fees, NIRF rankings, and placement data for working professionals.',
  keywords: [
    'compare online mba india', 'online mba fees comparison 2026', 'best online university in india 2026',
    'compare ugc approved online degree', 'online degree roi calculator', 'compare amity vs manipal online mba',
  ],
  alternates: {
    canonical: 'https://edifyedu.in/compare',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
