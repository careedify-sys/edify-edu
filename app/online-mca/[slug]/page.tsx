import { notFound } from 'next/navigation'
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

// Slugs served under /online-mca/
const ONLINE_MCA_SLUGS = ['online-mca-course-india', 'amity-online-mca-fees-review']

function extractHeadings(html: string): { id: string; text: string; level: 2 | 3 }[] {
  const results: { id: string; text: string; level: 2 | 3 }[] = []
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 2 | 3
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)
    results.push({ id, text, level })
  }
  return results
}

function addHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, level, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim()
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`
  })
}

type Props = { params: Promise<{ slug: string }> | { slug: string } }

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = params instanceof Promise ? await params : params
  if (!ONLINE_MCA_SLUGS.includes(slug)) return {}
  const post = getBlogPost(slug)
  if (!post) return {}
  const previousImages = (await parent).openGraph?.images || []
  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription,
    keywords: post.tags,
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: ['Rishi Kumar'],
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: post.title }, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: ['https://edifyedu.in/og.webp'],
    },
    alternates: { canonical: `https://edifyedu.in/online-mca/${slug}` },
  }
}

export const dynamicParams = false
export const revalidate = false

export async function generateStaticParams() {
  return ONLINE_MCA_SLUGS.map((slug) => ({ slug }))
}

export default async function OnlineMcaPostPage({ params }: Props) {
  const { slug } = params instanceof Promise ? await params : params
  if (!ONLINE_MCA_SLUGS.includes(slug)) return notFound()
  const post = getBlogPost(slug)
  if (!post || post.status !== 'published') return notFound()

  const relatedUnis = post.relatedUniversities.map((id) => getSlimById(id)).filter(Boolean)
  const otherPosts = getPublishedPosts().filter((p) => p.slug !== slug).slice(0, 3)
  const contentWithIds = addHeadingIds(post.content)
  const headings = extractHeadings(post.content)
  const postUrl = `https://edifyedu.in/online-mca/${post.slug}`

  const publishedLabel = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

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
    image: { '@type': 'ImageObject', url: 'https://edifyedu.in/og.webp', width: 1200, height: 630 },
    author: { '@type': 'Person', name: 'Rishi Kumar', url: 'https://edifyedu.in/about' },
    publisher: {
      '@type': 'Organization',
      name: 'edifyedu.in',
      url: 'https://edifyedu.in',
      logo: { '@type': 'ImageObject', url: 'https://edifyedu.in/logos/edify_logo_192.png', width: 192, height: 192 },
    },
    keywords: post.tags.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Online MCA', item: 'https://edifyedu.in/online-mca' },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen" style={{ background: '#F7F8FA' }}>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
            <nav className="flex items-center flex-wrap gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-amber transition-colors no-underline font-medium">Home</Link>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <Link href="/online-mca" className="hover:text-amber transition-colors no-underline font-medium">Online MCA</Link>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <span className="text-navy font-semibold truncate max-w-[200px] sm:max-w-xs" title={post.title}>
                {post.title.length > 55 ? post.title.slice(0, 55) + '…' : post.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
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
            <h1
              className="font-display font-extrabold leading-tight tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#0B1D35' }}
            >
              {post.title}
            </h1>
            <p className="text-lg leading-relaxed mb-6 font-medium" style={{ color: '#3B5068' }}>
              {post.metaDescription}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-border">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                  style={{ background: 'linear-gradient(135deg,#D4922A,#e0a93a)', color: '#0B1D35' }}
                >
                  RK
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#0B1D35' }}>Rishi Kumar</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D4922A' }}>Expert Verified</div>
                </div>
              </div>
              <span className="hidden sm:block w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64788A' }}>
                <Calendar size={13} style={{ color: '#D4922A' }} />
                <span>Published {publishedLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64788A' }}>
                <Clock size={13} style={{ color: '#D4922A' }} />
                <span>{post.readTime} min read</span>
              </div>
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

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <article className="flex-1 min-w-0">
              {post.faqs.length > 0 && (
                <div
                  className="rounded-2xl p-5 mb-6"
                  style={{ background: 'rgba(212,146,42,0.07)', border: '1px solid rgba(212,146,42,0.25)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: '#D4922A', fontSize: '1rem' }}>✦</span>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#D4922A' }}>
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
              <BlogTOC headings={headings} mobile />
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6">
                <div className="prose-article" dangerouslySetInnerHTML={{ __html: contentWithIds }} />
              </div>
              <section className="mb-6">
                <BlogLeadForm title={post.ctaTitle} desc={post.ctaDesc} />
              </section>
              <div className="bg-white rounded-2xl border border-border p-5 mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mr-1" style={{ color: '#3B5068' }}>
                  <Hash size={13} style={{ color: '#D4922A' }} /> Tags:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ background: '#F0F3F8', color: '#3B5068', border: '1px solid #E2E8F4' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <BlogClientActions faqs={post.faqs} postTitle={post.title} postUrl={postUrl} />
              {otherPosts.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-extrabold mb-5 flex items-center gap-2" style={{ color: '#0B1D35' }}>
                    <BookOpen size={18} style={{ color: '#D4922A' }} /> Related Guides
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {otherPosts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="bg-white rounded-xl border border-border p-4 hover:border-amber transition-colors no-underline block"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#D4922A' }}>
                          {p.category}
                        </span>
                        <p className="text-sm font-bold mt-1 leading-snug" style={{ color: '#0B1D35' }}>
                          {p.title.length > 70 ? p.title.slice(0, 70) + '…' : p.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
              <BlogTOC headings={headings} />
              <BlogSidebarWidgets postTitle={post.title} quickFacts={BLOG_QUICK_FACTS[post.slug]} />
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
