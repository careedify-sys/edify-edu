import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingCTA from '@/components/FloatingCTA'
import BottomNav from '@/components/BottomNav'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0B1D35',
}

export const metadata: Metadata = {
  title: {
    default: 'Edify — UGC Approved Online Degrees. Honest Reviews. Zero Paid Rankings.',
    template: '%s | Edify — edifyedu.in',
  },
  description: 'Compare 106+ UGC DEB approved online universities in India. Real fees, NIRF rankings, honest comparisons. Online MBA, MCA, BBA, BCA. Zero paid rankings.',
  keywords: [
    'online degree India', 'UGC approved online MBA', 'UGC DEB approved universities',
    'online MCA India', 'online BBA', 'distance education India', 'NIRF ranked online MBA',
    'best online MBA India 2025', 'online degree for government jobs', 'NMIMS online MBA',
    'Manipal online MBA', 'Symbiosis online', 'LPU online degree', 'Amity online',
  ],
  metadataBase: new URL('https://www.edifyedu.in'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Edify',
  },
  openGraph: {
    siteName: 'Edify — edifyedu.in',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: 'https://www.edifyedu.in/og.png', width: 1200, height: 630, alt: "Edify — India's honest guide to online degrees" }],
  },
  twitter: { card: 'summary_large_image', site: '@edifyedu' },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://www.edifyedu.in' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* PWA — installable as native app on Android/iOS */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Edify" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Edify" />
        {/* Structured data — Organization */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Edify',
          url: 'https://www.edifyedu.in',
          logo: 'https://www.edifyedu.in/logo.png',
          description: 'Independent guide to UGC DEB approved online degrees in India',
          contactPoint: { '@type': 'ContactPoint', telephone: '+91-7061285806', contactType: 'customer service', availableLanguage: ['English', 'Hindi'] },
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Edify',
          url: 'https://www.edifyedu.in',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.edifyedu.in/universities?search={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        })}} />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} className="pb-16 sm:pb-0">{children}</main>
        <Footer />
        <FloatingCTA />
        <BottomNav />
      </body>
    </html>
  )
}