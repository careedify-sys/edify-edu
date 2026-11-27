import type { UniversityCover as Cover } from '@/lib/university-covers'

// Wide campus photo at the top of the university hero. Space is reserved by
// aspect-ratio so the hero does not shift.
//
// No caption or credit (Rishi, 27 Nov 2026: "remove the credits"). Licence and
// author data stay in university-covers.json. 29 covers are CC BY / CC BY-SA,
// whose licences ask for a visible credit; see audits/FIX-LOG.md.
export default function UniversityCover({ cover, name }: { cover: Cover; name: string }) {
  const alt = `${name} campus${cover.note ? `, ${cover.note}` : ''}`
  return (
    <figure className="mb-8" style={{ margin: '0 0 2rem' }}>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        style={{ width: '100%', aspectRatio: '2.2 / 1', maxHeight: 360, background: '#0f1b2d' }}
      >
        <img
          src={cover.src}
          srcSet={`${cover.srcSmall} 800w, ${cover.src} 1600w`}
          sizes="(min-width: 1280px) 1232px, 100vw"
          alt={alt}
          width={cover.width}
          height={cover.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%', display: 'block' }}
        />
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,18,32,0) 55%,rgba(10,18,32,0.55) 100%)' }}
        />
      </div>
    </figure>
  )
}
