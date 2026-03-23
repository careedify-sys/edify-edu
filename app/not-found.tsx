import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--surface-2)', textAlign: 'center', }}>
      <div className="text-[72px] mb-4">🔍</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
        Page not found
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 8, maxWidth: 400, lineHeight: 1.6 }}>
        The university, program, or page you were looking for doesn't exist or may have moved.
      </p>
      <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 28 }}>Error 404</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/universities"
          style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--ink)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Browse Universities
        </Link>
        <Link href="/programs/mba"
          style={{ padding: '12px 24px', borderRadius: 10, background: 'rgba(200,129,26,0.1)', color: 'var(--amber-text)', fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(200,129,26,0.3)' }}>
          Browse MBA Programs
        </Link>
        <Link href="/"
          className="px-6 py-3 rounded-[var(--r-sm)] bg-white text-ink-2 font-semibold text-sm no-underline border border-border">
          ← Home
        </Link>
      </div>
    </div>
  )
}
