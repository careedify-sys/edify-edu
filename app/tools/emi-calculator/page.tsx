import type { Metadata } from 'next'
import EMICalculatorClient from './EMICalculatorClient'

export const metadata: Metadata = {
  title: { absolute: 'Education Loan EMI Calculator 2026 — Online MBA, MCA, BBA | Edify' },
  description:
    'Free education loan EMI calculator for online MBA, MCA, BBA courses. Calculate monthly EMI at 8–12% interest. UGC-DEB approved universities eligible for SBI, HDFC & Axis bank loans.',
  keywords: [
    'education loan emi calculator',
    'online mba emi calculator',
    'online mba education loan',
    'mba education loan emi',
    'online degree loan emi',
    'ugc deb approved education loan',
    'online mba loan calculator',
    'mca education loan emi',
  ],
  alternates: { canonical: 'https://edifyedu.in/tools/emi-calculator' },
  openGraph: {
    title: 'Education Loan EMI Calculator — Online MBA, MCA, BBA 2026 | Edify',
    description:
      'Free EMI calculator for online degree education loans. Calculate monthly payments at 8–12% interest for UGC-DEB approved programs.',
    url: 'https://edifyedu.in/tools/emi-calculator',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Education Loan EMI Calculator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Education Loan EMI Calculator — Online MBA, MCA 2026 | Edify',
    description: 'Free EMI calculator for online degree education loans. UGC-DEB approved universities.',
  },
}

export default function EMICalculatorPage() {
  return <EMICalculatorClient />
}
