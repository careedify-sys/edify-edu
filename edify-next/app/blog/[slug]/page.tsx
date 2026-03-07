'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Share2, ChevronDown } from 'lucide-react'
import { getBlogPost, getPublishedPosts } from '@/lib/blog'
import { UNIVERSITIES } from '@/lib/data'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import EnquiryModal from '@/components/EnquiryModal'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const post = getBlogPost(slug)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!post || post.status !== 'published') return notFound()

  const relatedUnis = post.relatedUniversities
    .map(id => UNIVERSITIES.find(u => u.id === id))
    .filter(Boolean)

  const otherPosts = getPublishedPosts().filter(p => p.slug !== slug).slice(0, 3)

  // FAQ Schema for AEO / AI Overview
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(faq => ({
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
    publisher: { '@type': 'Organization', name: 'Edify', url: 'https://edifyedu.in' },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      {/* JSON-LD Schema for SEO/AEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div style={{ minHeight: '100vh', background: '#0f1b2d' }}>

        {/* Hero */}
        <div style={{ background: '#0a1220', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', textDecoration: 'none', marginBottom: '24px' }}>
              <ArrowLeft size={14} /> All Articles
            </Link>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', background: 'rgba(201,146,42,0.1)', borderRadius: '999px', border: '1px solid rgba(201,146,42,0.2)' }}>
                {post.category}
              </span>
              {post.tags.slice(0, 2).map(t => (
                <span key={t} style={{ fontSize: '11px', color: '#64748b', padding: '4px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '999px', border: '1px solid #1e2f45' }}>{t}</span>
              ))}
            </div>

            <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.25', marginBottom: '16px' }}>
              {post.title}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.65', marginBottom: '20px' }}>
              {post.metaDescription}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#475569' }}>
                <Clock size={13} /> {post.readTime} min read
              </span>
              <span style={{ fontSize: '13px', color: '#475569' }}>
                Published {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#c9922a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Share2 size={13} /> Copy link
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '15px' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Inline CTA */}
              <div style={{ margin: '40px 0', padding: '24px', background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎓</div>
                <div className="font-display" style={{ fontWeight: '700', color: '#ffffff', fontSize: '16px', marginBottom: '6px' }}>
                  Not sure which university is right for you?
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Free counselling — our team will shortlist the top 3 for your profile within 24 hours.
                </p>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  Get Free Counselling →
                </button>
              </div>

              {/* FAQs — with FAQ schema for AEO */}
              {post.faqs.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                    Frequently Asked Questions
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {post.faqs.map((faq, i) => (
                      <div key={i} style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', overflow: 'hidden' }}>
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <span style={{ fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>{faq.q}</span>
                          <ChevronDown size={16} style={{ color: '#c9922a', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '12px' }} />
                        </button>
                        {openFaq === i && (
                          <div style={{ padding: '0 20px 16px', fontSize: '14px', color: '#94a3b8', lineHeight: '1.7', borderTop: '1px solid #1e2f45' }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related posts */}
              {otherPosts.length > 0 && (
                <div style={{ marginTop: '48px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>More Articles</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {otherPosts.map(p => (
                      <Link key={p.slug} href={`/blog/${p.slug}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', textDecoration: 'none' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '14px', marginBottom: '4px' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: '#475569' }}>{p.readTime} min read · {p.category}</div>
                        </div>
                        <span style={{ color: '#c9922a', fontSize: '18px' }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ width: '280px', flexShrink: 0, display: 'none' }} className="lg:block">
              <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Enquiry CTA */}
                <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px', marginBottom: '8px' }}>Free Counselling</div>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                    Get your top 3 universities shortlisted based on your profile. Free. 24-hour response.
                  </p>
                  <button onClick={() => setEnquiryOpen(true)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                    Get Free Match →
                  </button>
                </div>

                {/* Related universities */}
                {relatedUnis.length > 0 && (
                  <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px', marginBottom: '12px' }}>Featured in This Article</div>
                    {relatedUnis.map(u => u && (
                      <Link key={u.id} href={`/universities/${u.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1e2f45', textDecoration: 'none' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                          {u.abbr.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>{u.abbr}</div>
                          <div style={{ fontSize: '11px', color: '#c9922a' }}>NIRF #{u.nirf}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Target keyword */}
                <div style={{ padding: '14px', background: 'rgba(201,146,42,0.05)', border: '1px solid rgba(201,146,42,0.15)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>SEO Target</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>"{post.targetKeyword}"</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
      </div>
    </>
  )
}
