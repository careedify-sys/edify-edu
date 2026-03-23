import { NextRequest, NextResponse } from 'next/server'

// GET /api/leads/test?url=<webhookUrl>
// Verifies the Google Apps Script is live — called from admin Settings tab
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('edify_session')?.value
  const sessionToken = process.env.ADMIN_SESSION_TOKEN
  if (!cookie || cookie !== sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    const res = await fetch(`${url}?action=test`, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    return NextResponse.json({ success: true, message: data.message || 'OK' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Request failed' }, { status: 200 })
  }
}
