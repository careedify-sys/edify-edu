'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, BarChart2, Phone } from 'lucide-react'

/* ─── Mobile Bottom Navigation ────────────────────────────────────
   Neuroscience: thumb-zone navigation reduces friction.
   App-like feel increases perceived quality and return visits.
   ─────────────────────────────────────────────────────────────── */
const TABS = [
  { href: '/',              icon: Home,     label: 'Home'    },
  { href: '/universities',  icon: Search,   label: 'Search'  },
  { href: '/compare',       icon: BarChart2, label: 'Compare' },
  ]

export default function BottomNav() {
  const path = usePathname()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setHidden(document.body.style.overflow === 'hidden')
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  if (hidden) return null

  return (
    <nav
      className="lg:hidden"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, background: '#fff', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -4px 20px rgba(11,29,53,0.08)', display: 'flex', }}>
      {TABS.map(tab => {
        const active = path === tab.href || (tab.href !== '/' && path.startsWith(tab.href))
        const Icon = tab.icon
        return (
          <Link key={tab.href} href={tab.href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '10px 4px 8px', textDecoration: 'none', transition: 'opacity 0.1s', color: active ? 'var(--amber)' : 'var(--ink-3)', }}>
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>
              {tab.label}
            </span>
            {active && (
              <div style={{ position: 'absolute', top: 0, width: '32px', height: '2px', borderRadius: '0 0 2px 2px', background: 'var(--amber)' }} />
            )}
          </Link>
        )
      })}
      {/* Enquire tab — amber highlight, most important action */}
      <a href="tel:+917061285806"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '10px 4px 8px', textDecoration: 'none', color: 'var(--sage)', }}>
        <Phone className="w-5 h-5" strokeWidth={1.8} />
        <span style={{ fontSize: '10px', fontWeight: 500 }}>Call Us</span>
      </a>
    </nav>
  )
}
