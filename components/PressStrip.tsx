import Image from 'next/image'

type PressItem = {
  publication: string
  logo: string
  url: string
  alt: string
}

const pressItems: PressItem[] = [
  {
    publication: 'Tech Bullion',
    logo: '/press/techbullion.png',
    url: 'https://techbullion.com/25-strategies-for-successful-software-adoption-in-business/',
    alt: 'Tech Bullion',
  },
  {
    publication: 'Boss Moves Magazine',
    logo: '/press/boss-moves-badge.png',
    url: 'https://www.sherisesstudios.com/product-page/boss-moves-magazine-june-2026-edition',
    alt: 'Boss Moves Magazine — June 2026',
  },
]

export default function PressStrip() {
  if (pressItems.length === 0) return null

  return (
    <section
      aria-label="Press and mentions"
      className="py-8 md:py-12"
      style={{
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="section-label"
          style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--ink-3)' }}
        >
          As Seen In
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {pressItems.map((item) => (
            <a
              key={item.publication}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read coverage on ${item.publication}`}
              className="inline-flex items-center opacity-95 hover:opacity-100 hover:scale-105 transition-transform duration-200"
            >
              <Image
                src={item.logo}
                alt={item.alt}
                width={220}
                height={56}
                className="rounded-lg max-h-11 md:max-h-14 w-auto object-contain"
                sizes="(max-width: 640px) 160px, 220px"
                priority={false}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
