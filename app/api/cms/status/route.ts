// app/api/cms/status/route.ts
// Returns current CMS connection status and row counts from Google Sheets

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const sheetUrl = process.env.NEXT_PUBLIC_CMS_SHEET_URL

  if (!sheetUrl || sheetUrl === 'your-gas-web-app-url-here') {
    return NextResponse.json({
      connected: false,
      error: 'NEXT_PUBLIC_CMS_SHEET_URL not configured',
      setup: 'Deploy the Google Apps Script, then add the Web App URL to Vercel env vars as NEXT_PUBLIC_CMS_SHEET_URL',
    })
  }

  try {
    const url = `${sheetUrl}?action=status`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        error: `Sheets returned HTTP ${res.status}`,
        hint: 'Check that the Apps Script is deployed as a Web App with "Anyone" access',
      })
    }

    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ connected: false, error: data.error })
    }

    return NextResponse.json({
      connected: true,
      spreadsheetTitle: data.spreadsheetTitle,
      counts: data.counts,
      updatedAt: data.updatedAt,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })

  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.message?.includes('timeout')
    return NextResponse.json({
      connected: false,
      error: isTimeout
        ? 'Request timed out — check your Apps Script URL and deployment'
        : `Network error: ${err?.message || 'Unknown'}`,
    })
  }
}
