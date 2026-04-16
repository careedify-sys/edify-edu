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
    default: 'Online Universities in India 2026 | Compare Fees & Programs | EdifyEdu',
    template: '%s | Edify',
  },
  description: 'Compare 125+ UGC DEB approved online universities in India 2026. Check NIRF ranks, fees & placements. Zero paid rankings. Free expert guidance.',
  keywords: [
    'online mba india 2026', 'best online mba india', 'online mba for working professionals',
    'ugc deb approved online degree', 'nirf ranked online mba', 'naac a++ online university',
    'online degree for government jobs', 'online bba 2026', 'online bca course 2026',
    'amity online mba', 'amity university online mba', 'manipal online mba', 'lpu online mba',
    'chandigarh university online', 'jain online mba', 'symbiosis online mba',
    'dy patil online mba', 'nmims online mba', 'best online mba colleges in india',
    'top 10 mba colleges in india', 'mba for working professionals', 'online mca course',
    'online degree courses', 'best online courses in india', 'ugc approved courses',
    'best private colleges in india', 'best government colleges in india',
    'online programs india 2026', 'distance education india', 'online learning india',
    'courses after graduation', 'courses after 12th', 'best course after graduation',
    'top private university in india for mba', 'best management colleges in india',
    'online mba for working professionals india', 'part time mba india',
    'online degree valid for government jobs india', 'ugc deb approved list',
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
    title: 'Online Universities in India 2026 | Compare Fees & Programs | EdifyEdu',
    description: 'Compare 125+ UGC DEB approved online universities in India 2026. Check NIRF ranks, fees & placements. Zero paid rankings. Free expert guidance.',
    url: 'https://edifyedu.in',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: "Edify — India's honest guide to online degrees" }],
  },
  twitter: { card: 'summary_large_image', site: '@edifyedu', title: 'Online Universities in India 2026 | Compare Fees & Programs | EdifyEdu', description: 'Compare 100+ UGC-DEB approved online universities in India. Check fees, syllabus, placements and choose the best program for you.' },
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
  logo: {
    '@type': 'ImageObject',
    url: 'https://edifyedu.in/logos/edify_logo_192.png',
    width: 192,
    height: 192,
  },
  description: 'Independent guide to UGC DEB approved online degrees in India',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://www.linkedin.com/company/edifyeducation',
    'https://www.instagram.com/_edifyeducation',
    'https://youtube.com/@edify_edu',
  ],
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
