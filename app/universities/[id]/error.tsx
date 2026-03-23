'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: replace with Sentry.captureException(error)
      fetch('/api/log-error', { method: 'POST', body: JSON.stringify({ error: error.message, digest: error.digest, route: 'app/universities/[id]' }) }).catch(() => {})
    }
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-[22px] font-extrabold text-navy mb-2">Something went wrong</h2>
      <p className="text-sm text-ink-3 mb-6 max-w-[380px]">
        An error occurred loading this page. Please try again.
        {error.digest && <span className="block text-[11px] mt-2 text-slate-400">Ref: {error.digest}</span>}
      </p>
      <div className="flex gap-2.5">
        <button onClick={reset} style={{ padding: '11px 22px', borderRadius: 10, background: 'var(--ink)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Try again
        </button>
        <Link href="/" style={{ padding: '11px 22px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--ink-2)', fontWeight: 600, textDecoration: 'none' }}>
          ← Home
        </Link>
      </div>
    </div>
  )
}
