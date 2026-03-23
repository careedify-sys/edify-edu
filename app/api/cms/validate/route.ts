// app/api/cms/validate/route.ts
// Fetches all sheets from Google Sheets and runs full validation.
// Returns errors, warnings, and counts — never triggers a deploy.

import { NextRequest, NextResponse } from 'next/server'
import { validateAll, type CMSData } from '@/lib/cms-schema'

export async function POST(req: NextRequest) {
  const sheetUrl = process.env.NEXT_PUBLIC_CMS_SHEET_URL

  if (!sheetUrl || sheetUrl === 'your-gas-web-app-url-here') {
    return NextResponse.json({
      ok: false,
      error: 'NEXT_PUBLIC_CMS_SHEET_URL not configured in Vercel environment variables.',
    }, { status: 503 })
  }

  try {
    // Fetch all sheet data in one request
    const fetchUrl = `${sheetUrl}?action=readAll`
    const res = await fetch(fetchUrl, {
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `Sheets API returned HTTP ${res.status}`,
      }, { status: 502 })
    }

    const raw = await res.json()

    if (raw.error) {
      return NextResponse.json({ ok: false, error: raw.error }, { status: 502 })
    }

    // Map the GAS response to our CMSData shape
    const cmsData: CMSData = {
      universities: raw.universities?.rows ?? [],
      programs:     raw.programs?.rows     ?? [],
      syllabus:     raw.syllabus?.rows     ?? [],
      blogs:        raw.blogs?.rows        ?? [],
      guides:       raw.guides?.rows       ?? [],
      logos:        raw.logos?.rows        ?? [],
      siteConfig:   raw.siteConfig?.rows   ?? [],
      pageRegistry: raw.pageRegistry?.rows ?? [],
    }

    // Run validation
    const result = validateAll(cmsData)

    return NextResponse.json({
      ok: true,
      valid:    result.valid,
      summary:  result.summary,
      errors:   result.errors,
      warnings: result.warnings,
      counts:   result.counts,
      rawCounts: {
        universities: raw.universities?.count ?? 0,
        programs:     raw.programs?.count     ?? 0,
        blogs:        raw.blogs?.count        ?? 0,
        guides:       raw.guides?.count       ?? 0,
        logos:        raw.logos?.count        ?? 0,
      },
      fetchedAt: raw._meta?.updatedAt ?? new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })

  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.message?.includes('timeout')
    return NextResponse.json({
      ok: false,
      error: isTimeout
        ? 'Timed out fetching from Google Sheets (>30s). The sheet may be too large or the Apps Script may be slow.'
        : `Error: ${err?.message || 'Unknown error'}`,
    }, { status: 500 })
  }
}
