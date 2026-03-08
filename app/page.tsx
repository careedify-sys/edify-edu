import type { Metadata } from 'next'
import HomePage from './page-wrapper'

export const metadata: Metadata = {
  title: 'Edify — Find Your Online Degree | Zero Paid Rankings | India',
  description: 'Compare 106+ UGC DEB approved online universities in India. Real fees, NIRF rankings, zero paid rankings. Find the best online MBA, MCA, BBA, BCA — free counselling.',
  alternates: { canonical: 'https://www.edifyedu.in/' },
  openGraph: {
    title: 'Edify — Find Your Online Degree | Zero Paid Rankings | India',
    description: 'Compare 106+ UGC DEB approved online universities. Real fees, NIRF rankings, zero paid rankings.',
    url: 'https://www.edifyedu.in',
    images: [{ url: 'https://www.edifyedu.in/og.png', width: 1200, height: 630 }],
  },
}

export default function Page() {
  return <HomePage />
}