'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, List } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

interface Props {
  headings: Heading[]
  mobile?: boolean
}

export default function BlogTOC({ headings, mobile = false }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const callback: IntersectionObserverCallback = (entries) => {
      // Find the topmost visible heading
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    })

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current!.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88
      window.scrollTo({ top, behavior: 'smooth' })
    }
    if (mobile) setOpen(false)
  }

  if (headings.length === 0) return null

  const tocList = (
    <ul className="space-y-0.5">
      {headings.map((h) => {
        const isActive = activeId === h.id
        return (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? '12px' : '0px' }}>
            <button
              onClick={() => handleClick(h.id)}
              className={`
                w-full text-left text-[13px] leading-snug py-1.5 px-2 rounded-lg transition-all duration-150
                border-l-2
                ${isActive
                  ? 'border-amber text-amber font-semibold bg-amber/5'
                  : 'border-transparent text-slate-600 hover:text-navy hover:border-amber/40 hover:bg-slate-50'
                }
              `}
              style={{ color: isActive ? '#D4922A' : undefined }}
            >
              {h.text}
            </button>
          </li>
        )
      })}
    </ul>
  )

  // ── Mobile collapsible ────────────────────────────────────────────────
  if (mobile) {
    return (
      <div className="lg:hidden mb-6 rounded-xl border border-border bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-navy"
        >
          <span className="flex items-center gap-2">
            <List size={15} className="text-amber" />
            Jump to section
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-3 border-t border-border pt-2">{tocList}</div>
        </div>
      </div>
    )
  }

  // ── Desktop card ──────────────────────────────────────────────────────
  return (
    <div className="hidden lg:block rounded-2xl border border-border bg-white p-4 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <List size={14} className="text-amber shrink-0" />
        <span className="text-[11px] font-black text-navy uppercase tracking-widest">Table of Contents</span>
      </div>
      {tocList}
    </div>
  )
}
