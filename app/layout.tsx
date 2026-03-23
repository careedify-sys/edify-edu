import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { EntryPopup, ExitIntentPopup } from '@/components/LeadCapture'
import Footer from '@/components/Footer'
import FloatingCTA from '@/components/FloatingCTA'
import BottomNav from '@/components/BottomNav'

// ── Fonts loaded via next/font (auto-optimised, no layout shift) ─────────
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: 'var(--ink)',
}

export const metadata: Metadata = {
  title: {
    default: 'Edify — Online MBA India 2026 | Compare 127+ UGC Approved Online Universities',
    template: '%s | Edify',
  },
  description: 'Compare 127+ UGC DEB approved online universities in India 2026. Online MBA from ₹60K. Get real NIRF rankings, syllabus, & fees. Admissions close Oct 15–30, 2026.',
  keywords: [
    'online mba india 2026', 'best online mba india', 'online mba for working professionals',
    'ugc deb approved online degree', 'nirf ranked online mba', 'naac a++ online university',
    'online degree for government jobs', 'online bba 2026', 'online bca course 2026',
    'amity online mba', 'manipal online mba', 'lpu online mba',
  ],
  metadataBase: new URL('https://edifyedu.in'),
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
    title: 'Edify — Online MBA India 2026 | Compare 127+ UGC Approved Online Universities',
    description: 'Compare 127+ UGC DEB approved online universities in India 2026. Online MBA from ₹60K. Real NIRF rankings, syllabus & fees. No paid placements.',
    url: 'https://edifyedu.in',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: "Edify — India's honest guide to online degrees" }],
  },
  twitter: { card: 'summary_large_image', site: '@edifyedu', title: 'Edify — Online MBA India 2026', description: 'Compare 127+ UGC DEB approved online universities. No paid rankings.' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://edifyedu.in' },
  icons: {
    icon: [
      { url: '/favicon.ico',         sizes: 'any' },
      { url: '/favicon.svg',         type: 'image/svg+xml' },
      { url: '/favicon_16x16.png',   sizes: '16x16',   type: 'image/png' },
      { url: '/favicon_32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/favicon_64x64.png',   sizes: '64x64',   type: 'image/png' },
      { url: '/favicon_192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon_512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon_192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

// ── Schema.org structured data ────────────────────────────────────────────
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Edify',
  url: 'https://edifyedu.in',
  logo: 'https://edifyedu.in/logo.png',
  description: 'Independent guide to UGC DEB approved online degrees in India',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-7061285806',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
}

const siteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Edify',
  url: 'https://edifyedu.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://edifyedu.in/universities?search={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon_192x192.png" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Edify" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Edify" />
        {/* Structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />

        {/* ── Google Analytics 4 + Google Ads ───────────────────── */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}', {
                page_path: window.location.pathname,
              });
              gtag('config', 'AW-17380291250');
            `}} />
          </>
        )}
      </head>
      <body>
        {/* Skip-navigation for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-navy focus:rounded-lg focus:shadow-lg focus:font-bold"
        >
          Skip to main content
        </a>
        {/* EntryPopup removed — fires before user sees content, hurts UX */}
        <ExitIntentPopup />
        <Navbar />
        <main
          id="main-content"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          className="pb-16 sm:pb-0"
        >
          {children}
        </main>
        <Footer />
        <FloatingCTA />
        <BottomNav />
      </body>
    </html>
  )
}
