'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function MetaPixelEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof (window as any).fbq !== 'function') return
    ;(window as any).fbq('track', 'PageView')
  }, [pathname, searchParams])

  return null
}
