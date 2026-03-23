import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (resets on cold start — good enough for edge)
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX    = 5       // 5 submissions per IP per minute
const ipCounts = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipCounts.get(ip)
  if (!record || now > record.reset) {
    ipCounts.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (record.count >= RATE_LIMIT_MAX) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { name, phone, email, program, university, preferredUniversity, sourcePage, source } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const universityValue = university || preferredUniversity || 'Not specified'
    const programValue = program || 'Not specified'
    const sourceValue = sourcePage || source || 'website'

    // ── 1. EMAIL via Web3Forms ──────────────────────────────────────────────
    const web3Key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY
    if (web3Key && !web3Key.includes('YOUR_')) {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: web3Key,
          subject: `🎓 New Lead — ${name} | ${programValue} @ ${universityValue}`,
          from_name: 'EdifyEdu Leads',
          name,
          phone: `+91 ${phone}`,
          email: email || 'Not provided',
          'Interested In': programValue,
          'Preferred University': universityValue,
          'Source Page': sourceValue,
          'Submitted At': timestamp,
        }),
      }).catch(() => {}) // Non-blocking
    }

    // ── 2. GOOGLE SHEETS — Leads Webhook ───────────────────────────────────
    // Columns: Timestamp | Name | Phone | Email | Interested In | University | Source Page | Status
    const leadsUrl = process.env.NEXT_PUBLIC_LEADS_WEBHOOK_URL
    if (leadsUrl && !leadsUrl.includes('your-')) {
      await fetch(leadsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || '',
          program: programValue,
          university: universityValue,
          sourcePage: sourceValue,
        }),
      }).catch(() => {}) // Non-blocking
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Enquiry API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
