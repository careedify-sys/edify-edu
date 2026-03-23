'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('App error:', error) }, [error])
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--surface-2)', textAlign: 'center', }}>
      <div className="text-[72px] mb-4">⚠️</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 24, maxWidth: 380 }}>
        An unexpected error occurred. Please try again or go back to the homepage.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={reset}
          style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--ink)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Try again
        </button>
        <a href="/"
          className="px-6 py-3 rounded-[var(--r-sm)] bg-white text-ink-2 font-semibold text-sm no-underline border border-border">
          ← Home
        </a>
      </div>
    </div>
  )
}
