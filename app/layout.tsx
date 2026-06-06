import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import Navbar from '@/components/Navbar'
import { EntryPopup, ExitIntentPopup } from '@/components/LeadCapture'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import MobileLeadNudge from '@/components/MobileLeadNudge'
import MetaPixelEvents from '@/components/MetaPixelEvents'

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
    default: 'Online Universities India 2026: 125+ UGC-DEB Ranked | EdifyEdu',
    template: '%s | EdifyEdu',
  },
  description: '125+ UGC-DEB online universities ranked by NIRF & NAAC: verified fees ₹35K-5L, real placement data. Zero paid rankings. Check eligibility free at EdifyEdu.',
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
    title: 'edifyedu.in',
  },
  openGraph: {
    siteName: 'edifyedu.in',
    type: 'website',
    locale: 'en_IN',
    title: 'Online Universities India 2026: 125+ UGC-DEB Ranked | EdifyEdu',
    description: '125+ UGC-DEB online universities ranked by NIRF & NAAC: verified fees ₹35K-5L, real placement data. Zero paid rankings. Check eligibility free at EdifyEdu.',
    url: 'https://edifyedu.in',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: "edifyedu.in: India's honest guide to online degrees" }],
  },
  twitter: { card: 'summary_large_image', site: '@edifyedu', title: 'Online Universities India 2026: 125+ UGC-DEB Ranked | EdifyEdu', description: '125+ UGC-DEB online universities ranked by NIRF & NAAC: verified fees ₹35K-5L, real placement data. Zero paid rankings. Check eligibility free.' },
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
  name: 'edifyedu.in',
  url: 'https://edifyedu.in',
  logo: {
    '@type': 'ImageObject',
    url: 'https://edifyedu.in/logos/edify_logo_192.png',
    width: 192,
    height: 192,
  },
  description: 'Independent guide to UGC DEB approved online degrees in India. edifyedu.in',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://www.linkedin.com/company/edifyeducation',
    'https://www.instagram.com/edifyedu.in/',
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
  name: 'edifyedu.in',
  url: 'https://edifyedu.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://edifyedu.in/universities?search={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

// Author Person schema — anchors E-E-A-T signals for AI citation. Articles
// and blog posts can reference this Person via { author: { '@id': '...' } }
// without redefining bio/credentials per page.
const authorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://edifyedu.in/#rishi-kumar',
  name: 'Rishi Kumar',
  url: 'https://edifyedu.in/about',
  image: 'https://edifyedu.in/authors/rishi-avatar-md.svg',
  jobTitle: 'Senior Education Researcher',
  worksFor: { '@type': 'Organization', name: 'EdifyEdu', url: 'https://edifyedu.in' },
  affiliation: { '@type': 'Organization', name: 'EdifyEdu', url: 'https://edifyedu.in' },
  description: 'Founder of EdifyEdu and senior education researcher focused on UGC-DEB approved online degrees in India. Independent comparisons, no paid rankings.',
  knowsAbout: [
    'Online MBA in India',
    'UGC DEB approved online degrees',
    'NAAC accreditation',
    'NIRF rankings',
    'Distance education',
    'Online MCA, BBA, BCA, B.Com programmes',
  ],
  sameAs: [
    'https://www.linkedin.com/company/edifyeducation',
    'https://www.instagram.com/edifyedu.in/',
  ],
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
        <meta name="apple-mobile-web-app-title" content="edifyedu.in" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="edifyedu.in" />
        {/* Structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }} />

        {/* Microsoft Clarity — heatmaps & session recordings */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wh450hu192");`,
          }}
        />
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1006417241759882');fbq('track','PageView');`,
          }}
        />
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
          className="pb-20 lg:pb-0"
        >
          {children}
        </main>
        <Footer />
        <BottomNav />
        <MobileLeadNudge />
        <Suspense fallback={null}>
          <MetaPixelEvents />
        </Suspense>
        {/* ── Google Analytics 4 + Google Ads (afterInteractive = non-blocking) ── */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}', { page_path: window.location.pathname });
              gtag('config', 'AW-17380291250');
            `}</Script>
          </>
        )}
      </body>
    </html>
  )
}
