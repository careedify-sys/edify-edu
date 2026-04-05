import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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

    // ── 1. EMAIL via Resend ─────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      resend.emails.send({
        from: 'EdifyEdu Leads <leads@edifyedu.in>',
        to: ['hello@edifyedu.in', 'rishiupadhyay4787@gmail.com'],
        subject: `🎓 New Lead — ${name} | ${programValue} @ ${universityValue}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="color:#0f172a">New Enquiry — EdifyEdu</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600;width:40%">Name</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${name}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Phone</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">+91 ${phone}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Email</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${email || 'Not provided'}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Interested In</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${programValue}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">University</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${universityValue}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Source</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${sourceValue}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Submitted At</td><td style="padding:8px">${timestamp}</td></tr>
            </table>
          </div>
        `,
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
