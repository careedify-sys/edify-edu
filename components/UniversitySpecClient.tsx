'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { getUniversitiesByProgram, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import type { Program, University } from '@/lib/data'

const WA_NUMBER = '917061285806'

interface Props {
  university: University
  program: Program
  programSlug: string
  spec: string
}

export default function UniversitySpecClient({ university: u, program, programSlug, spec }: Props) {
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  const pd   = u.programDetails[program]!
  const meta = PROGRAM_META[program]
  const otherUnis = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)

  const isUG = meta?.level === 'UG'
  const eligibility = isUG ? u.eligibility?.replace(/Graduation.*/, '10+2 / 12th Pass') || '10+2 / 12th Pass' : u.eligibility || 'Any Graduation'
  const shortDesc = `Online ${program} with ${spec} specialisation from ${u.name}. ${pd.duration || (isUG ? '3 Years' : '2 Years')}, UGC DEB approved, ${u.naac} accredited.`

  function buildWAMessage() {
    return encodeURIComponent(
      `Hi Edify Team, I want details about ${u.name} Online ${program} ${spec}. My name is ${name.trim()} and my number is ${phone.trim()}.`
    )
  }

  const displayPhone = phone.trim().replace(/\D/g, '').slice(0, 10)
  const maskedPhone  = displayPhone.length >= 6
    ? `+91 ${displayPhone.slice(0, 5)}XXXXX`
    : `+91 ${displayPhone}XXXXX`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim().replace(/\D/g, '')
    if (!n) { setError('Please enter your name.'); return }
    if (p.length < 10) { setError('Please enter a valid 10-digit phone number.'); return }
    setError('')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAMessage()}`, '_blank')
    }, 1200)
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/" className="text-ink-2 no-underline hover:text-navy">Home</Link>
            <ChevronRight size={12}/>
            <Link href="/universities" className="text-ink-2 no-underline hover:text-navy">Universities</Link>
            <ChevronRight size={12}/>
            <Link href={`/universities/${u.id}`} className="text-ink-2 no-underline hover:text-navy">{u.abbr}</Link>
            <ChevronRight size={12}/>
            <Link href={`/universities/${u.id}/${programSlug}`} className="text-ink-2 no-underline hover:text-navy">{program}</Link>
            <ChevronRight size={12}/>
            <span className="text-amber font-semibold">{spec}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* ── VISIBLE SECTION ─────────────────────────────────── */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden mb-6">
          <div style={{ height: 4, background: u.color }} />
          <div className="p-6 sm:p-8">
            {/* Logo + names */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 shrink-0 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden p-1">
                {u.logo
                  ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain"
                      onError={e => {
                        const t = e.target as HTMLImageElement
                        t.style.display = 'none'
                        const p = t.parentElement
                        if (p) { p.style.background = u.color; p.innerHTML = `<span style="color:#fff;font-weight:800;font-size:15px">${(u.abbr||u.name).slice(0,2).toUpperCase()}</span>` }
                      }} />
                  : <span style={{ color:'#fff', fontWeight:800, fontSize:15, background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10 }}>
                      {(u.abbr||u.name).slice(0,2).toUpperCase()}
                    </span>
                }
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-0.5">
                  {meta?.level === 'PG' ? 'Postgraduate' : 'Undergraduate'} · UGC DEB Approved
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy leading-tight">
                  Online {program} — {spec}
                </h1>
                <div className="text-sm text-ink-3 mt-0.5">{u.name}</div>
              </div>
            </div>

            <p className="text-sm text-ink-2 leading-relaxed mb-5 max-w-xl">{shortDesc}</p>

            {/* 3 free stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Duration',    value: pd.duration || (isUG ? '3 Years' : '2 Years') },
                { label: 'Eligibility', value: eligibility },
                { label: 'NAAC Grade',  value: u.naac },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-surface-1 px-3 py-2.5 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-3 mb-1">{s.label}</div>
                  <div className="text-sm font-bold text-navy">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Approvals */}
            <div className="mt-4 flex flex-wrap gap-2">
              {u.approvals.slice(0, 4).map(a => (
                <span key={a} className="flex items-center gap-1 text-[10px] font-semibold text-ink-2 bg-surface-1 border border-border px-2 py-1 rounded-full">
                  <CheckCircle size={10} className="text-green-500"/> {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── LOCKED SECTION ──────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-border">
          {/* Blurred placeholder */}
          <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.4 }} aria-hidden>
            <div className="bg-white p-6 border-b border-border">
              <div className="text-sm font-bold text-navy mb-3">Fee Breakdown</div>
              <div className="space-y-2">
                {['Total Programme Fee', 'Semester Fee', 'Annual Fee', 'EMI Option'].map(l => (
                  <div key={l} className="flex justify-between text-xs py-1.5 border-b border-border-light">
                    <span className="text-ink-3">{l}</span>
                    <span className="font-bold text-navy">₹██,███</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-1 p-6 border-b border-border">
              <div className="text-sm font-bold text-navy mb-3">Semester-wise Syllabus</div>
              {[1,2,3,4].map(n => (
                <div key={n} className="mb-2">
                  <div className="text-xs font-semibold text-ink-2 mb-1">Semester {n}</div>
                  <div className="flex flex-wrap gap-1">
                    {[1,2,3,4].map(k => <span key={k} className="px-2 py-0.5 rounded bg-border text-transparent text-[10px]">████████</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6">
              <div className="text-sm font-bold text-navy mb-3">Career & Placement Outcomes</div>
              <div className="grid grid-cols-2 gap-3">
                {['Avg Salary', 'Top Recruiters', 'Job Roles', 'Hiring Rate'].map(l => (
                  <div key={l} className="p-3 rounded-lg bg-surface-1 border border-border">
                    <div className="text-[9px] text-ink-3">{l}</div>
                    <div className="text-sm font-bold text-navy mt-1">████████</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex items-start justify-center pt-8 px-4"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.97) 18%, rgba(255,255,255,1) 40%)' }}>
            <div className="w-full max-w-sm">
              {!submitted ? (
                <div className="bg-white rounded-2xl border border-border shadow-xl p-6">
                  <div className="text-center mb-5">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="text-base font-extrabold text-navy leading-snug">Get Full Details</div>
                    <div className="text-[11px] text-ink-3 mt-1">Fees · Syllabus & Admission Info</div>
                    <div className="mt-2 px-3 py-1.5 bg-amber/10 rounded-lg inline-block">
                      <span className="text-xs font-bold text-amber-text">{u.name} · {program} · {spec}</span>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-ink-2 mb-1 block">Your Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-ink-2 mb-1 block">Phone Number *</label>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-amber transition-colors">
                        <span className="px-3 py-2.5 text-sm font-semibold text-ink-3 bg-surface-1 border-r border-border shrink-0">+91</span>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                          maxLength={10}
                          required
                          className="flex-1 px-3 py-2.5 text-sm text-ink focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity"
                      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting ? (
                        <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>Sending…</>
                      ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>Send Me Details on WhatsApp</>
                      )}
                    </button>
                    <p className="text-[10px] text-ink-3 text-center">
                      Details for <span className="font-semibold text-navy">{u.name} {program} — {spec}</span> will be sent to your WhatsApp.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-green-200 shadow-xl p-6 text-center">
                  <div className="text-3xl mb-3">✅</div>
                  <div className="text-base font-extrabold text-navy mb-2">Thank you, {name.trim()}!</div>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    You will receive full details of{' '}
                    <span className="font-semibold text-navy">{u.name} Online {program} {spec}</span>{' '}
                    on your WhatsApp{' '}
                    <span className="font-semibold text-green-700">({maskedPhone})</span>{' '}
                    shortly.
                  </p>
                  <div className="mt-4 text-[11px] text-ink-3">Redirecting you to WhatsApp…</div>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${buildWAMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
                  >
                    Open WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other Universities */}
        {otherUnis.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-navy mb-4">Other Universities Offering {program}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {otherUnis.map(ou => {
                const opd = ou.programDetails?.[program]
                return (
                  <Link
                    key={ou.id}
                    href={`/universities/${ou.id}/${programSlug}`}
                    className="block bg-white border border-border rounded-xl overflow-hidden hover:border-amber transition-colors"
                  >
                    <div style={{ height: 3, background: ou.color }} />
                    <div className="p-4">
                      <div className="font-bold text-navy text-sm mb-1">{ou.name}</div>
                      <div className="text-xs text-ink-3 mb-2">
                        {ou.city}{ou.nirf < 200 ? ` · NIRF #${ou.nirf}` : ''} · NAAC {ou.naac}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-2">Fees: <strong>{opd?.fees || formatFee(ou.feeMin)}</strong></span>
                        <span className="text-amber font-semibold">{opd?.avgSalary?.split('–')[0] || '₹4L'}+</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
