'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getPublishedPosts, BLOG_CATEGORIES } from '@/lib/blog'

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const allPosts = getPublishedPosts()
  const filtered = activeCategory === 'All' ? allPosts : allPosts.filter(p => p.category === activeCategory)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Blog
          </div>
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--navy)', marginBottom: '12px' }}>
            Honest Guides & Insights
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: '15px', maxWidth: '560px', lineHeight: '1.6' }}>
            No fluff. No paid content. Real answers about online degrees, fees, and career outcomes in India.
          </p>


        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {BLOG_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                background: activeCategory === cat ? '#c9922a' : 'transparent',
                color: activeCategory === cat ? 'var(--navy)' : '#64748b',
                border: `1px solid ${activeCategory === cat ? '#c9922a' : 'var(--border)'}`,
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✍️</div>
            <p>No posts in this category yet.</p>
            <Link href="/blog/new" style={{ color: 'var(--amber-bright)', fontWeight: '700' }}>Generate one with AI →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {filtered.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
                  className="blog-card">

                  {/* Category bar */}
                  <div style={{ padding: '10px 20px', background: 'rgba(201,146,42,0.08)', borderBottom: '1px solid #1e2f45' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {post.category}
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h2 className="font-display" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy)', lineHeight: '1.4', marginBottom: '10px' }}>
                      {post.title}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: '1.6', marginBottom: '16px' }}>
                      {post.metaDescription}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
                        <Clock size={12} /> {post.readTime} min read
                      </span>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', color: 'var(--ink-3)', border: '1px solid #E2E8F4' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
