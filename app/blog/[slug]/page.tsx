import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata, ResolvingMetadata } from 'next'
import { Clock, Calendar, ChevronRight, Hash, BookOpen } from 'lucide-react'
import { getBlogPost, getPublishedPosts } from '@/lib/blog'
import { getSlimById } from '@/lib/data-slim'
import BlogLeadForm from '@/components/BlogLeadForm'
import BlogSidebarForm from '@/components/BlogSidebarForm'
import BlogClientActions from '@/components/BlogClientActions'
import BlogTOC from '@/components/BlogTOC'

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
  return html.replace(
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
  if (!post) return {}

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${post.title} | Edify Blog`,
    description: post.metaDescription,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Edify Admissions Team'],
      images: [...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
    },
    alternates: {
      canonical: `https://edifyedu.in/blog/${post.slug}`,
    },
  }
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  const posts = getPublishedPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// ── Page component ────────────────────────────────────────────────────────────

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
    author: {
      '@type': 'Organization',
      name: 'Edify Admissions Team',
      url: 'https://edifyedu.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Edify',
      url: 'https://edifyedu.in',
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
      {/* ── Inline prose styles ───────────────────────────────────────── */}
      <style>{`
        .prose-article { font-size: 16px; line-height: 1.8; color: #334155; }
        .prose-article h2 { font-size: 1.5rem; font-weight: 800; color: #0B1D35; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #D4922A; display: inline-block; }
        .prose-article h3 { font-size: 1.15rem; font-weight: 700; color: #0B1D35; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-article p { margin-bottom: 1.25rem; }
        .prose-article ul, .prose-article ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .prose-article li { margin-bottom: 0.5rem; }
        .prose-article strong { color: #0B1D35; font-weight: 700; }
        .prose-article a { color: #C8811A; text-decoration: underline; }
        .prose-article table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 14px; }
        .prose-article th { background: #0B1D35; color: #fff; padding: 10px 14px; text-align: left; font-size: 13px; }
        .prose-article td { padding: 10px 14px; border-bottom: 1px solid #E2E8F4; }
        .prose-article tr:nth-child(even) td { background: #F8FAFC; }
        .prose-article .callout-key { background: rgba(200,129,26,0.08); border-left: 4px solid #C8811A; padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 1.5rem 0; font-size: 15px; }
        .prose-article .callout-warning { background: rgba(234,179,8,0.08); border-left: 4px solid #EAB308; padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 1.5rem 0; font-size: 15px; }
        .prose-article .callout-info { background: rgba(37,99,235,0.06); border-left: 4px solid #2563EB; padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 1.5rem 0; font-size: 15px; }

        /* ── Pull quote ─────────────────────────────────────────────── */
        .prose-article .pull { border-left: 4px solid #16a34a; background: #f0fdf4; padding: 16px 20px; margin: 2rem 0; font-size: 1.05rem; font-style: italic; color: #166534; border-radius: 0 10px 10px 0; }

        /* ── EMI block ──────────────────────────────────────────────── */
        .prose-article .emi-block { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 2rem 0; }
        .prose-article .emi-block h3 { color: #15803d; margin-top: 0; margin-bottom: 0.75rem; font-size: 1.1rem; }
        .prose-article .emi-block p { color: #166534; margin-bottom: 1rem; }
        .prose-article .emi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin: 1.25rem 0; }
        .prose-article .emi-pill { background: #16a34a; color: #fff; border-radius: 8px; padding: 12px 14px; font-size: 13px; line-height: 1.5; display: flex; flex-direction: column; gap: 2px; }
        .prose-article .emi-pill strong { font-size: 14px; font-weight: 700; display: block; }
        .prose-article .emi-note { font-size: 12.5px; color: #15803d; margin: 0; }

        /* ── CTA lead-capture block ─────────────────────────────────── */
        .prose-article .cta-block { background: linear-gradient(135deg, #0B1D35 0%, #14532d 100%); border-radius: 14px; padding: 32px 28px; margin: 2.5rem 0; color: #fff; }
        .prose-article .cta-block h3 { color: #fff; margin-top: 0; margin-bottom: 0.5rem; font-size: 1.25rem; }
        .prose-article .cta-block p { color: rgba(255,255,255,0.85); margin-bottom: 1rem; }
        .prose-article .cta-block p.sub { font-size: 14.5px; }
        .prose-article .cta-block ul { padding-left: 1.25rem; margin-bottom: 1.5rem; }
        .prose-article .cta-block li { color: rgba(255,255,255,0.9); margin-bottom: 0.4rem; font-size: 14px; }
        .prose-article .cta-form { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1.25rem; }
        .prose-article .cta-form input[type="text"],
        .prose-article .cta-form input[type="tel"] { flex: 1 1 180px; padding: 11px 14px; border-radius: 8px; border: none; font-size: 14px; background: rgba(255,255,255,0.12); color: #fff; outline: none; }
        .prose-article .cta-form input[type="text"]::placeholder,
        .prose-article .cta-form input[type="tel"]::placeholder { color: rgba(255,255,255,0.5); }
        .prose-article .cta-form input[type="text"]:focus,
        .prose-article .cta-form input[type="tel"]:focus { background: rgba(255,255,255,0.2); }
        .prose-article .cta-form button { padding: 11px 22px; border-radius: 8px; border: none; background: #16a34a; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; white-space: nowrap; }
        .prose-article .cta-form button:hover { background: #15803d; }
        .prose-article .cta-note { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 0.75rem; margin-bottom: 0; }

        /* ── Internal link pills ────────────────────────────────────── */
        .prose-article .ilink { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 0.75rem 0; font-size: 14px; color: #334155; }
        .prose-article .ilink a { color: #C8811A; text-decoration: none; font-weight: 600; }
        .prose-article .ilink a:hover { text-decoration: underline; }
      `}</style>

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
                  ED
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#0B1D35' }}>Edify Admissions Team</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D4922A' }}>
                    Expert Verified
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

              {/* Article content */}
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6">
                <div
                  className="prose-article"
                  dangerouslySetInnerHTML={{ __html: contentWithIds }}
                />
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

              {/* Lead form */}
              <BlogSidebarForm postTitle={post.title} compact />

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
                                NIRF #{u.nirf}
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
