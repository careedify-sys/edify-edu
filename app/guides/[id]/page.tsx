import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getGuideById, GUIDES } from '@/lib/guides'

type Props = { params: Promise<{ id: string }> | { id: string } }

export async function generateStaticParams() {
  return GUIDES.map(g => ({ id: g.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params instanceof Promise ? await params : params
  const guide = getGuideById(id)
  if (!guide) return { title: 'Guide Not Found' }

  return {
    title: guide.seoTitle,
    description: guide.metaDescription,
    keywords: [guide.targetKeyword, 'online mba india 2026', 'ugc deb approved', guide.tag.toLowerCase()],
    alternates: { canonical: `https://edifyedu.in/guides/${guide.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${guide.seoTitle} | Edify`,
      description: guide.metaDescription,
      url: `https://edifyedu.in/guides/${guide.id}`,
      type: 'article',
      authors: ['Rishi Kumar'],
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${guide.seoTitle} | Edify`,
      description: guide.metaDescription,
      images: ['https://edifyedu.in/og.webp'],
    },
  }
}

export default async function GuidePage({ params }: Props) {
  const { id } = params instanceof Promise ? await params : params
  const guide = getGuideById(id)
  if (!guide) notFound()

  const otherGuides = GUIDES.filter(g => g.id !== id).slice(0, 3)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    author: {
      '@type': 'Person',
      name: 'Rishi Kumar',
      url: 'https://edifyedu.in/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Edify',
      url: 'https://edifyedu.in',
      logo: { '@type': 'ImageObject', url: 'https://edifyedu.in/logos/edify_logo_192.png', width: 192, height: 192 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://edifyedu.in/guides/${guide.id}` },
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://edifyedu.in/guides' },
      { '@type': 'ListItem', position: 3, name: guide.title, item: `https://edifyedu.in/guides/${guide.id}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="page-shell">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-border py-7">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-4">
              <Link href="/" className="hover:text-amber transition-colors no-underline">Home</Link>
              <span>›</span>
              <Link href="/guides" className="hover:text-amber transition-colors no-underline">Guides</Link>
              <span>›</span>
              <span className="text-ink-2">{guide.tag}</span>
            </div>
            <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-2">{guide.tag}</div>
            <h1 className="font-display text-[clamp(1.3rem,2.5vw,1.9rem)] font-extrabold text-navy leading-tight mb-4 mt-0">
              {guide.title}
            </h1>
            {/* Author + meta row */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold shrink-0">
                RK
              </div>
              <div>
                <div className="text-sm font-semibold text-navy leading-none mb-0.5">Rishi Kumar</div>
                <div className="text-xs text-ink-3">Edify Admissions Research · {guide.readTime} · Updated April 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <article
            className="prose prose-sm sm:prose max-w-none"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />

          {/* CTA */}
          <div className="mt-8 rounded-2xl border border-amber/30 bg-amber/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-navy text-sm mb-1">Ready to compare universities?</div>
              <p className="text-xs text-ink-3 m-0">See fees, NIRF ranks, and syllabi for 127+ UGC DEB approved universities.</p>
            </div>
            <Link
              href="/universities"
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white no-underline hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))' }}
            >
              Browse Universities →
            </Link>
          </div>

          {/* Other guides */}
          {otherGuides.length > 0 && (
            <div className="mt-10">
              <div className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-4">More Guides</div>
              <div className="flex flex-col gap-3">
                {otherGuides.map(g => (
                  <Link key={g.id} href={`/guides/${g.id}`} className="no-underline group">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-amber transition-all">
                      <span className="text-xl shrink-0">{g.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-navy group-hover:text-amber transition-colors leading-snug">{g.title}</div>
                        <div className="text-xs text-ink-3 mt-0.5">{g.readTime}</div>
                      </div>
                      <span className="text-amber text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link href="/guides" className="text-sm font-semibold text-amber no-underline hover:opacity-80">
              ← All Guides
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const revalidate = 86400
