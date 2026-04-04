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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    author: { '@type': 'Organization', name: 'Edify', url: 'https://edifyedu.in' },
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
        {/* Header */}
        <div className="bg-white border-b border-border py-7">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-4">
              <Link href="/" className="hover:text-amber transition-colors no-underline">Home</Link>
              <span>›</span>
              <Link href="/guides" className="hover:text-amber transition-colors no-underline">Guides</Link>
              <span>›</span>
              <span className="text-ink-2">{guide.tag}</span>
            </div>
            <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-2">{guide.tag}</div>
            <h1 className="text-[clamp(1.3rem,2.5vw,1.9rem)] font-extrabold text-navy leading-tight mb-3 mt-0">{guide.title}</h1>
            <p className="text-sm text-ink-3 mb-0">{guide.readTime} · Updated 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <article
            className="prose prose-sm sm:prose max-w-none"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />

          {/* Bottom nav */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <Link href="/guides" className="text-sm font-semibold text-amber no-underline hover:opacity-80">
              ← All Guides
            </Link>
            <Link
              href="/universities"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white no-underline hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))' }}
            >
              Compare Universities →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const revalidate = 86400
