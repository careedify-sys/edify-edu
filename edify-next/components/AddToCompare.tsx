'use client'

import { useState, useEffect } from 'react'
import { BarChart2, Check, X } from 'lucide-react'
import { addToCompare, removeFromCompare, isInCompare, getCompareList, MAX_COMPARE } from '@/lib/compare-store'

interface AddToCompareProps {
  universityId: string
  size?: 'sm' | 'md'
}

export default function AddToCompare({ universityId, size = 'md' }: AddToCompareProps) {
  const [inList, setInList] = useState(false)
  const [listFull, setListFull] = useState(false)
  const [flash, setFlash] = useState<'added' | 'full' | null>(null)

  useEffect(() => {
    const update = () => {
      setInList(isInCompare(universityId))
      setListFull(getCompareList().length >= MAX_COMPARE && !isInCompare(universityId))
    }
    update()
    window.addEventListener('compare-updated', update)
    return () => window.removeEventListener('compare-updated', update)
  }, [universityId])

  function toggle() {
    if (inList) {
      removeFromCompare(universityId)
      setFlash(null)
    } else {
      const result = addToCompare(universityId)
      if (result.success) {
        setFlash('added')
        setTimeout(() => setFlash(null), 1500)
      } else {
        setFlash('full')
        setTimeout(() => setFlash(null), 2000)
      }
    }
  }

  const isSm = size === 'sm'

  return (
    <button onClick={toggle}
      title={inList ? 'Remove from compare' : listFull ? 'Compare list full (max 3)' : 'Add to compare'}
      style={{
        display: 'flex', alignItems: 'center', gap: isSm ? '5px' : '7px',
        padding: isSm ? '6px 12px' : '9px 16px',
        borderRadius: '8px', fontSize: isSm ? '11px' : '13px', fontWeight: '600',
        cursor: listFull ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        border: `1px solid ${inList ? '#c9922a' : flash === 'full' ? '#ef4444' : '#1e2f45'}`,
        background: inList ? 'rgba(201,146,42,0.1)' : flash === 'full' ? 'rgba(239,68,68,0.08)' : 'transparent',
        color: inList ? '#c9922a' : flash === 'full' ? '#ef4444' : '#64748b',
        opacity: listFull && !inList ? 0.5 : 1,
      }}>
      {inList ? (
        <><Check size={isSm ? 11 : 13} /> {flash === 'added' ? 'Added!' : 'In Compare'} <X size={isSm ? 10 : 12} style={{ opacity: 0.6 }} /></>
      ) : flash === 'full' ? (
        <><BarChart2 size={isSm ? 11 : 13} /> Max 3 reached</>
      ) : (
        <><BarChart2 size={isSm ? 11 : 13} /> Add to Compare</>
      )}
    </button>
  )
}
