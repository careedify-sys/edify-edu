'use client'
// Second line of defence for the CRM and WhatsApp inbox. The root layout does
// not load Clarity, the Meta Pixel, Google tags or Tawk on /leads at all, but
// if a tag was already running (a client-side navigation from a public page),
// stop it here so it cannot record lead or message text.
import { useEffect } from 'react'

type W = Window & {
  clarity?: (...a: unknown[]) => void
  Tawk_API?: { hideWidget?: () => void; shutdown?: () => void; onLoad?: () => void }
}

export default function PrivateAreaGuard() {
  useEffect(() => {
    const w = window as W
    try { w.clarity?.('stop') } catch { /* not loaded */ }
    try { w.Tawk_API?.hideWidget?.(); w.Tawk_API?.shutdown?.() } catch { /* not loaded */ }
  }, [])
  return null
}
