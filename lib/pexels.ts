// lib/pexels.ts — Server-side Pexels API client
import type { PexelsPhoto, PexelsSearchResponse } from '@/types/pexels'

const BASE_URL = 'https://api.pexels.com/v1/search'

export async function searchPhotos(
  query: string,
  perPage = 15,
  page = 1
): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY
  if (!key || !query.trim()) return []

  const url = `${BASE_URL}?query=${encodeURIComponent(query.trim())}&per_page=${perPage}&page=${page}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: key },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as PexelsSearchResponse
    return data.photos || []
  } catch {
    return []
  }
}

export function getPexelsAttribution(photo: PexelsPhoto): string {
  const name = String(photo.photographer || '').replace(/[<>]/g, '')
  const profile = String(photo.photographer_url || '').replace(/["<>]/g, '')
  return `Photo by <a href="${profile}" target="_blank" rel="noopener nofollow">${name}</a> on <a href="https://pexels.com" target="_blank" rel="noopener nofollow">Pexels</a>`
}
