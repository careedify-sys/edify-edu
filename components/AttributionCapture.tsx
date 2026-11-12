'use client'

// Mounted once in app/layout.tsx. On a full page load it records where the
// visitor came from in a first-party cookie, which /api/enquiry reads when a
// form is submitted. Rule and field list: lib/attribution.ts.
// Client-side navigation does not re-run this, which is correct: those moves
// are internal and must never replace the real source.

import { useEffect } from 'react'
import { ATTR_COOKIE, ATTR_MAX_AGE_SECONDS, attributionFromLocation } from '@/lib/attribution'

export default function AttributionCapture() {
  useEffect(() => {
    try {
      const attr = attributionFromLocation(window.location.href, document.referrer, window.location.hostname)
      if (!attr) return
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie =
        `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(attr))}` +
        `; Path=/; Max-Age=${ATTR_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
    } catch {
      // Attribution is best effort. It must never break a page.
    }
  }, [])
  return null
}
