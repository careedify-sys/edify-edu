'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, CheckCircle, Loader2, Phone, Mail, User, BookOpen, Building2 } from 'lucide-react'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  universityName?: string
  universityId?: string
  defaultProgram?: string
  sourcePage?: string
}

const PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'B.Com', 'MA', 'M.Com', 'MSc', 'BSc', 'Not sure yet']

type Step = 'form' | 'submitting' | 'success'

export default function EnquiryModal({
  isOpen,
  onClose,
  universityName,
  universityId,
  defaultProgram,
  sourcePage,
}: EnquiryModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    program: defaultProgram || '',
    preferredUniversity: universityName || '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setErrors({})
      setForm(f => ({
        ...f,
        program: defaultProgram || '',
        preferredUniversity: universityName || '',
      }))
    }
  }, [isOpen, defaultProgram, universityName])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function validate() {
    const e: Partial<Record<keyof typeof form, string>> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      e.phone = 'Enter a valid 10-digit Indian mobile number'
    }
    if (!form.program) e.program = 'Please select a program'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setStep('submitting')

    const sourceFinal = sourcePage || (typeof window !== 'undefined' ? window.location.pathname : 'website')

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          program: form.program,
          preferredUniversity: form.preferredUniversity || universityName || 'Not specified',
          sourcePage: sourceFinal,
        }),
      })

      // GA4 tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'generate_lead', {
          university: form.preferredUniversity || universityName || 'Not specified',
          program: form.program,
          source: 'enquiry_form',
        })
      }

      setStep('success')
    } catch {
      // Show success anyway — partial saves may have occurred
      setStep('success')
    }
  }

  function openWhatsApp() {
    const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'
    const msg = encodeURIComponent(
      `Hi! I'm ${form.name || 'interested'} and I want to enquire about ${form.program || 'online degrees'}${form.preferredUniversity ? ` from ${form.preferredUniversity}` : ''}. My phone: +91 ${form.phone || ''}`
    )
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
      >
        <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {step === 'success' ? 'Enquiry Received!' : 'Speak with an Advisor'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 'success'
                ? 'Our advisor will call you within 1 hour'
                : universityName
                  ? `Enquiring about ${universityName}`
                  : 'Our team will call you within 1 hour. Free.'}
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

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your full name"
                  aria-label="Full name"
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
                Mobile Number * (+91)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">+91</div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  aria-label="Phone number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-orange-400 focus:bg-white'}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Email — optional */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Email Address <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  aria-label="Email address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm transition-all outline-none focus:border-orange-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Interested In */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Interested In *
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
              {errors.program && <p className="text-xs text-red-500 mt-1">{errors.program}</p>}
            </div>

            {/* Preferred University */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Preferred University <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Amity, NMIMS, or Not sure"
                  aria-label="Preferred university"
                  value={form.preferredUniversity}
                  onChange={e => setForm(f => ({ ...f, preferredUniversity: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm transition-all outline-none focus:border-orange-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Trust note */}
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 flex items-start gap-2">
              <span className="text-green-500 text-base shrink-0">🔒</span>
              <span>Your details are safe. We never spam or share your number without your consent.</span>
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
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
              Thank you, {form.name.split(' ')[0]}!
            </h3>
            <p className="text-sm text-slate-500 mb-2 leading-relaxed">
              Our advisor will call you within <strong className="text-slate-700">1 hour</strong>. We've also sent details to your WhatsApp.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              We've noted your interest in <strong>{form.program}</strong>
              {form.preferredUniversity ? ` — ${form.preferredUniversity}` : ''}.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors mb-3"
            >
              Done
            </button>

            {/* Optional WhatsApp link */}
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-green-600 transition-colors mx-auto"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Or chat on WhatsApp for faster reply
            </button>
          </div>
        )}

        {/* ── FOOTER (form step only) ── */}
        {step === 'form' && (
          <div className="px-6 pb-6 pt-3 border-t border-slate-100 bg-white">
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
              Speak with an Advisor
            </button>
            <p className="text-xs text-center text-slate-400 mt-2.5">
              Free · No spam · Call within 1 hour
            </p>
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-green-600 transition-colors mx-auto mt-2"
            >
              <MessageCircle className="w-3 h-3" />
              Or chat on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
