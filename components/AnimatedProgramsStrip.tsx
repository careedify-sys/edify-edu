'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Program {
  key: string
  label: string
  icon: string
  desc: string
}

interface Props {
  programs: Program[]
}

export default function AnimatedProgramsStrip({ programs }: Props) {
  const [visible, setVisible] = useState<boolean[]>(() => Array(programs.length).fill(false))
  const stripRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    itemRefs.current.forEach((el, i) => {
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
        { threshold: 0.1 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <section style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div
          ref={stripRef}
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            paddingBottom: 4,
          }}
        >
          {programs.map((p, i) => {
            const slug = p.key.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')
            return (
              <Link
                key={i}
                href={`/programs/${slug}`}
                ref={el => { itemRefs.current[i] = el }}
                className="prog-chip"
                style={{
                  flexShrink: 0,
                  flexDirection: 'column',
                  minWidth: 80,
                  padding: '10px 14px',
                  gap: 4,
                  scrollSnapAlign: 'start',
                  opacity: visible[i] ? 1 : 0,
                  transform: visible[i] ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 350ms ease-out, transform 350ms ease-out',
                }}
              >
                <span className="text-[20px]">{p.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>{p.desc}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        div[style*="scrollbar-width"]::-webkit-scrollbar { display: none; }
        .prog-chip { will-change: transform; }
        .prog-chip:hover {
          transform: scale(1.1) !important;
          background: var(--amber-light) !important;
          color: var(--amber) !important;
          transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1) !important;
        }
        .prog-chip:hover span:last-of-type { color: var(--amber) !important; }
        @media (prefers-reduced-motion: reduce) {
          .prog-chip { transform: scale(1) !important; }
          .prog-chip:hover { transform: scale(1) !important; }
        }
      ` }} />
    </section>
  )
}
