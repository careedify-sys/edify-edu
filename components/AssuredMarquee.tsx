'use client'

const POINTS = [
  'Zero commission from universities',
  'Your phone stays private, never sold',
  'Max 2 counsellor calls, no daily spam',
  'Only UGC-DEB verified data, no paid rankings',
  'We tell you if a program does not fit',
  'Full fee transparency, no hidden costs',
]

// Duplicate for seamless translateX(-50%) loop
const ALL_POINTS = [...POINTS, ...POINTS]

export default function AssuredMarquee() {
  return (
    <div
      style={{ background: '#0B1533', overflow: 'hidden', position: 'relative' }}
      className="h-8 sm:h-9"
      aria-label="EdifyEdu Assured — our commitments to you"
    >
      <style>{`
        @keyframes edify-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .edify-marquee-track { animation: none !important; }
        }
        @media (hover: hover) {
          .edify-marquee-wrap:hover .edify-marquee-track {
            animation-play-state: paused;
          }
        }
      `}</style>

      {/* Fade masks */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(90deg, #0B1533 0, transparent 60px, transparent calc(100% - 60px), #0B1533 100%)',
        }}
      />

      <div
        className="edify-marquee-wrap"
        style={{ height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
      >
        <div
          className="edify-marquee-track"
          style={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            willChange: 'transform',
            animation: 'edify-marquee 40s linear infinite',
          }}
        >
          {ALL_POINTS.map((pt, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ color: '#F4A024', fontWeight: 700, fontSize: 13, marginRight: 5 }} aria-hidden="true">✓</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{pt}</span>
              <span style={{ color: '#F4A024', opacity: 0.6, margin: '0 20px', fontSize: 10 }} aria-hidden="true">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
