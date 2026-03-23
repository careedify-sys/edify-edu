'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Lock } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const returnTo = params.get('from') || '/admin'

  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (res.ok) {
        router.push(returnTo)
        router.refresh()
      } else {
        const { error } = await res.json()
        setError(error || 'Incorrect password')
        setPw('')
      }
    } catch {
      setError('Network error — please try again')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, }}>
      <div style={{ background: '#fff', border: '1px solid #DDE4F0', borderRadius: 'var(--r-md)', padding: '36px 32px', maxWidth: 360, width: '100%', textAlign: 'center', }}>
        <div style={{ width: 48, height: 48, borderRadius: 'var(--r-sm)', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', }}>
          <Lock size={22} color="#fff" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
          Admin Login
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>
          Edify admin area — authorised access only
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Admin password"
            aria-label="Admin password"
            autoFocus
            required
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 'var(--r-xs)', boxSizing: 'border-box',
              border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`,
              fontSize: 14, marginBottom: 10, outline: 'none',
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10, textAlign: 'left' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !pw}
            style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', cursor: 'pointer', background: loading ? 'var(--ink-3)' : 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 14, }}
          >
            {loading ? 'Checking…' : 'Unlock Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
