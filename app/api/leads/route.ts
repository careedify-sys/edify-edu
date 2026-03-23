import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isAuthed(req: NextRequest) {
  const cookie = req.cookies.get('edify_session')?.value
  const sessionToken = process.env.ADMIN_SESSION_TOKEN
  return cookie && cookie === sessionToken
}

// GET /api/leads — fetch all leads from Google Sheets
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const webhookUrl = process.env.NEXT_PUBLIC_LEADS_WEBHOOK_URL
  if (!webhookUrl || webhookUrl.includes('your-')) {
    return NextResponse.json({
      error: 'NEXT_PUBLIC_LEADS_WEBHOOK_URL is not configured. Add your Google Apps Script URL to .env.local'
    }, { status: 400 })
  }

  try {
    const res = await fetch(`${webhookUrl}?action=getLeads`, {
      next: { revalidate: 0 }, // always fresh
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch leads from Google Sheets' }, { status: 500 })
  }
}

// PATCH /api/leads — update lead status
export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const webhookUrl = process.env.NEXT_PUBLIC_LEADS_WEBHOOK_URL
  if (!webhookUrl || webhookUrl.includes('your-')) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_LEADS_WEBHOOK_URL not configured' }, { status: 400 })
  }

  const { row, status } = await req.json()
  if (!row || !status) {
    return NextResponse.json({ error: 'Missing row or status' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${webhookUrl}?action=updateStatus&row=${row}&status=${encodeURIComponent(status)}`
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
