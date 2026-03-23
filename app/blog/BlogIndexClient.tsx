'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

const CAT_COLORS: Record<string, string> = {
  'MBA Guides':         '#c9922a',
  'University Reviews': '#2563EB',
  'Career Advice':      '#059669',
  'Guides':             '#7C3AED',
  'GEO Targeting':      '#DC2626',
}
export function categoryColor(cat: string) {
  return CAT_COLORS[cat] || '#607B96'
}

export function PostCard({ post }: { post: BlogPost }) {
  const color = categoryColor(post.category)
  return (
    <Link href={`/blog/${post.slug}`} className="block no-underline group h-full">
      <div
        className="rounded-xl border bg-white hover:shadow-md transition-all h-full flex flex-col overflow-hidden"
        style={{ borderColor: 'var(--border)', borderTop: `3px solid ${color}` }}
      >
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Category label */}
          <span
            className="text-[9px] font-bold uppercase tracking-widest mb-2 inline-block"
            style={{ color }}
          >
            {post.category}
          </span>

          {/* Title */}
          <h3
            className="font-display text-sm font-bold leading-snug mb-2 flex-1 group-hover:text-amber transition-colors"
            style={{ color: 'var(--navy)' }}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--ink-3)' }}>
            {post.metaDescription}
          </p>

          {/* Meta row */}
          <div
            className="flex items-center justify-between mt-auto pt-3"
            style={{ borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--ink-3)' }}
          >
            <span>🕐 {post.readTime} min</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            <span className="font-semibold" style={{ color: 'var(--amber)' }}>Read →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

interface Props {
  posts: BlogPost[]
  categories: string[]
}

export default function BlogIndexClient({ posts, categories }: Props) {
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? posts
    : posts.filter(p => p.category === active)

  return (
    <div>
      {/* Category filter — horizontally scrollable on mobile */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {['All', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border"
            style={{
              background:  active === cat ? 'var(--amber)' : 'transparent',
              color:       active === cat ? '#fff'         : 'var(--ink-3)',
              borderColor: active === cat ? 'var(--amber)' : 'var(--border)',
              fontFamily:  'inherit',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--ink-3)' }}>
          <div className="text-4xl mb-3">✍️</div>
          <p className="text-sm">No posts in this category yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
