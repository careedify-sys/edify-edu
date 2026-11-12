'use client'

// Blog posts carry "Talk to a counsellor" links to /contact in their HTML
// (101 links across 59 posts on 12 Nov 2026), plus template links like
// "Talk to our counsellor for free guidance". Each one took the reader off the
// article to a separate page, and most never filled the form there. This opens
// the enquiry form in place instead, so the reader stays on the post and the
// lead keeps the post as its source page.
//
// Ctrl/Cmd/Shift/middle clicks still open /contact normally.

import { useCallback, useEffect, useState } from 'react'
import EnquiryModal from './EnquiryModalDynamic'

export default function BlogContactIntercept({
  universityName,
  defaultProgram,
}: {
  universityName?: string
  defaultProgram?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.closest('main')) return
      let url: URL
      try { url = new URL(a.href, window.location.href) } catch { return }
      const sameSite = url.origin === window.location.origin || /(^|\.)edifyedu\.in$/.test(url.hostname)
      if (!sameSite || url.pathname.replace(/\/$/, '') !== '/contact') return
      e.preventDefault()
      setOpen(true)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  return (
    <EnquiryModal
      isOpen={open}
      onClose={close}
      universityName={universityName}
      defaultProgram={defaultProgram}
      sourcePage={typeof window !== 'undefined' ? window.location.pathname : undefined}
      source="blog_contact_link"
    />
  )
}
