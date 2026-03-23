import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Edify — Expert Guidance for Online Degrees in India',
  description: 'Talk to our counsellors for free. We help you pick the right online degree — no spam, no pressure, no paid referrals. Call, email, or WhatsApp.',
  keywords: 'contact edify, education advisor india, online mba guidance, education advisor india',
  alternates: { canonical: 'https://edifyedu.in/contact' },
  openGraph: {
    title: 'Contact Edify — Expert Guidance for Online Degrees in India',
    description: 'Talk to our counsellors for free. No spam, no pressure. We help you find the right online degree honestly.',
    url: 'https://edifyedu.in/contact',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Contact Edify' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Edify — Expert Guidance for Online Degrees in India',
    description: 'Free counselling, no spam, no pressure. We help you find the right online degree.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
