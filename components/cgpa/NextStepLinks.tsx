'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const LINKS = [
  { href: '/blog/phd-full-form-doctorate-meaning-india', label: 'PhD Full Form & Eligibility' },
  { href: '/programs/mba', label: 'Best Online MBA Colleges Compared' },
  { href: '/programs/bba', label: 'Best Online BBA Colleges Compared' },
  { href: '/programs/mca', label: 'Online MCA Programs' },
  { href: '/blog/best-online-mba-colleges-india-2026', label: 'Best Online MBA Colleges 2026' },
]

export default function NextStepLinks() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="font-display text-xl md:text-2xl font-bold text-navy mb-4">
        Got your percentage? Here&apos;s what it unlocks
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => trackEvent('calculator_bridge_click', { target_path: href })}
            className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
          >
            <span className="shrink-0 w-2 h-2 rounded-full bg-amber" />
            <span className="text-sm font-semibold text-navy">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
