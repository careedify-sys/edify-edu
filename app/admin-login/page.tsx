'use client'
import { useState, Suspense, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail } from 'lucide-react'

type Step = 'password' | 'otp'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const returnTo = params.get('from') || '/admin'

  const [step, setStep] = useState<Step>('password')
  const [pw, setPw] = useState('')
  const [code, setCode] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const codeRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (step === 'otp') codeRef.current?.focus() }, [step])

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.step === 'otp') {
        setMaskedEmail(data.to || '')
        setStep('otp')
        setPw('')
      } else {
        setError(data.error || 'Incorrect password')
        setPw('')
      }
    } catch {
      setError('Network error — please try again')
    }
    setLoading(false)
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push(returnTo)
        router.refresh()
      } else {
        setError(data.error || 'Wrong code')
        // If the server reset us to password step, respect that.
        if (res.status === 401 && /password again/i.test(data.error || '')) {
          setStep('password')
        }
        setCode('')
      }
    } catch {
      setError('Network error — please try again')
    }
    setLoading(false)
  }

  const cardWrap: React.CSSProperties = {
    minHeight: '100vh', background: 'var(--bg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  }
  const card: React.CSSProperties = {
    background: '#fff', border: '1px solid #DDE4F0', borderRadius: 'var(--r-md)',
    padding: '36px 32px', maxWidth: 360, width: '100%', textAlign: 'center',
  }
  const iconWrap: React.CSSProperties = {
    width: 48, height: 48, borderRadius: 'var(--r-sm)', background: 'var(--ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
  }
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', borderRadius: 'var(--r-xs)', boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
    fontSize: 14, marginBottom: 10, outline: 'none',
  })
  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: 13, borderRadius: 10, border: 'none', cursor: disabled ? 'default' : 'pointer',
    background: disabled ? 'var(--ink-3)' : 'linear-gradient(135deg,#c9922a,#e0a93a)',
    color: '#fff', fontWeight: 700, fontSize: 14,
  })

  return (
    <div style={cardWrap}>
      <div style={card}>
        <div style={iconWrap}>
          {step === 'password' ? <Lock size={22} color="#fff" /> : <Mail size={22} color="#fff" />}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
          {step === 'password' ? 'Admin Login' : 'Verify it’s you'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>
          {step === 'password'
            ? 'Edify admin area — authorised access only'
            : `A 6-digit code was sent to ${maskedEmail || 'your email'}. Enter it below.`}
        </p>

        {step === 'password' ? (
          <form onSubmit={submitPassword}>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Admin password"
              aria-label="Admin password"
              autoFocus
              required
              style={inputStyle(!!error)}
            />
            {error && (
              <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10, textAlign: 'left' }}>{error}</p>
            )}
            <button type="submit" disabled={loading || !pw} style={buttonStyle(loading || !pw)}>
              {loading ? 'Sending code…' : 'Send login code'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp}>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              aria-label="6-digit code"
              required
              style={{
                ...inputStyle(!!error),
                fontSize: 20, letterSpacing: 8, textAlign: 'center',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
              }}
            />
            {error && (
              <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10, textAlign: 'left' }}>{error}</p>
            )}
            <button type="submit" disabled={loading || code.length !== 6} style={buttonStyle(loading || code.length !== 6)}>
              {loading ? 'Verifying…' : 'Verify & sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('password'); setCode(''); setError('') }}
              style={{
                marginTop: 12, background: 'none', border: 'none', color: 'var(--ink-3)',
                fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit',
              }}
            >
              Back to password
            </button>
          </form>
        )}
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
