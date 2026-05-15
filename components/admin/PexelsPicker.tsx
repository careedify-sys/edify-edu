'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Search, Image as ImageIcon, Loader2 } from 'lucide-react'

export interface PexelsPickerPhoto {
  id: number
  photographer: string
  photographer_url: string
  alt: string
  src: { original: string; large: string; medium: string; small: string }
  attribution: string
}

export interface PexelsPickerResult {
  url: string
  attribution: string
  alt: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (result: PexelsPickerResult) => void
  initialQuery?: string
}

const NAVY = '#0F1117'
const AMBER = '#D4A843'
const CREAM = '#FAF6EE'

export default function PexelsPicker({ open, onClose, onSelect, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [photos, setPhotos] = useState<PexelsPickerPhoto[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset when opened
  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
      setPhotos([])
      setPage(1)
      setHasSearched(false)
      setError('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, initialQuery])

  // Escape closes modal
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const fetchPhotos = useCallback(async (q: string, pageNum: number, append: boolean) => {
    if (!q.trim()) {
      setPhotos([])
      setHasSearched(false)
      return
    }
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/pexels?q=${encodeURIComponent(q.trim())}&page=${pageNum}&per_page=15`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Search failed')
      const next = Array.isArray(data.photos) ? data.photos : []
      setPhotos(prev => append ? [...prev, ...next] : next)
      setHasSearched(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to load photos')
      if (!append) setPhotos([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Debounce search on query change
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchPhotos(query, 1, false)
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, open, fetchPhotos])

  function handleSelect(photo: PexelsPickerPhoto) {
    onSelect({
      url: photo.src.large,
      attribution: photo.attribution,
      alt: photo.alt || query || '',
    })
    onClose()
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchPhotos(query, next, true)
  }

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,17,23,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 960, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: NAVY, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: `2px solid ${AMBER}`,
        }}>
          <ImageIcon size={18} color={AMBER} />
          <div style={{ fontWeight: 800, fontSize: 15 }}>Search Pexels</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginLeft: 8 }}>
            Free stock photos · Attribution auto-added
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 'auto', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              padding: 6, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '14px 20px', background: CREAM, borderBottom: '1px solid #E2E8F4' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for hero images, e.g. graduation, students, university"
              style={{
                width: '100%', padding: '10px 12px 10px 38px',
                borderRadius: 10, border: '1px solid #E2E8F4',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
                background: '#fff',
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '4 / 3', background: '#F1F5F9',
                  borderRadius: 10, animation: 'pexels-pulse 1.4s ease-in-out infinite',
                }} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#B91C1C', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {!loading && !error && hasSearched && photos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64788A' }}>
              <ImageIcon size={32} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>No photos found.</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search.</div>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64788A', fontSize: 13 }}>
              Type a search term above to find a hero image.
            </div>
          )}

          {!loading && photos.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
                {photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} onSelect={handleSelect} />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '10px 22px', borderRadius: 10,
                    background: loadingMore ? '#E2E8F4' : NAVY,
                    color: loadingMore ? '#64788A' : '#fff',
                    fontWeight: 700, fontSize: 13, border: 'none',
                    cursor: loadingMore ? 'wait' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading…</> : 'Load more'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer attribution notice */}
        <div style={{
          padding: '10px 20px', fontSize: 11, color: '#64788A',
          background: '#F8FAFC', borderTop: '1px solid #E2E8F4',
        }}>
          Images by{' '}
          <a href="https://pexels.com" target="_blank" rel="noopener nofollow" style={{ color: AMBER, fontWeight: 700 }}>Pexels</a>
          {' '}— attribution to the photographer is added automatically.
        </div>
      </div>

      <style jsx>{`
        @keyframes pexels-pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>
    </div>
  )
}

function PhotoCard({ photo, onSelect }: { photo: PexelsPickerPhoto; onSelect: (p: PexelsPickerPhoto) => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', borderRadius: 10, overflow: 'hidden',
        background: '#0F1117', aspectRatio: '4 / 3',
        cursor: 'pointer', border: '1px solid #E2E8F4',
      }}
      onClick={() => onSelect(photo)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src.medium}
        alt={photo.alt || photo.photographer}
        loading="lazy"
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.2s', transform: hover ? 'scale(1.04)' : 'scale(1)',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: hover ? 'linear-gradient(to top, rgba(15,17,23,0.85) 0%, rgba(15,17,23,0.2) 60%, transparent 100%)' : 'linear-gradient(to top, rgba(15,17,23,0.55) 0%, transparent 50%)',
        transition: 'background 0.2s',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: 10,
      }}>
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {photo.photographer}
        </div>
        {hover && (
          <button
            onClick={e => { e.stopPropagation(); onSelect(photo) }}
            style={{
              marginTop: 6, padding: '6px 12px', borderRadius: 8,
              background: AMBER, color: NAVY,
              fontSize: 12, fontWeight: 800, border: 'none',
              cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Select
          </button>
        )}
      </div>
    </div>
  )
}
