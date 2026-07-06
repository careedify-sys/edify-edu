import type { Metadata } from 'next'
import EMICalculatorClient from './EMICalculatorClient'

export const metadata: Metadata = {
  title: { absolute: 'Education Loan EMI Calculator 2026 — Online MBA, MCA, BBA | Edify' },
  description:
    'Free education loan EMI calculator for online MBA, MCA, BBA courses. Calculate monthly EMI at 8-12% interest. UGC-DEB approved universities eligible for SBI, HDFC & Axis bank loans.',
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
      'Free EMI calculator for online degree education loans. Calculate monthly payments at 8-12% interest for UGC-DEB approved programs.',
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is education loan EMI calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EMI is calculated using the formula: EMI = P x R x (1+R)^N / ((1+R)^N - 1), where P is the loan principal, R is the monthly interest rate, and N is the tenure in months. For a Rs 1.5 lakh loan at 10% for 24 months, the EMI is approximately Rs 6,917.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get an education loan for an online MBA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Banks such as SBI, HDFC Credila, and Axis Bank offer education loans for online MBA programs from UGC-DEB approved universities. Loan amounts typically range from Rs 50,000 to Rs 10 lakh depending on the university and program.',
      },
    },
    {
      '@type': 'Question',
      name: 'What interest rate do banks charge for online degree loans?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Interest rates for online degree education loans typically range from 8% to 12% per annum. Rates vary by bank, loan amount, and your credit profile. SBI education loans start around 8.15%, while private banks may charge 10-12%.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is collateral required for an online MBA education loan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For loan amounts up to Rs 7.5 lakh, most banks do not require collateral. Loans above Rs 7.5 lakh may require collateral or a co-applicant guarantee. Since most online MBA programs cost between Rs 1-4 lakh, collateral is rarely needed.',
      },
    },
  ],
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Education Loan EMI Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: 'https://edifyedu.in/tools/emi-calculator',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free EMI calculator for education loans on online MBA, MCA, BBA and BCA programs from UGC-DEB approved universities in India.',
  author: { '@type': 'Organization', name: 'edifyedu.in', url: 'https://edifyedu.in' },
}

export default function EMICalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <EMICalculatorClient />
    </>
  )
}
