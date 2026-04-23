'use client'

import { useState, useEffect } from 'react'

interface NavItem {
  id: string
  label: string
}

interface Props {
  items: NavItem[]
}

export default function StickySectionNav({ items }: Props) {
  const [activeId, setActiveId] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsExpanded(false)
    }
  }

  return (
    <nav
      className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm"
      style={{ WebkitBackdropFilter: 'blur(8px)' }}
    >
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold"
          style={{ color: '#0B1533' }}
        >
          <span>Jump to section</span>
          <span className="text-xs text-slate-400">{isExpanded ? '▲' : '▼'}</span>
        </button>
        {isExpanded && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeId === item.id
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: horizontal scroll */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 py-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeId === item.id
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
