'use client'

import { useState } from 'react'

interface Props {
  universitySlug: string
  defaultProgramme?: string
}

export default function ReviewForm({ universitySlug, defaultProgramme = '' }: Props) {
  const [studentName, setStudentName]     = useState('')
  const [city, setCity]                   = useState('')
  const [programme, setProgramme]         = useState(defaultProgramme)
  const [rating, setRating]               = useState(5)
  const [reviewBody, setReviewBody]       = useState('')
  const [enrolmentYear, setEnrolmentYear] = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universitySlug,
          programme,
          studentName,
          city,
          rating,
          reviewBody,
          enrolmentYear: enrolmentYear || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ type: 'err', msg: data?.error || 'Something went wrong' })
      } else {
        setStatus({ type: 'ok', msg: 'Thanks. Your review is queued for verification.' })
        setStudentName(''); setCity(''); setProgramme(defaultProgramme); setRating(5); setReviewBody(''); setEnrolmentYear('')
      }
    } catch {
      setStatus({ type: 'err', msg: 'Network error. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Your name</label>
        <input
          required minLength={2} maxLength={200}
          value={studentName} onChange={e => setStudentName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
          <input
            maxLength={100}
            value={city} onChange={e => setCity(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Enrolment year</label>
          <input
            type="number" min={2000} max={2100}
            value={enrolmentYear} onChange={e => setEnrolmentYear(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Programme (e.g. MBA Finance)</label>
        <input
          maxLength={100}
          value={programme} onChange={e => setProgramme(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Rating</label>
        <select
          value={rating} onChange={e => setRating(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Your review (min 30 characters)</label>
        <textarea
          required minLength={30} maxLength={4000} rows={6}
          value={reviewBody} onChange={e => setReviewBody(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit" disabled={submitting}
        className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>

      {status && (
        <p className={`text-sm ${status.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
          {status.msg}
        </p>
      )}
    </form>
  )
}
