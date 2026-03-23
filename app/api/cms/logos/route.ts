// app/api/cms/logos/route.ts
// Fetches the Logos sheet, normalises URLs, and returns logo map.
// Also used during sync to update UNIVERSITY_LOGOS in content.ts.

import { NextRequest, NextResponse } from 'next/server'
import { buildLogoMap, normaliseLogo } from '@/lib/cms-schema'

export async function GET(req: NextRequest) {
  const sheetUrl = process.env.NEXT_PUBLIC_CMS_SHEET_URL

  if (!sheetUrl) {
    return NextResponse.json({ error: 'CMS not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(`${sheetUrl}?action=read&sheet=logos`, {
      signal: AbortSignal.timeout(15000),
    })
    const data = await res.json()
    const rows = data.rows ?? []
    const logoMap = buildLogoMap(rows)

    return NextResponse.json({
      count: Object.keys(logoMap).length,
      logos: logoMap,
      raw: rows,
    }, { headers: { 'Cache-Control': 'no-store' } })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Test if a logo URL is reachable (for the admin preview)
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ reachable: false, error: 'URL required' }, { status: 400 })
    }

    const normalised = normaliseLogo(url)

    const res = await fetch(normalised, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    })

    const contentType = res.headers.get('content-type') ?? ''
    const isImage = contentType.startsWith('image/') ||
                    normalised.match(/\.(png|jpg|jpeg|svg|webp|gif)(\?|$)/i) !== null

    return NextResponse.json({
      reachable:    res.ok,
      status:       res.status,
      normalised,
      contentType,
      isImage,
    })
  } catch (err: any) {
    return NextResponse.json({ reachable: false, error: err.message })
  }
}
