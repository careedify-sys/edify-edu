import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { Metadata, ResolvingMetadata } from 'next'
import { Clock, Calendar, ChevronRight, Hash, BookOpen } from 'lucide-react'
import { getBlogPost, getPublishedPosts } from '@/lib/blog'
import { BLOG_QUICK_FACTS } from '@/lib/blog-quick-facts'
import { getSlimById } from '@/lib/data-slim'
import BlogLeadForm from '@/components/BlogLeadForm'
import BlogClientActions from '@/components/BlogClientActions'
import BlogTOC from '@/components/BlogTOC'
import BlogSidebarWidgets from '@/components/BlogSidebarWidgets'
import BlogContentWithCTAs from '@/components/BlogContentWithCTAs'

// ── Server-side helpers ───────────────────────────────────────────────────────

function extractHeadings(html: string): { id: string; text: string; level: 2 | 3 }[] {
  const results: { id: string; text: string; level: 2 | 3 }[] = []
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 2 | 3
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    const id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 60)
    results.push({ id, text, level })
  }
  return results
}

function addHeadingIds(html: string): string {
  // First convert any <h1> in content to <h2> to prevent duplicate H1
  const noH1 = html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, '<h2$1>$2</h2>')
  return noH1.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, level, attrs, content) => {
      const text = content.replace(/<[^>]+>/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 60)
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }> | { slug: string }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params instanceof Promise ? await params : params
  const post = getBlogPost(slug)
  // Explicit noindex for missing/draft posts — prevents inheriting the homepage
  // canonical from root layout, which caused Screaming Frog to flag these as
  // "canonicalised to homepage + noindex" when a wrong slug was linked internally
  if (!post || post.status !== 'published') {
    return { robots: { index: false, follow: false } }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: { absolute: post.seoTitle || post.title },
    description: post.metaDescription,
    keywords: post.tags,
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: [post.author || 'Rishi Kumar'],
      images: [
        { url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: post.title },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: ['https://edifyedu.in/og.webp'],
    },
    alternates: {
      canonical: `https://edifyedu.in/blog/${post.slug}`,
    },
  }
}

export const dynamicParams = true
export const revalidate = 60

export async function generateStaticParams() {
  const posts = getPublishedPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// ── Page component ────────────────────────────────────────────────────────────

// Online MCA slugs now served directly from /blog/ (redirected from /online-mca/ via next.config.js)

export default async function BlogPostPage({ params }: Props) {
  const { slug } = params instanceof Promise ? await params : params

  const post = getBlogPost(slug)

  if (!post || post.status !== 'published') return notFound()

  const relatedUnis = post.relatedUniversities
    .map((id) => getSlimById(id))
    .filter(Boolean)

  const otherPosts = getPublishedPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3)

  const contentWithIds = addHeadingIds(post.content)
  const headings = extractHeadings(post.content)

  const postUrl = `https://edifyedu.in/blog/${post.slug}`

  const publishedLabel = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // ── JSON-LD schemas ─────────────────────────────────────────────────────────

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: {
      '@type': 'ImageObject',
      url: 'https://edifyedu.in/og.webp',
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Person',
      name: post.author || 'Rishi Kumar',
      url: 'https://edifyedu.in/about#team',
      jobTitle: post.author === 'Komal Srivastava' ? 'Senior Education Counsellor' : 'Founder & Lead Researcher',
      description: post.author === 'Komal Srivastava'
        ? '7+ years in higher education counselling. Specialises in reviewing online MBA programs and helping working professionals choose programs aligned with their career goals.'
        : 'Education researcher and data analyst focused on India\'s online higher education sector. 7+ years advising students on degree choices.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Edify',
      url: 'https://edifyedu.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://edifyedu.in/logos/edify_logo_192.png',
        width: 192,
        height: 192,
      },
    },
    keywords: post.tags.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://edifyedu.in/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }

  return (
    <>
      {/* ── JSON-LD ────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen" style={{ background: '#F7F8FA' }}>

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
            <nav className="flex items-center flex-wrap gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-amber transition-colors no-underline font-medium">
                Home
              </Link>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <Link href="/blog" className="hover:text-amber transition-colors no-underline font-medium">
                Blog
              </Link>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <span
                className="text-navy font-semibold truncate max-w-[200px] sm:max-w-xs"
                title={post.title}
              >
                {post.title.length > 55 ? post.title.slice(0, 55) + '…' : post.title}
              </span>
            </nav>
          </div>
        </div>

        {/* ── Hero / article header ─────────────────────────────────────── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

            {/* Category + tag badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(212,146,42,0.1)', color: '#D4922A', border: '1px solid rgba(212,146,42,0.25)' }}
              >
                {post.category}
              </span>
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#F0F3F8', color: '#3B5068', border: '1px solid #E2E8F4' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* H1 */}
            <h1
              className="font-display font-extrabold leading-tight tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#0B1D35' }}
            >
              {post.title}
            </h1>

            {/* Subtitle / meta description */}
            <p className="text-lg leading-relaxed mb-6 font-medium" style={{ color: '#3B5068' }}>
              {post.metaDescription}
            </p>

            {/* Author + meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-border">
              {/* Avatar + name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                  style={{ background: 'linear-gradient(135deg,#D4922A,#e0a93a)', color: '#0B1D35' }}
                >
                  {(post.author || 'Rishi Kumar').split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <Link href="/about#team" className="text-sm font-bold no-underline hover:underline" style={{ color: '#0B1D35' }}>{post.author || 'Rishi Kumar'}</Link>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D4922A' }}>
                    Senior Education Researcher
                  </div>
                </div>
              </div>

              {/* Divider */}
              <span className="hidden sm:block w-px h-8 bg-border" />

              {/* Published date */}
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64788A' }}>
                <Calendar size={13} style={{ color: '#D4922A' }} />
                <span>Published {publishedLabel}</span>
              </div>

              {/* Read time */}
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64788A' }}>
                <Clock size={13} style={{ color: '#D4922A' }} />
                <span>{post.readTime} min read</span>
              </div>

              {/* Target keyword badge */}
              {post.targetKeyword && (
                <div
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                  style={{ background: '#F0F3F8', color: '#3B5068' }}
                >
                  <Hash size={10} />
                  {post.targetKeyword}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content area ─────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT: article ─────────────────────────────────────────── */}
            <article className="flex-1 min-w-0">

              {/* Key Highlights box */}
              {post.faqs.length > 0 && (
                <div
                  className="rounded-2xl p-5 mb-6"
                  style={{
                    background: 'rgba(212,146,42,0.07)',
                    border: '1px solid rgba(212,146,42,0.25)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: '#D4922A', fontSize: '1rem' }}>✦</span>
                    <span
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: '#D4922A' }}
                    >
                      Key Highlights
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {post.faqs.slice(0, 3).map((faq) => (
                      <li key={faq.q} className="flex items-start gap-2 text-sm" style={{ color: '#3B5068' }}>
                        <span className="text-green-500 mt-0.5 shrink-0 font-bold">✓</span>
                        <span>{faq.q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mobile TOC */}
              <BlogTOC headings={headings} mobile />

              {/* Article content — split at CTA tokens to inject React components */}
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6">
                <BlogContentWithCTAs html={contentWithIds} />
              </div>

              {/* In-article lead form */}
              <section className="mb-6">
                <BlogLeadForm title={post.ctaTitle} desc={post.ctaDesc} />
              </section>

              {/* Tags strip */}
              <div className="bg-white rounded-2xl border border-border p-5 mb-6 flex flex-wrap gap-2 items-center">
                <span
                  className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mr-1"
                  style={{ color: '#3B5068' }}
                >
                  <Hash size={13} style={{ color: '#D4922A' }} />
                  Tags:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: '#F0F3F8', color: '#3B5068', border: '1px solid #E2E8F4' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* FAQs + share + feedback */}
              <BlogClientActions
                faqs={post.faqs}
                postTitle={post.title}
                postUrl={postUrl}
              />

              {/* From Our Guides — links to /guides/* pages to break content silo */}
              <div className="mt-6 bg-white rounded-2xl border border-border p-5">
                <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#D4922A' }}>
                  From Our Guides
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Is Online Degree Valid in India?', href: '/guides/is-online-degree-valid-india' },
                    { title: 'Online MBA for Government Jobs', href: '/guides/online-mba-for-government-jobs' },
                    { title: 'How to Check UGC DEB Approval', href: '/guides/how-to-check-ugc-deb-approval' },
                  ].map(g => (
                    <Link
                      key={g.href}
                      href={g.href}
                      className="block text-xs font-semibold no-underline hover:underline"
                      style={{ color: '#0B1D35' }}
                    >
                      {g.title} →
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related articles */}
              {otherPosts.length > 0 && (
                <div className="mt-8">
                  <h2
                    className="text-xl font-extrabold mb-5 flex items-center gap-2"
                    style={{ color: '#0B1D35' }}
                  >
                    <BookOpen size={18} style={{ color: '#D4922A' }} />
                    Related Guides
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {otherPosts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="group block bg-white rounded-2xl border border-border p-4 hover:border-amber/50 hover:shadow-md transition-all no-underline"
                        style={{ '--tw-shadow-color': 'rgba(212,146,42,0.15)' } as React.CSSProperties}
                      >
                        <div
                          className="text-[10px] font-black uppercase tracking-widest mb-2"
                          style={{ color: '#D4922A' }}
                        >
                          {p.category}
                        </div>
                        <h3
                          className="text-sm font-bold leading-snug mb-2 group-hover:text-amber transition-colors"
                          style={{ color: '#0B1D35' }}
                        >
                          {p.title}
                        </h3>
                        <div
                          className="flex items-center gap-1.5 text-[11px] font-medium"
                          style={{ color: '#64788A' }}
                        >
                          <Clock size={10} />
                          {p.readTime} min read
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* ── RIGHT: sticky sidebar ─────────────────────────────────── */}
            <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 space-y-5">

              {/* Desktop TOC */}
              <BlogTOC headings={headings} />

              {/* Talk to Alumnus + Program Details — hidden on mobile (in-article form handles mobile) */}
              <div className="hidden lg:contents">
                <BlogSidebarWidgets postTitle={post.title} quickFacts={BLOG_QUICK_FACTS[post.slug]} />
              </div>

              {/* Related universities */}
              {relatedUnis.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-4">
                  <h3
                    className="text-[10px] font-black uppercase tracking-[0.2em] mb-3"
                    style={{ color: '#D4922A' }}
                  >
                    Featured Institutions
                  </h3>
                  <div className="space-y-2">
                    {relatedUnis.map(
                      (u) =>
                        u && (
                          <Link
                            key={u.id}
                            href={`/universities/${u.id}`}
                            className="group flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-amber/40 hover:bg-slate-50 transition-all no-underline"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 border border-border">
                              <img
                                src={u.logo}
                                alt={u.abbr}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <div
                                className="text-xs font-bold truncate group-hover:text-amber transition-colors"
                                style={{ color: '#0B1D35' }}
                              >
                                {u.name}
                              </div>
                              <div
                                className="text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: '#D4922A' }}
                              >
                                {u.nirf > 0 && u.nirf < 900 ? `NIRF #${u.nirf}` : 'UGC Approved'}
                              </div>
                            </div>
                          </Link>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* More reading */}
              {otherPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-4">
                  <h3
                    className="text-[10px] font-black uppercase tracking-[0.2em] mb-3"
                    style={{ color: '#D4922A' }}
                  >
                    Continue Reading
                  </h3>
                  <div className="space-y-3">
                    {otherPosts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="block group no-underline"
                      >
                        <div
                          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                          style={{ color: '#D4922A' }}
                        >
                          {p.category}
                        </div>
                        <h4
                          className="text-xs font-bold leading-snug group-hover:text-amber transition-colors"
                          style={{ color: '#0B1D35' }}
                        >
                          {p.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>

          </div>
        </div>

        {/* ── Footer CTA ────────────────────────────────────────────────── */}
        <footer className="bg-white border-t border-border mt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
            <h2
              className="font-display font-extrabold mb-4"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#0B1D35' }}
            >
              Master Your Career Strategy
            </h2>
            <p className="mb-8 max-w-2xl mx-auto text-base" style={{ color: '#3B5068' }}>
              Every guide on Edify is built from real student data and expert insights.
              Stop guessing — start building your future today.
            </p>
            <Link
              href="/universities"
              className="inline-flex py-3.5 px-8 rounded-2xl font-black text-sm no-underline transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#D4922A,#e0a93a)', color: '#0B1D35' }}
            >
              Explore All Online Degree Programs
            </Link>
          </div>
        </footer>

      </div>
    </>
  )
}
