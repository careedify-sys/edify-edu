'use client'
import { useState } from 'react'
import { Phone, Mail, MapPin, CheckCircle, Send } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '',
          subject: 'Contact Form — Edify',
          ...form,
        }),
      })
      if (res.ok) setStatus('sent')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-surface-1 min-h-screen">
      {/* Hero */}
      <div className="bg-navy text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-lg text-white/70">
            Questions about admissions, fees, or anything else? We&apos;re here to help.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-navy mb-5">Get in Touch</h2>
              {[
                { icon: Phone, label: 'Phone', value: '+91 70612 85806', href: 'tel:7061285806' },
                { icon: Mail, label: 'Email', value: 'hello@edifyedu.in', href: 'mailto:hello@edifyedu.in' },
                { icon: MapPin, label: 'Location', value: 'India (Pan-India service)', href: null },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4 mb-5 last:mb-0">
                  <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-amber" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-3 font-semibold uppercase tracking-wide mb-0.5">{item.label}</div>
                    {item.href
                      ? <a href={item.href} className="font-semibold text-navy hover:text-amber">{item.value}</a>
                      : <div className="font-semibold text-navy">{item.value}</div>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <div className="font-bold text-navy mb-3">Response Times</div>
              <ul className="space-y-2 text-sm text-ink-2">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sage shrink-0" /> Phone: Mon–Sat, 9am–7pm IST</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sage shrink-0" /> Email: Within 24 hours</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sage shrink-0" /> WhatsApp: Usually within 2 hours</li>
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              {status === 'sent' ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-sage mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-navy mb-2">Message Sent!</h3>
                  <p className="text-ink-2">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-navy mb-1">Send a Message</h2>
                  <p className="text-sm text-ink-3 mb-5">Free counselling · No spam · No obligation</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-2 mb-1.5">Your Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        placeholder="Rahul Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-2 mb-1.5">Phone Number *</label>
                      <input required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                        placeholder="+91 98765 43210" type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">Email Address *</label>
                    <input required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      placeholder="rahul@example.com" type="email"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">Your Question / Message *</label>
                    <textarea required value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                      placeholder="e.g. I want to compare MBA fees between NMIMS and Amity. My budget is ₹1.5L..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-2 text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 resize-none" />
                  </div>

                  <button type="submit" disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', opacity: status === 'sending' ? 0.7 : 1 }}>
                    <Send className="w-4 h-4" />
                    {status === 'sending' ? 'Sending...' : 'Send Message →'}
                  </button>

                  {status === 'error' && (
                    <p className="text-red-500 text-xs text-center">Something went wrong. Please call us directly.</p>
                  )}

                  <p className="text-xs text-ink-3 text-center">
                    By submitting, you agree to our privacy policy. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* About / FAQ section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold text-navy mb-3">How EdifyEdu Helps You Choose</h2>
            <p className="text-ink-2 text-sm leading-relaxed mb-4">
              Picking an online degree is not simple. Fees vary, NAAC grades differ, and not every UGC approved program carries the same employer recognition. EdifyEdu compares over 127 universities on verified data so you can make a confident decision without spending weeks on research.
            </p>
            <p className="text-ink-2 text-sm leading-relaxed">
              Our counsellors have personally reviewed admission processes, syllabus structures, and placement records at each institution. When you contact us, you get a straightforward conversation focused on your budget, your current qualification, and your career target. We do not push you toward any particular university.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy mb-3">Common Questions We Answer</h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-navy text-sm">Which online MBA is best for working professionals?</p>
                <p className="text-ink-3 text-sm mt-1">It depends on your industry, budget, and how much time you can give each week. Our counsellors match you with options that fit your actual situation rather than giving a generic top-10 list.</p>
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">Are online degrees accepted by government employers?</p>
                <p className="text-ink-3 text-sm mt-1">Degrees from UGC DEB approved universities are treated on par with regular degrees for PSU and government job eligibility. We can confirm which specific universities hold this approval before you apply.</p>
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">Can I get a scholarship for online programs?</p>
                <p className="text-ink-3 text-sm mt-1">Several universities offer merit-based and need-based scholarships. Contact us with your last examination score and we will check your eligibility across multiple universities at once.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
