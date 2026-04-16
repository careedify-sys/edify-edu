'use client'

import { useState } from 'react'
import { CheckCircle2, Send, MessageCircle } from 'lucide-react'

const PROGRAMS = ['Online MBA', 'Online MCA', 'Online BBA', 'Online BCA', 'Other Courses']

export default function BlogLeadForm({ title, desc }: { title?: string; desc?: string }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [form, setForm] = useState({ name: '', phone: '', program: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.program) return
    setStatus('submitting')

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          program: form.program,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : 'blog',
        }),
      })
    } catch {
      // show success regardless
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="bg-sage/10 border border-sage/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-sage" />
        </div>
        <h3 className="text-xl font-bold text-navy mb-2">Enquiry Received!</h3>
        <p className="text-ink-3 text-sm mb-4">
          Our advisor will reach out within <strong>1 hour</strong> to guide you.
        </p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'}?text=${encodeURIComponent(`Hi! I'm ${form.name}, interested in ${form.program}. Please guide me.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-green-600 transition-colors"
        >
          <MessageCircle size={13} />
          Or chat on WhatsApp for faster reply
        </a>
      </div>
    )
  }

  return (
    <div className="bg-navy rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber/10 blur-3xl -mr-16 -mt-16 rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber/5 blur-3xl -ml-16 -mb-16 rounded-full" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber/10 border border-amber/20 rounded-full mb-4">
          <span className="w-2 h-2 bg-amber rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-amber uppercase tracking-wider">Advisor Available Now</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-2 leading-tight">
          {title || 'Apply Now for 2026 Batch'}
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color:'rgba(255,255,255,0.75)' }}>
          {desc || 'Get a free 1-on-1 session with our experts to find your perfect university match.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all font-medium"
          />
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 text-sm font-semibold">+91</span>
            <input
              required
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all font-medium"
            />
          </div>
          <select
            required
            value={form.program}
            onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber/50 transition-all font-medium"
          >
            <option value="" className="bg-navy">Select Program</option>
            {PROGRAMS.map(p => (
              <option key={p} value={p} className="bg-navy">{p}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-4 bg-gradient-to-r from-amber to-amber-bright text-navy font-bold rounded-xl shadow-lg shadow-amber/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
          >
            {status === 'submitting' ? (
              <span className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
            ) : (
              <>
                Connect with an Advisor
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-white/40">
            Free · No spam · Advisor responds within 1 hour
          </p>
        </form>
      </div>
    </div>
  )
}
