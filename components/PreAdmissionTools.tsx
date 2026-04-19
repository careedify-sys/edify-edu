'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Tool {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  external?: boolean
  action?: () => void
}

interface Props {
  universityId: string
}

const iconStyle = (bg: string): React.CSSProperties => ({
  width: 52, height: 52,
  borderRadius: 14,
  background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 10px',
  fontSize: 24,
})

export default function PreAdmissionTools({ universityId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [visible, setVisible] = useState<boolean[]>([])

  const TOOLS: Tool[] = [
    {
      id: 'emi',
      label: 'EMI Calculator',
      icon: <span style={iconStyle('linear-gradient(135deg,#dbeafe,#bfdbfe)')}>🧮</span>,
      href: '/tools/emi-calculator',
    },
    {
      id: 'compare',
      label: 'Fee Comparison',
      icon: <span style={iconStyle('linear-gradient(135deg,#dcfce7,#bbf7d0)')}>📊</span>,
      href: `/compare?university=${universityId}`,
    },
    {
      id: 'ugc',
      label: 'Verify UGC-DEB',
      icon: <span style={iconStyle('linear-gradient(135deg,#fef9c3,#fde68a)')}>🛡️</span>,
      href: 'https://deb.ugc.ac.in',
      external: true,
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: <span style={iconStyle('linear-gradient(135deg,#fef3c7,#fde68a)')}>🎁</span>,
      href: '/coupons',
    },
    {
      id: 'fit',
      label: 'Will This Fit Me?',
      icon: <span style={iconStyle('linear-gradient(135deg,#ede9fe,#ddd6fe)')}>🔍</span>,
      href: '/tools/program-fit',
    },
    {
      id: 'alumni',
      label: 'Talk to an Alumni',
      icon: <span style={iconStyle('linear-gradient(135deg,#fce7f3,#fbcfe8)')}>👥</span>,
      href: '/contact',
    },
  ]

  // IntersectionObserver stagger
  useEffect(() => {
    setVisible(Array(TOOLS.length).fill(false))
    const observers: IntersectionObserver[] = []
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisible(prev => {
                const next = [...prev]
                next[i] = true
                return next
              })
            }, i * 80)
            obs.disconnect()
          }
        },
        { threshold: 0.2 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  function scrollBy(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  const cardBase: React.CSSProperties = {
    width: 200, minWidth: 200, height: 160,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 200ms ease-out',
    scrollSnapAlign: 'start',
    textDecoration: 'none',
    flexShrink: 0,
  }

  return (
    <div style={{ marginBottom: 24, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
          Pre-Admission Tools
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid #e2e8f0', background: canScrollLeft ? '#fff' : '#f8fafc',
              cursor: canScrollLeft ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: canScrollLeft ? '#0B1533' : '#cbd5e1',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid #e2e8f0', background: canScrollRight ? '#fff' : '#f8fafc',
              cursor: canScrollRight ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: canScrollRight ? '#0B1533' : '#cbd5e1',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          paddingBottom: 4,
        }}
      >
        {TOOLS.map((tool, i) => {
          const cardStyle: React.CSSProperties = {
            ...cardBase,
            opacity: visible[i] ? 1 : 0,
            transform: visible[i] ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 400ms ease-out, transform 400ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out`,
          }

          const inner = (
            <>
              {tool.icon}
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0B1533', lineHeight: 1.3 }}>
                {tool.label}
              </span>
            </>
          )

          const hoverClass = 'pre-tool-card'
          const el = tool.href ? (
            tool.external ? (
              <a
                key={tool.id}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                ref={el => { cardRefs.current[i] = el as HTMLElement | null }}
                className={hoverClass}
                style={cardStyle}
              >
                {inner}
              </a>
            ) : (
              <Link
                key={tool.id}
                href={tool.href}
                ref={el => { cardRefs.current[i] = el as HTMLElement | null }}
                className={hoverClass}
                style={cardStyle}
              >
                {inner}
              </Link>
            )
          ) : (
            <div
              key={tool.id}
              ref={el => { cardRefs.current[i] = el }}
              onClick={tool.action}
              className={hoverClass}
              style={cardStyle}
            >
              {inner}
            </div>
          )

          return el
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pre-tool-card:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 8px 24px rgba(11, 21, 51, 0.12) !important;
          border-color: rgba(244, 160, 36, 0.3) !important;
        }
        div[style*="overflow-x"]::-webkit-scrollbar { display: none; }
      ` }} />
    </div>
  )
}
