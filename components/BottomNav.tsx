'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, BarChart2, MessageCircle } from 'lucide-react'

const TABS = [
  { href: '/',              icon: Home,       label: 'Home'    },
  { href: '/universities',  icon: Search,     label: 'Search'  },
  { href: '/compare',       icon: BarChart2,  label: 'Compare' },
]

const WA_URL = 'https://wa.me/917061285806?text=Hi%2C%20I%20want%20to%20know%20about%20online%20universities'

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

  function handleWhatsAppClick() {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'cta_click', {
        source: 'bottomnav_whatsapp',
        page_path: window.location.pathname,
      })
    }
  }

  return (
    <nav
      className="lg:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
        background: '#fff', borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(11,29,53,0.08)', display: 'flex',
      }}
    >
      {TABS.map(tab => {
        const active = path === tab.href || (tab.href !== '/' && path.startsWith(tab.href))
        const Icon = tab.icon
        return (
          <Link key={tab.href} href={tab.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '3px', padding: '10px 4px 8px',
              textDecoration: 'none', transition: 'opacity 0.1s',
              color: active ? 'var(--amber)' : 'var(--ink-3)',
            }}
          >
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
      {/* WhatsApp tab */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '3px', padding: '10px 4px 8px',
          textDecoration: 'none', color: 'var(--ink-3)',
        }}
      >
        <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
        <span style={{ fontSize: '10px', fontWeight: 500 }}>WhatsApp</span>
      </a>
    </nav>
  )
}
