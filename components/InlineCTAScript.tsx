'use client'

import { useEffect } from 'react'

export default function InlineCTAScript() {
  useEffect(() => {
    // Define the global handler for inline blog CTAs
    (window as any).submitInlineCTA = async function submitInlineCTA(source: string) {
      const nameEl = document.getElementById('cta-' + source + '-name') as HTMLInputElement | null
      const phoneEl = document.getElementById('cta-' + source + '-phone') as HTMLInputElement | null
      const emailEl = document.getElementById('cta-' + source + '-email') as HTMLInputElement | null

      const name = nameEl ? nameEl.value.trim() : ''
      const phone = phoneEl ? phoneEl.value.trim() : ''
      const email = emailEl ? emailEl.value.trim() : ''

      if (!name || !phone) {
        alert('Please enter your name and WhatsApp number.')
        return
      }
      if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) {
        alert('Please enter a valid 10-digit Indian mobile number.')
        return
      }

      const btn = document.querySelector('#cta-' + source + '-form .cta-submit') as HTMLButtonElement
        || document.querySelector('#cta-' + source + '-form button') as HTMLButtonElement
      if (btn) {
        btn.textContent = 'Sending...'
        btn.disabled = true
      }

      try {
        const res = await fetch('/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            phone: phone,
            email: email || '',
            sourcePage: window.location.pathname,
            source: 'blog_inline',
            preferredUniversity: 'Inline Blog CTA: ' + source,
          }),
        })
        if (!res.ok) throw new Error('API error')
      } catch (e) {
        if (btn) { btn.textContent = 'Try Again'; btn.disabled = false }
        const errorEl = document.getElementById('cta-' + source + '-error')
        if (errorEl) {
          errorEl.style.display = 'block'
        } else {
          const formEl = document.getElementById('cta-' + source + '-form')
          if (formEl) {
            const div = document.createElement('div')
            div.id = 'cta-' + source + '-error'
            div.style.cssText = 'text-align:center;padding:12px;margin-top:8px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca'
            div.innerHTML = '<p style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 8px">Couldn\'t submit right now</p>'
              + '<a href="https://wa.me/' + (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806')
              + '?text=' + encodeURIComponent('Hi, I tried the form on edifyedu.in but it didn\'t go through. I want the fee sheet.')
              + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:#25D366;text-decoration:none">WhatsApp Us</a>'
            formEl.appendChild(div)
          }
        }
        return
      }

      const formEl = document.getElementById('cta-' + source + '-form')
      const successEl = document.getElementById('cta-' + source + '-success')
      if (formEl) formEl.style.display = 'none'
      if (successEl) successEl.style.display = 'block'

      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'generate_lead', {
          source: source,
          form_type: 'inline_blog_cta',
        })
      }
    }
  }, [])

  return null
}
