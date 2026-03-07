'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, CheckCircle, Loader2, Phone, Mail, User, BookOpen, ChevronDown } from 'lucide-react'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  universityName?: string
  universityId?: string
  defaultProgram?: string
}

const PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'B.Com', 'MA', 'M.Com', 'MSc', 'Not sure yet']
const TIMINGS = ['Morning (9am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–8pm)', 'Anytime']

type Step = 'form' | 'submitting' | 'success'

export default function EnquiryModal({
  isOpen,
  onClose,
  universityName,
  universityId,
  defaultProgram,
}: EnquiryModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    program: defaultProgram || '',
    callTime: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setErrors({})
      setForm(f => ({ ...f, program: defaultProgram || '' }))
    }
  }, [isOpen, defaultProgram])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.program) e.program = 'Please select a program'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setStep('submitting')

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      program: form.program,
      callTime: form.callTime,
      message: form.message,
      university: universityName || 'Not specified',
      universityId: universityId || '',
      source: 'EdifyEdu.in Enquiry Form',
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    }

    try {
      // ── 1. EMAIL via Web3Forms ──────────────────────────────────────
      const web3Key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'ff4024f8-7668-4ec0-853c-c6be566b536b'
      if (web3Key && web3Key !== 'YOUR_WEB3FORMS_KEY_HERE') {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: web3Key,
            subject: `🎓 New Enquiry — ${form.name} interested in ${form.program}${universityName ? ` @ ${universityName}` : ''}`,
            from_name: 'EdifyEdu Leads',
            ...payload,
          }),
        })
      }

      // ── 2. GOOGLE SHEETS via Apps Script ───────────────────────────
      const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL
      if (sheetUrl && sheetUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setStep('success')
    } catch (err) {
      // Still show success to user — data may have partially saved
      console.error('Submission error:', err)
      setStep('success')
    }
  }

  function handleWhatsApp() {
    const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'
    const msg = encodeURIComponent(
      `Hi! I'm interested in ${form.program || 'an online degree'}${universityName ? ` from ${universityName}` : ''}.\n\nMy details:\nName: ${form.name || 'Not provided'}\nPhone: ${form.phone || 'Not provided'}\nEmail: ${form.email || 'Not provided'}\n\nCould you share more information?`
    )
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
      >
        {/* Orange top bar */}
        <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {step === 'success' ? 'Enquiry Received! 🎉' : 'Get Free Counselling'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 'success'
                ? "We'll call you within 24 hours"
                : universityName
                  ? `Enquiring about ${universityName}`
                  : 'Our team will call you within 24 hours. Free.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors ml-4 shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* ── FORM ── */}
        {step === 'form' && (
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-orange-400 focus:bg-white'}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">+91</div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-orange-400 focus:bg-white'}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-orange-400 focus:bg-white'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Program */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Program Interested In *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.program}
                  onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                  className={`w-full pl-10 pr-8 py-3 rounded-xl border text-sm transition-all outline-none appearance-none cursor-pointer ${errors.program ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-orange-400 focus:bg-white'}`}
                >
                  <option value="">Select program</option>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.program && <p className="text-xs text-red-500 mt-1">{errors.program}</p>}
            </div>

            {/* Best time to call */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Best Time to Call
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMINGS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, callTime: t }))}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${form.callTime === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Any specific question? (optional)
              </label>
              <textarea
                placeholder="e.g. Is this valid for government jobs? What's the EMI option?"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-orange-400 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Trust note */}
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 flex items-start gap-2">
              <span className="text-green-500 text-base shrink-0">🔒</span>
              <span>Your details are safe. We will never spam you or share your number with universities without your consent.</span>
            </div>
          </div>
        )}

        {/* ── SUBMITTING ── */}
        {step === 'submitting' && (
          <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="font-semibold text-slate-700 text-base">Sending your enquiry...</p>
            <p className="text-sm text-slate-400 mt-1">Just a moment</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">You're all set, {form.name.split(' ')[0]}!</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We've received your enquiry about <strong>{form.program}</strong>
              {universityName ? ` at ${universityName}` : ''}.
              Our counsellor will reach out to you within 24 hours.
            </p>

            {/* WhatsApp CTA */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-green-800 mb-1">Want a faster response?</p>
              <p className="text-xs text-green-700 mb-3">Message us directly on WhatsApp — we usually reply in minutes.</p>
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* ── FOOTER ACTIONS (only on form step) ── */}
        {step === 'form' && (
          <div className="px-6 pb-6 pt-3 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              {/* WhatsApp quick contact */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold text-sm hover:bg-green-100 transition-colors shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
                Submit Enquiry
              </button>
            </div>
            <p className="text-xs text-center text-slate-400 mt-3">
              Free counselling · No spam · Call within 24 hours
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
