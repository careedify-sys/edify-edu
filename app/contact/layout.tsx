import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Contact edifyedu.in, Free Counselling for Online Degrees' },
  description: 'Speak with an education advisor at edifyedu.in for free. Get unbiased guidance on online MBA, MCA, BBA and BCA programs from 130+ UGC-DEB approved universities. No spam, no paid referrals.',
  keywords: 'contact edifyedu, education advisor india, online mba guidance, free counselling online degree',
  alternates: { canonical: 'https://edifyedu.in/contact' },
  openGraph: {
    title: 'Contact edifyedu.in, Free Counselling for Online Degrees',
    description: 'Speak with an education advisor for free. Unbiased guidance on online MBA, MCA, BBA and BCA from 130+ UGC-DEB approved universities.',
    url: 'https://edifyedu.in/contact',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Contact EdifyEdu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact edifyedu.in, Free Counselling for Online Degrees',
    description: 'Free guidance, no spam, no paid referrals. We help you find the right online degree honestly.',
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'edifyedu.in',
  url: 'https://edifyedu.in',
  logo: 'https://edifyedu.in/logos/edify_logo_192.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-7061285806',
    contactType: 'customer service',
    email: 'hello@edifyedu.in',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [],
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      {children}
    </>
  )
}
