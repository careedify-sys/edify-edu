'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function BlogPostError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Blog post error:', error.message, error.stack) }, [error])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>📄</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0B1D35', marginBottom: 8 }}>Article not available</h1>
      <p style={{ color: '#607B96', marginBottom: 24, maxWidth: 380 }}>
        This article couldn&apos;t be loaded. Try refreshing, or go back to the blog.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={reset} style={{ padding: '10px 20px', borderRadius: 10, background: '#0B1D35', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Try again
        </button>
        <Link href="/blog" style={{ padding: '10px 20px', borderRadius: 10, background: '#F0F3F8', color: '#0B1D35', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          ← Back to Blog
        </Link>
      </div>
    </div>
  )
}
