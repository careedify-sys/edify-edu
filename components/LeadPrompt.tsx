'use client'

// The site's one on-screen lead form ("fee sheet" prompt). Mounted once in
// app/layout.tsx. Replaces MobileLeadNudge (phones only, 60% scroll + 30s)
// and the in-article "early form" that Rishi found looked out of place.
//
// It opens two ways:
//  1. Automatically, once the reader is engaged: 35% scroll after 12 seconds,
//     or 45 seconds on the page. Once per session; after "No thanks" it stays
//     away for 3 days, and never returns for 60 days after a submission.
//  2. On any "talk to a counsellor" link to /contact inside the page (101 in
//     blog posts alone, plus university, programme, compare and fee pages),
//     instead of sending the reader away to another page. Modifier and middle
//     clicks still open /contact.
//
// Copy rules: every promise here is one the follow-up actually keeps (fee
// sheet, EMI options, scholarships or discounts that are open, one WhatsApp
// message). No countdowns, no fake scarcity, no fabricated numbers.

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Check, Lock, MessageCircle } from 'lucide-react'
import { submitEnquiry } from '@/lib/submitEnquiry'

const SESSION_KEY = 'edify_prompt_shown'
const DISMISS_KEY = 'edify_prompt_dismissed'
const DONE_KEY = 'edify_prompt_done'
const EXIT_POPUP_KEY = 'edify_exit_popup' // set by ExitIntentPopup; never stack the two
const DISMISS_DAYS = 3
const DONE_DAYS = 60
const MIN_SCROLL_PCT = 35
const MIN_TIME_MS = 12_000
const FALLBACK_TIME_MS = 45_000
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'

const NO_AUTO_PATHS = /^\/(contact|leads|admin|admin-login|privacy-policy|terms)(\/|$)/
const PROGRAMS: Array<[string, string]> = [
  ['MBA', 'Online MBA'], ['MCA', 'Online MCA'], ['BBA', 'Online BBA'], ['BCA', 'Online BCA'],
  ['B.Com', 'Online B.Com'], ['M.Com', 'Online M.Com'], ['BA', 'Online BA'], ['MA', 'Online MA'],
  ['MSc', 'Online MSc'], ['DBA', 'Online DBA'], ['Not sure yet', 'Not sure yet'],
]

const store = {
  get(k: string, session = false) { try { return (session ? sessionStorage : localStorage).getItem(k) } catch { return null } },
  set(k: string, v: string, session = false) { try { (session ? sessionStorage : localStorage).setItem(k, v) } catch { /* private mode */ } },
}
const within = (key: string, days: number) => {
  const t = parseInt(store.get(key) || '', 10)
  return Number.isFinite(t) && Date.now() - t < days * 86400000
}

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const PROGRAM_SLUGS: Record<string, string> = {
  mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', bcom: 'B.Com', mcom: 'M.Com', ba: 'BA', ma: 'MA', msc: 'MSc', dba: 'DBA',
}

/** University and programme from the URL, so the form speaks to this page. */
function pageContext(path: string): { university: string; program: string } {
  const parts = path.split('/').filter(Boolean)
  let university = ''
  let program = ''
  if (parts[0] === 'universities' && parts[1]) {
    university = titleCase(parts[1].replace(/-online$/, ''))
    if (parts[2] && PROGRAM_SLUGS[parts[2]]) program = PROGRAM_SLUGS[parts[2]]
  } else if (parts[0] === 'programs' && parts[1] && PROGRAM_SLUGS[parts[1]]) {
    program = PROGRAM_SLUGS[parts[1]]
  } else if (parts[0] === 'online-dba') {
    program = 'DBA'
  } else if ((parts[0] === 'blog' || parts[0] === 'coupons' || parts[0] === 'compare') && parts[1]) {
    const slug = parts[1]
    const hit = Object.keys(PROGRAM_SLUGS).find(k => new RegExp(`(^|-)${k}(-|$)`).test(slug))
    if (hit) program = PROGRAM_SLUGS[hit]
  }
  return { university, program }
}

/**
 * Browser autofill and paste give "+91 98765 43210", "09876543210" or
 * "919876543210". Keep the last 10 digits once there are more than 10, so the
 * country code or trunk 0 is dropped instead of the end of the number.
 */
function toTenDigits(raw: string): string {
  const d = raw.replace(/\D/g, '')
  return d.length > 10 ? d.slice(-10) : d
}

type Mode = 'auto' | 'link'

export default function LeadPrompt() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('auto')
  const [ctx, setCtx] = useState({ university: '', program: '' })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [program, setProgram] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [phoneError, setPhoneError] = useState(false)
  const openRef = useRef(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const show = useCallback((m: Mode) => {
    if (openRef.current) return
    openRef.current = true
    const c = pageContext(window.location.pathname)
    setCtx(c)
    setProgram(p => p || c.program)
    setMode(m)
    setStatus(s => (s === 'done' ? 'done' : 'idle'))
    setOpen(true)
    store.set(SESSION_KEY, '1', true)
    store.set(EXIT_POPUP_KEY, '1', true)
  }, [])

  // 1. Automatic, once engaged.
  useEffect(() => {
    const path = window.location.pathname
    if (NO_AUTO_PATHS.test(path)) return
    if (store.get(SESSION_KEY, true) || store.get(EXIT_POPUP_KEY, true)) return
    if (within(DISMISS_KEY, DISMISS_DAYS) || within(DONE_KEY, DONE_DAYS)) return

    let timeMet = false
    let scrollMet = false
    const tryShow = () => {
      if (!(timeMet && scrollMet)) return
      if (document.body.style.overflow === 'hidden') return // another modal is open
      if (store.get(EXIT_POPUP_KEY, true)) return
      show('auto')
      cleanup()
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && (window.scrollY / max) * 100 >= MIN_SCROLL_PCT) { scrollMet = true; tryShow() }
    }
    const t1 = setTimeout(() => { timeMet = true; tryShow() }, MIN_TIME_MS)
    const t2 = setTimeout(() => { timeMet = true; scrollMet = true; tryShow() }, FALLBACK_TIME_MS)
    window.addEventListener('scroll', onScroll, { passive: true })
    function cleanup() {
      clearTimeout(t1); clearTimeout(t2)
      window.removeEventListener('scroll', onScroll)
    }
    return cleanup
  }, [show])

  // 2. Counsellor links to /contact open the form here instead.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (/^\/contact\/?$/.test(window.location.pathname)) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.closest('main')) return
      let url: URL
      try { url = new URL(a.href, window.location.href) } catch { return }
      const sameSite = url.origin === window.location.origin || /(^|\.)edifyedu\.in$/.test(url.hostname)
      if (!sameSite || url.pathname.replace(/\/$/, '') !== '/contact') return
      // Capture phase + stopPropagation: these are often next/link elements,
      // whose own handler would otherwise start a client-side navigation.
      e.preventDefault()
      e.stopPropagation()
      show('link')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [show])

  const close = useCallback((remember: boolean) => {
    openRef.current = false
    setOpen(false)
    if (remember && status !== 'done') store.set(DISMISS_KEY, String(Date.now()))
  }, [status])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true) }
    window.addEventListener('keydown', onKey)
    // Focus the first field on desktop only; on phones it would pop the keyboard
    // before the reader has seen what the form is for.
    if (window.innerWidth >= 768) setTimeout(() => nameRef.current?.focus(), 50)
    // The Tawk chat bubble sits above everything and covered the bottom of
    // the form on phones; hide it while the form is open.
    const tawk = (window as unknown as { Tawk_API?: { hideWidget?: () => void; showWidget?: () => void } }).Tawk_API
    try { tawk?.hideWidget?.() } catch { /* chat not loaded */ }
    return () => {
      window.removeEventListener('keydown', onKey)
      try { tawk?.showWidget?.() } catch { /* chat not loaded */ }
    }
  }, [open, close])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.replace(/\D/g, '').slice(-10)
    if (!/^[6-9]\d{9}$/.test(p)) { setPhoneError(true); return }
    const em = email.trim()
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setEmailError(true); return }
    if (!n) return
    setStatus('sending')
    try {
      const res = await submitEnquiry({
        name: n,
        phone: p,
        email: em || undefined,
        program: program || undefined,
        preferredUniversity: ctx.university || undefined,
        sourcePage: window.location.pathname,
        source: mode === 'link' ? 'lead_prompt_link' : 'lead_prompt_auto',
      })
      if (!res.ok) { setStatus('error'); return }
      setStatus('done')
      store.set(DONE_KEY, String(Date.now()))
    } catch {
      setStatus('error')
    }
  }

  if (!open) return null

  const subject = [ctx.university, program || ctx.program].filter(Boolean).join(' ')
  const headline = subject ? `Get the latest ${subject} fee sheet` : 'Get the latest fee sheet for your course'
  const firstName = name.trim().split(' ')[0]

  return (
    <div className="lp-root" role="dialog" aria-modal="true" aria-labelledby="lp-title">
      <div className="lp-backdrop" onClick={() => close(true)} />
      <div className="lp-card">
        <button className="lp-x" onClick={() => close(true)} aria-label="Close">
          <X size={16} />
        </button>

        {status === 'done' ? (
          <div className="lp-done">
            <div className="lp-done-icon"><Check size={22} /></div>
            <h2 id="lp-title" className="lp-h">Thanks{firstName ? `, ${firstName}` : ''}. It&apos;s on its way.</h2>
            <p className="lp-sub">Our team will WhatsApp you the fee sheet, usually within an hour.</p>
            <a
              className="lp-wa"
              href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I just asked for the ${subject || 'online degree'} fee sheet on edifyedu.in.`)}`}
              target="_blank" rel="noopener noreferrer"
            >
              <MessageCircle size={16} /> Want it sooner? Message us on WhatsApp
            </a>
            <button className="lp-skip" onClick={() => close(false)}>Back to reading</button>
          </div>
        ) : (
          <>
            <div className="lp-eyebrow">Free · 2026 admissions</div>
            <h2 id="lp-title" className="lp-h">{headline}</h2>
            <p className="lp-sub">Sent to your WhatsApp, checked against the university&apos;s official portal.</p>

            <ul className="lp-points">
              <li><Check size={14} /> Current semester fees and EMI options</li>
              <li><Check size={14} /> Scholarships or discounts open right now</li>
              <li><Check size={14} /> One message, no repeated sales calls</li>
            </ul>

            <form onSubmit={submit} className="lp-form" noValidate>
              <label className="lp-field">
                <span>Your name</span>
                <input
                  ref={nameRef} type="text" name="name" autoComplete="name" required
                  value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma"
                />
              </label>
              <label className={`lp-field${phoneError ? ' lp-bad' : ''}`}>
                <span>WhatsApp number</span>
                <div className="lp-phone">
                  <em>+91</em>
                  <input
                    type="tel" name="phone" inputMode="tel" autoComplete="tel" required
                    value={phone} placeholder="10-digit mobile"
                    onChange={e => { setPhone(toTenDigits(e.target.value)); setPhoneError(false) }}
                  />
                </div>
                {phoneError && <small>Enter a 10-digit Indian mobile number</small>}
              </label>
              <label className={`lp-field${emailError ? ' lp-bad' : ''}`}>
                <span>Email <i>(optional, for a copy)</i></span>
                <input
                  type="email" name="email" inputMode="email" autoComplete="email"
                  value={email} placeholder="you@example.com"
                  onChange={e => { setEmail(e.target.value); setEmailError(false) }}
                />
                {emailError && <small>Check the email address, or leave it blank</small>}
              </label>
              <label className="lp-field">
                <span>Course</span>
                <select value={program} onChange={e => setProgram(e.target.value)}>
                  <option value="">Select a course</option>
                  {PROGRAMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>

              {status === 'error' && (
                <p className="lp-err">
                  That didn&apos;t go through.{' '}
                  <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I'd like the ${subject || 'online degree'} fee sheet.`)}`} target="_blank" rel="noopener noreferrer">
                    Ask on WhatsApp instead
                  </a>
                </p>
              )}

              <button type="submit" className="lp-cta" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send me the fee sheet'}
              </button>
            </form>

            <p className="lp-trust">
              <Lock size={12} /> Used only to send you this. Edify takes no commission from any university.
            </p>
            <button className="lp-skip" onClick={() => close(true)}>No thanks, I&apos;m just reading</button>
          </>
        )}
      </div>

      <style jsx global>{`
        /* Above the sticky header (z 9990) and bottom nav (z 300); the Tawk bubble is hidden while open. */
        .lp-root{position:fixed;inset:0;z-index:10050;display:flex;align-items:flex-end;justify-content:center}
        .lp-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.5)}
        .lp-card{position:relative;width:100%;max-width:440px;max-height:92vh;max-height:92dvh;overflow:auto;overscroll-behavior:contain;background:#fff;
          border-radius:20px 20px 0 0;padding:18px 18px calc(14px + env(safe-area-inset-bottom));
          box-shadow:0 -8px 40px rgba(15,23,42,.18);animation:lpUp .28s ease-out;color:#0f172a;
          font-family:var(--font-body), system-ui, sans-serif}
        @media (min-width:768px){
          .lp-root{align-items:center}
          .lp-card{border-radius:20px;padding:28px 28px 22px;box-shadow:0 20px 60px rgba(15,23,42,.25)}
        }
        .lp-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:999px;border:0;
          background:#f1f5f9;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer}
        .lp-eyebrow{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
          color:#10b981;background:#ecfdf5;border-radius:999px;padding:4px 10px;margin-bottom:10px}
        .lp-h{font-family:var(--font-display), var(--font-body), system-ui, sans-serif;font-size:20px;line-height:1.25;
          font-weight:800;margin:0 36px 6px 0;color:#0f172a}
        .lp-sub{font-size:14px;line-height:1.45;color:#64748b;margin:0 0 10px}
        .lp-points{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:4px}
        .lp-points li{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#334155}
        .lp-points svg{color:#10b981;flex-shrink:0}
        .lp-form{display:grid;gap:8px}
        .lp-field{display:grid;gap:4px}
        .lp-field>span{font-size:12px;font-weight:600;color:#334155}
        .lp-field input,.lp-field select{width:100%;font:inherit;font-size:16px;padding:10px 12px;border:1px solid #cbd5e1;
          border-radius:12px;background:#fff;color:#0f172a;outline:none}
        .lp-field input:focus,.lp-field select:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.15)}
        .lp-phone{display:flex;align-items:stretch;border:1px solid #cbd5e1;border-radius:12px;overflow:hidden}
        .lp-phone:focus-within{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.15)}
        .lp-phone em{font-style:normal;font-size:15px;font-weight:600;color:#64748b;padding:10px;background:#f8fafc;
          border-right:1px solid #e2e8f0}
        .lp-phone input{border:0;border-radius:0;box-shadow:none !important}
        .lp-bad .lp-phone,.lp-bad>input{border-color:#ef4444}
        .lp-field>span i{font-style:normal;font-weight:400;color:#94a3b8}
        .lp-field small{font-size:12px;color:#ef4444}
        .lp-cta{margin-top:4px;width:100%;border:0;border-radius:12px;padding:14px;font:inherit;font-size:16px;font-weight:700;
          color:#fff;background:#f97316;cursor:pointer;box-shadow:0 6px 16px rgba(249,115,22,.3)}
        .lp-cta:disabled{opacity:.7;cursor:default}
        .lp-err{font-size:13px;color:#ef4444;margin:0}
        .lp-err a{color:#0f172a;font-weight:700;text-decoration:underline}
        .lp-trust{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#64748b;margin:10px 0 2px;text-align:center}
        .lp-skip{display:block;margin:4px auto 0;border:0;background:none;font:inherit;font-size:13px;color:#94a3b8;
          text-decoration:underline;cursor:pointer;padding:6px}
        .lp-done{text-align:center;padding:8px 0 0}
        .lp-done .lp-h{margin:0 0 6px}
        .lp-done-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:999px;background:#ecfdf5;color:#10b981;
          display:flex;align-items:center;justify-content:center}
        .lp-wa{display:inline-flex;align-items:center;gap:8px;margin:6px 0 4px;padding:11px 16px;border-radius:12px;
          background:#25D366;color:#fff;font-weight:700;font-size:14px;text-decoration:none}
        @keyframes lpUp{from{transform:translateY(24px)}to{transform:none}}
      `}</style>
    </div>
  )
}
