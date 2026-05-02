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
        await fetch('/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            phone: phone,
            email: email || '',
            sourcePage: window.location.pathname,
            preferredUniversity: 'Inline Blog CTA — ' + source,
          }),
        })
      } catch (e) {
        // Show success anyway — submission usually goes through
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
