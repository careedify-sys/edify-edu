'use client'
import { useEffect, useRef, useState } from 'react'
import { UNI_UNDECIDED, CAMPAIGN_TOKEN_RE, type UniOption, type FieldErrors } from '@/lib/referrals/refer-rules'

type Props = {
  programmes: string[]
  universities: UniOption[]
  disclosure: string
  terms: string[]
  privacy: string[]
  termsVersion: string
}

const EMPTY = { referrerName: '', referrerPhone: '', referredName: '', referredPhone: '', programme: '', universityId: '', note: '', permission: false, waOptin: false, website: '' }

export default function ReferForm({ programmes, universities, disclosure, terms, privacy, termsVersion }: Props) {
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState<{ code: string; repeat: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const opened = useRef(Date.now())
  const campaign = useRef('')

  useEffect(() => {
    opened.current = Date.now()
    const c = new URLSearchParams(window.location.search).get('c') ?? ''
    if (CAMPAIGN_TOKEN_RE.test(c)) {
      campaign.current = c
      fetch('/api/refer/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ c }), keepalive: true }).catch(() => {})
    }
  }, [])

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setF(p => ({ ...p, [k]: v }))
    if (errors[k as keyof FieldErrors]) setErrors(p => ({ ...p, [k]: undefined }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending'); setMessage('')
    try {
      const res = await fetch('/api/refer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, campaign: campaign.current, elapsedMs: Date.now() - opened.current }),
      })
      const j = await res.json().catch(() => ({ ok: false, error: 'Something went wrong. Please try again.' }))
      if (j.ok) { setDone({ code: j.refCode, repeat: !!j.repeat }); setStatus('idle'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
      setErrors(j.fields ?? {}); setMessage(j.error ?? 'Something went wrong. Please try again.'); setStatus('error')
    } catch {
      setMessage('No connection. Check your internet and try again.'); setStatus('error')
    }
  }

  async function copy() {
    if (!done) return
    try { await navigator.clipboard.writeText(done.code); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border-2 border-[#B8892A] p-6 md:p-8 text-center" role="status" aria-live="polite">
        <p className="text-sm font-semibold text-[#10b981] mb-2">{done.repeat ? 'You already referred this friend today' : 'Referral received'}</p>
        <h2 className="text-2xl font-extrabold text-navy mb-4">Your referral ID</h2>
        <div className="inline-flex items-center gap-3 bg-[#f1f5f9] rounded-xl px-5 py-3 mb-4">
          <code className="text-xl md:text-2xl font-bold tracking-wider text-navy" data-testid="ref-code">{done.code}</code>
          <button type="button" onClick={copy} className="text-sm font-semibold bg-navy text-white rounded-lg px-3 py-1.5 hover:bg-slate-800">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Keep this ID. Quote it if you contact Edify about this referral. An Edify counsellor will call your friend soon.
        </p>
        <button type="button" onClick={() => { setDone(null); setF(EMPTY); opened.current = Date.now() }} className="mt-5 text-sm font-semibold text-[#f97316] underline">
          Refer another friend
        </button>
      </div>
    )
  }

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-navy focus:outline-none focus:ring-2 focus:ring-[#B8892A]'
  const label = 'block text-sm font-semibold text-navy mb-1'
  const err = (k: keyof FieldErrors) => errors[k] ? <p className="text-xs text-[#ef4444] mt-1" id={`${k}-err`}>{errors[k]}</p> : null
  const aria = (k: keyof FieldErrors) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-err` : undefined })

  return (
    <form onSubmit={submit} noValidate className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8 space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-navy mb-1">Your details</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={label} htmlFor="referrerName">Your name</label>
            <input id="referrerName" className={input} value={f.referrerName} onChange={set('referrerName')} maxLength={80} autoComplete="name" required {...aria('referrerName')} />{err('referrerName')}</div>
          <div><label className={label} htmlFor="referrerPhone">Your mobile number</label>
            <input id="referrerPhone" className={input} value={f.referrerPhone} onChange={set('referrerPhone')} maxLength={16} inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" required {...aria('referrerPhone')} />{err('referrerPhone')}</div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-navy mb-1">Your friend&apos;s details</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={label} htmlFor="referredName">Friend&apos;s name</label>
            <input id="referredName" className={input} value={f.referredName} onChange={set('referredName')} maxLength={80} autoComplete="off" required {...aria('referredName')} />{err('referredName')}</div>
          <div><label className={label} htmlFor="referredPhone">Friend&apos;s mobile number</label>
            <input id="referredPhone" className={input} value={f.referredPhone} onChange={set('referredPhone')} maxLength={16} inputMode="tel" autoComplete="off" placeholder="10-digit mobile" required {...aria('referredPhone')} />{err('referredPhone')}</div>
          <div><label className={label} htmlFor="programme">Programme <span className="font-normal text-slate-500">(optional)</span></label>
            <select id="programme" className={input} value={f.programme} onChange={set('programme')} {...aria('programme')}>
              <option value="">Select a programme</option>
              {programmes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>{err('programme')}</div>
          <div><label className={label} htmlFor="universityId">Preferred university <span className="font-normal text-slate-500">(optional)</span></label>
            <select id="universityId" className={input} value={f.universityId} onChange={set('universityId')} {...aria('universityId')}>
              <option value="">Select a university</option>
              <option value="undecided">{UNI_UNDECIDED}</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>{err('universityId')}</div>
        </div>
        <div><label className={label} htmlFor="note">Anything else we should know <span className="font-normal text-slate-500">(optional)</span></label>
          <textarea id="note" className={input} rows={3} value={f.note} onChange={set('note')} maxLength={1000} placeholder="For example, the best time to call" /></div>
        <p className="text-xs text-slate-500">A preferred university helps the counsellor prepare. Your friend still compares options and makes their own choice.</p>
      </fieldset>

      {/* Honeypot: hidden from people and screen readers. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
      </div>

      <div className="space-y-3">
        <label className="flex gap-3 items-start text-sm text-navy">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-[#B8892A]" checked={f.permission} onChange={set('permission')} {...aria('permission')} />
          <span>My friend agreed that I can share their name and number with Edify, and that Edify can contact them about education guidance.</span>
        </label>{err('permission')}
        <label className="flex gap-3 items-start text-sm text-slate-700">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-[#B8892A]" checked={f.waOptin} onChange={set('waOptin')} />
          <span>Send me a WhatsApp message confirming my referral ID (optional).</span>
        </label>
      </div>

      <div className="bg-[#f1f5f9] rounded-xl p-4 text-sm text-slate-700 space-y-3">
        <p>{disclosure}</p>
        <details>
          <summary className="cursor-pointer font-semibold text-navy">Referral terms (version {termsVersion})</summary>
          <ul className="list-disc pl-5 mt-2 space-y-1">{terms.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </details>
        <details>
          <summary className="cursor-pointer font-semibold text-navy">How we use these details</summary>
          <ul className="list-disc pl-5 mt-2 space-y-1">{privacy.map((t, i) => <li key={i}>{t}</li>)}</ul>
          <p className="mt-2">Read the full <a href="/privacy-policy" className="text-[#f97316] underline">privacy policy</a>.</p>
        </details>
      </div>

      {message && <p className="text-sm text-[#ef4444]" role="alert">{message}</p>}
      <button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto bg-[#f97316] hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl px-8 py-3">
        {status === 'sending' ? 'Sending...' : 'Submit referral'}
      </button>
      <p className="text-xs text-slate-500">By submitting you accept the referral terms above.</p>
    </form>
  )
}
