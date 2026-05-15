// app/api/pexels/route.ts — Server route for Pexels image search
import { NextRequest, NextResponse } from 'next/server'
import { searchPhotos, getPexelsAttribution } from '@/lib/pexels'

export const revalidate = 86400 // 24h cache to respect free-tier quota

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const perPage = Math.min(80, Math.max(1, parseInt(searchParams.get('per_page') || '15', 10) || 15))

  if (!q) {
    return NextResponse.json({ photos: [], page, per_page: perPage, total_results: 0 })
  }

  const photos = await searchPhotos(q, perPage, page)

  const result = photos.map(p => ({
    id: p.id,
    width: p.width,
    height: p.height,
    photographer: p.photographer,
    photographer_url: p.photographer_url,
    alt: p.alt || '',
    src: {
      original: p.src?.original,
      large: p.src?.large,
      medium: p.src?.medium,
      small: p.src?.small,
    },
    attribution: getPexelsAttribution(p),
  }))

  return NextResponse.json(
    { photos: result, page, per_page: perPage, total_results: result.length },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  )
}
