'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, BarChart2, Plus } from 'lucide-react'
import { getCompareList, removeFromCompare, clearCompare, MAX_COMPARE } from '@/lib/compare-store'
import { getSlimById as getUniversityById } from '@/lib/data-slim'

export default function CompareBar() {
  const [list, setList] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    setList(getCompareList())
    const handler = () => setList(getCompareList())
    window.addEventListener('compare-updated', handler)
    return () => window.removeEventListener('compare-updated', handler)
  }, [])

  if (list.length === 0) return null

  const unis = list.map(id => getUniversityById(id)).filter(Boolean)

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'var(--z-modal)', background: 'var(--navy-mid)', borderTop: '2px solid var(--amber)', boxShadow: '0 -8px 32px rgba(0,0,0,0.6)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
        ⚖️ Compare ({list.length}/{MAX_COMPARE})
      </div>

      <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
        {unis.map(u => u && (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 10px 6px 12px', borderRadius: '8px',
            background: 'var(--navy)', border: `1px solid ${u.color}`,
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: 'var(--r-pill)', background: u.color }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--surface)' }}>{u.abbr}</span>
            <span className="text-[11px] text-ink-2">{u.nirf < 200 ? `NIRF #${u.nirf}` : u.naac}</span>
            <button onClick={() => removeFromCompare(u.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', padding: '0', display: 'flex', alignItems: 'center' }}>
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: MAX_COMPARE - list.length }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px dashed #1e2f45', color: 'var(--ink-2)', fontSize: '12px', }}>
            <Plus size={12} /> Add university
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={clearCompare}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #1e2f45', color: 'var(--ink-3)', background: 'transparent', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          Clear
        </button>
        <button
          onClick={() => router.push(`/compare?ids=${list.join(',')}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: 'var(--navy)', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          <BarChart2 size={15} />
          Compare Now →
        </button>
      </div>
    </div>
  )
}
