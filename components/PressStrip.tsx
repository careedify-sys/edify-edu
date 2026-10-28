import Image from 'next/image'

type PressItem = {
  publication: string
  // Items without a logo file render as a text wordmark card
  logo?: string
  url: string
  alt: string
  headline?: string
  date?: string
}

// The 27 Oct 2026 story ran under one headline across several outlets, so the
// syndicated cards show outlet and date only; the full headline is on /about.
const pressItems: PressItem[] = [
  {
    publication: 'ANI',
    url: 'https://aninews.in/news/business/same-degree-different-answers-how-edifyeduin-is-bringing-transparency-to-indias-online-degree-choices20261027123148',
    alt: 'ANI News',
    date: '27 Oct 2026',
  },
  {
    publication: 'The Tribune',
    url: 'https://www.tribuneindia.com/news/business/same-degree-different-answers-how-edifyedu-in-is-bringing-transparency-to-indias-online-degree-choices/',
    alt: 'The Tribune',
    date: '27 Oct 2026',
  },
  {
    publication: 'LatestLY',
    url: 'https://www.latestly.com/agency-news/business-news-same-degree-different-answers-how-edifyedu-in-is-bringing-transparency-to-indias-online-degree-choices-7658196.html',
    alt: 'LatestLY',
    date: '27 Oct 2026',
  },
  {
    publication: 'Punjab Kesari',
    url: 'https://english.punjabkesari.com/business/same-degree-different-answers-how-edifyedu-in-is-bringing-transparency-to-indias-online-degree-choices/',
    alt: 'Punjab Kesari English',
    date: '27 Oct 2026',
  },
  {
    publication: 'ET Edge Insights',
    url: 'https://etedge-insights.com/brands-speak/how-edifyedu-in-is-bringing-transparency-to-indias-online-degree-choices/',
    alt: 'ET Edge Insights',
    headline: 'How edifyedu.in is Bringing Transparency to India’s Online Degree Choices',
    date: 'Oct 2026',
  },
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
    alt: 'Boss Moves Magazine: June 2026',
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
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={item.alt}
                  width={640}
                  height={200}
                  className="rounded-lg max-h-40 md:max-h-48 w-auto object-contain"
                  sizes="(max-width: 640px) 480px, 640px"
                  priority={false}
                />
              ) : (
                <div
                  className="rounded-lg px-5 py-4 text-left max-w-[280px]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="font-black text-xl text-navy leading-tight">{item.publication}</div>
                  {item.date && (
                    <div className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--amber-text)' }}>
                      {item.date}
                    </div>
                  )}
                  {item.headline && (
                    <p className="text-xs mt-2 leading-snug" style={{ color: 'var(--ink-2)' }}>{item.headline}</p>
                  )}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
