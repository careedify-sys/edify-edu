'use client'

import { useEffect, useRef, useState } from 'react'
import type { UniSlim } from '@/lib/data-slim'
import UniversityCard from './UniversityCard'
import type { CardFees } from '@/lib/card-fees'

interface Props {
  unis: UniSlim[]
  // Gated fee strings from lib/card-fees.ts; MBA is the card's headline fee.
  cardFees?: CardFees
}

export default function AnimatedUniGrid({ unis, cardFees }: Props) {
  const [visible, setVisible] = useState<boolean[]>(() => Array(unis.length).fill(false))
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
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
            }, i * 60)
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {unis.map((u, i) => (
          <div
            key={u.id}
            ref={el => { cardRefs.current[i] = el }}
            className="ani-uni-card"
            style={{
              opacity: visible[i] ? 1 : 0,
              transform: visible[i] ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 400ms ease-out, transform 400ms ease-out',
            }}
          >
            {(() => {
              const fee = cardFees?.[u.id]?.MBA?.text ?? null
              return <UniversityCard u={u} programFee={fee} feeProgram={fee ? 'MBA' : undefined} />
            })()}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ani-uni-card > * {
          transition: transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out !important;
        }
        .ani-uni-card:hover > * {
          transform: translateY(-4px) scale(1.015) !important;
          box-shadow: 0 8px 28px rgba(11,21,51,0.12) !important;
          border-color: rgba(244,160,36,0.2) !important;
        }
      ` }} />
    </>
  )
}
