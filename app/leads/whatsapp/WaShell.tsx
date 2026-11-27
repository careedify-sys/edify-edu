'use client'
// Shared frame for the WhatsApp screens: brand bar, section tabs, toast.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export const TABS = [
  ['inbox', '/leads/whatsapp', 'Inbox'],
  ['contacts', '/leads/whatsapp/contacts', 'Add numbers'],
  ['lists', '/leads/whatsapp/lists', 'Lists'],
  ['templates', '/leads/whatsapp/templates', 'Templates'],
  ['campaigns', '/leads/whatsapp/campaigns', 'Campaigns'],
  ['reports', '/leads/whatsapp/reports', 'Reports'],
  ['settings', '/leads/whatsapp/settings', 'Campaign settings'],
] as const
export type TabKey = (typeof TABS)[number][0]

export function WaTabs({ active }: { active: TabKey }) {
  return (
    <nav className="wa-tabsbar" aria-label="WhatsApp sections">
      {TABS.map(([k, href, label]) => (
        <a key={k} href={href} className={k === active ? 'on' : ''} aria-current={k === active ? 'page' : undefined}>{label}</a>
      ))}
    </nav>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ text: string; bad: boolean } | null>(null)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  const show = useCallback((text: string, bad = false) => {
    setToast({ text, bad })
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => setToast(null), bad ? 7000 : 3500)
  }, [])
  useEffect(() => () => { if (t.current) clearTimeout(t.current) }, [])
  const node = toast ? <div className={`toast ${toast.bad ? 'bad' : ''}`} role="status">{toast.text}</div> : null
  return { show, node }
}

export function WaShell({ active, title, mode, children, error }: { active: TabKey; title: string; mode: 'mock' | 'live'; children: ReactNode; error?: string | null }) {
  return (
    <div className="wa">
      <header className="wa-top">
        <a href="/leads" className="wa-brand" title="Back to the CRM">
          <img src="/logos/university_logos/edify_logo_transparent_onlight.svg" alt="edifyedu.in" width={108} height={36} />
        </a>
        <h1 className="wa-title">{title}</h1>
        {mode === 'mock' && <span className="pill pill-amber">Mock data: nothing is sent or saved</span>}
        <nav className="wa-nav"><a href="/leads">Leads CRM</a></nav>
      </header>
      <WaTabs active={active} />
      {error && <div className="banner banner-red">{error}</div>}
      <main className="wa-page"><div className="wrap">{children}</div></main>
    </div>
  )
}

export { inr, fmt, when, pct } from './format'
