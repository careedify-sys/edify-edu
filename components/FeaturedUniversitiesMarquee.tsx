'use client'

import Link from 'next/link'

interface Brand {
  name: string
  color: string
  tag: string
  id: string
}

interface Props {
  brands: Brand[]
  totalUnis: number
}

export default function FeaturedUniversitiesMarquee({ brands, totalUnis }: Props) {
  // Duplicate for seamless loop
  const track = [...brands, ...brands]

  return (
    <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            Featured universities
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          <Link href="/universities" style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            View all {totalUnis}+ →
          </Link>
        </div>

        {/* Marquee wrapper with fade masks */}
        <div
          style={{ position: 'relative', overflow: 'hidden' }}
          className="feat-marquee-wrap"
        >
          {/* Left fade */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, var(--surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Right fade */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(to left, var(--surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />

          {/* Scrollable track on mobile, marquee on desktop */}
          <div
            className="feat-marquee-track"
            style={{ display: 'flex', gap: 8, paddingBottom: 4 }}
          >
            {track.map((b, i) => (
              <Link key={i} href={`/universities/${b.id}`} className="no-underline shrink-0 feat-chip">
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    borderRadius: 'var(--r-sm)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    whiteSpace: 'nowrap',
                    transition: 'border-color 180ms, background 180ms',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 'var(--r-pill)', background: b.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{b.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)', paddingLeft: 6, borderLeft: '1px solid var(--border)' }}>{b.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop: auto-scroll marquee */
        @media (min-width: 768px) {
          .feat-marquee-track {
            animation: feat-scroll 50s linear infinite;
            width: max-content;
          }
          .feat-marquee-wrap:hover .feat-marquee-track {
            animation-play-state: paused;
          }
          @keyframes feat-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        }

        /* Mobile: native snap-scroll, no marquee */
        @media (max-width: 767px) {
          .feat-marquee-track {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .feat-marquee-track::-webkit-scrollbar { display: none; }
          /* Only show first half on mobile (no duplicates needed) */
          .feat-chip:nth-child(n+${brands.length + 1}) { display: none; }
        }

        /* Reduced motion: no animation */
        @media (prefers-reduced-motion: reduce) {
          .feat-marquee-track {
            animation: none !important;
            overflow-x: auto;
            scrollbar-width: none;
          }
        }

        .feat-chip > div:hover {
          border-color: var(--amber) !important;
          background: var(--amber-light) !important;
        }
      `}</style>
    </section>
  )
}
