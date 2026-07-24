import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { validateBody } from '@/lib/validate-body'

const escHtml = (s: string = '') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')

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
    const raw = await req.json()
    const check = validateBody(raw, 10000)
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }

    const cap = (v: unknown, max: number) => typeof v === 'string' ? v.slice(0, max) : ''
    const name = cap(raw.name, 200)
    const phone = cap(raw.phone, 20)
    const email = cap(raw.email, 200)
    const state = cap(raw.state, 200)
    const program = cap(raw.program, 200)
    const university = cap(raw.university, 200)
    const preferredUniversity = cap(raw.preferredUniversity, 200)
    const sourcePage = cap(raw.sourcePage, 500)
    const source = cap(raw.source, 200)
    const couponCode = cap(raw.couponCode, 100)
    const bestTimeToCall = cap(raw.bestTimeToCall, 200)
    const notes = cap(raw.notes, 5000)

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate phone: 10-digit Indian mobile
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const universityValue = university || preferredUniversity || 'Not specified'
    const programValue = program || 'Not specified'
    const sourceValue = sourcePage || source || 'website'
    const stateValue = state || 'Not specified'

    // ── 1. EMAIL via Resend ─────────────────────────────────────────────────
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

    if (resend) {
      resend.emails.send({
        from: 'edifyedu.in Leads <leads@edifyedu.in>',
        to: [process.env.LEAD_EMAIL_PRIMARY || 'hello@edifyedu.in', ...(process.env.LEAD_EMAIL_SECONDARY ? [process.env.LEAD_EMAIL_SECONDARY] : [])],
        subject: `New Lead: ${name.slice(0, 50)} | ${programValue.slice(0, 50)} @ ${universityValue.slice(0, 50)}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="color:#0f172a">New Enquiry: edifyedu.in</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600;width:40%">Name</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(name)}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Phone</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">+91 ${escHtml(phone)}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Email</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(email || 'Not provided')}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">State</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(stateValue)}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Interested In</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(programValue)}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">University</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(universityValue)}</td></tr>
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Source</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(sourceValue)}</td></tr>
              ${couponCode ? `<tr><td style="padding:8px;background:#f8fafc;font-weight:600">Coupon</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(couponCode)}</td></tr>` : ''}
              ${bestTimeToCall ? `<tr><td style="padding:8px;background:#f8fafc;font-weight:600">Best Time</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(bestTimeToCall)}</td></tr>` : ''}
              ${notes ? `<tr><td style="padding:8px;background:#f8fafc;font-weight:600">Notes</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escHtml(notes)}</td></tr>` : ''}
              <tr><td style="padding:8px;background:#f8fafc;font-weight:600">Submitted At</td><td style="padding:8px">${escHtml(timestamp)}</td></tr>
            </table>
          </div>
        `,
      }).catch(() => {})
    }

    // ── 1b. CONFIRMATION EMAIL to lead ─────────────────────────────────────
    if (resend && email) {
      const firstName = name.split(' ')[0]
      const hasProgram = programValue !== 'Not specified'
      const hasUniversity = universityValue !== 'Not specified'
      const aboutProgram = hasProgram ? ` about ${escHtml(programValue)}` : ''
      const atUniversity = hasUniversity ? ` at ${escHtml(universityValue)}` : ''
      const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'

      const programSlug = hasProgram ? programValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''
      let helpLink = 'https://edifyedu.in/universities'
      let helpText = 'While you wait, here are the universities we track with verified fee and ranking data'
      if (hasProgram) {
        helpLink = `https://edifyedu.in/programs/${programSlug}`
        helpText = `While you wait, here's the verified fee and ranking comparison for ${escHtml(programValue)}`
      } else if (hasUniversity) {
        helpLink = 'https://edifyedu.in/universities'
        helpText = `While you wait, here are all the universities we compare with verified data`
      }

      const subjectLine = hasProgram
        ? `Your ${programValue} options, ${firstName}`
        : `About your enquiry, ${firstName}`

      resend.emails.send({
        from: 'Rishi Kumar <rishi@edifyedu.in>',
        replyTo: 'rishi@edifyedu.in',
        to: [email],
        subject: subjectLine,
        text: [
          `Hi ${firstName},`,
          '',
          `Thanks for reaching out${hasProgram ? ` about ${programValue}` : ''}${hasUniversity ? ` at ${universityValue}` : ''}. I'm Rishi, the founder of edifyedu.in.`,
          '',
          `Here's what happens next: someone from our team will reach out to you on WhatsApp within 24 hours with the fee sheet, eligibility details, and any coupon savings that apply. No sales pressure, no spam calls.`,
          '',
          `${helpText}:`,
          helpLink,
          '',
          `A quick note on how we work: edifyedu.in is independent. We don't take commissions from universities and we don't push paid rankings. The comparison data you see on our site comes from UGC-DEB, NAAC, and NIRF records. So when we recommend something, it's because the numbers back it up.`,
          '',
          `One quick question so I can point you in the right direction: are you working right now, or looking to study straight after graduation? Just reply to this email.`,
          '',
          `Talk soon,`,
          `Rishi`,
          '',
          `---`,
          `Rishi Kumar | Founder`,
          `edifyedu.in - https://edifyedu.in`,
          `WhatsApp: +91 70612 85806 - https://wa.me/${wa}`,
          `125+ UGC-DEB approved universities compared. Independent, commission-free.`,
          `YouTube: https://youtube.com/@edify_edu`,
          `Instagram: https://www.instagram.com/edifyedu.in/`,
          `LinkedIn: https://www.linkedin.com/company/edifyeducation/`,
        ].join('\n'),
        html: [
          `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1e293b">`,
          `<tr><td style="padding:0">`,

          `<p style="margin:0 0 16px">Hi ${escHtml(firstName)},</p>`,

          `<p style="margin:0 0 16px">Thanks for reaching out${aboutProgram}${atUniversity}. I'm Rishi, the founder of edifyedu.in.</p>`,

          `<p style="margin:0 0 16px">Here's what happens next: someone from our team will reach out to you on WhatsApp within 24 hours with the fee sheet, eligibility details, and any coupon savings that apply. No sales pressure, no spam calls.</p>`,

          `<p style="margin:0 0 16px"><a href="${helpLink}" style="color:#f97316;text-decoration:underline">${helpText}</a>.</p>`,

          `<p style="margin:0 0 16px">A quick note on how we work: edifyedu.in is independent. We don't take commissions from universities and we don't push paid rankings. The comparison data you see on our site comes from UGC-DEB, NAAC, and NIRF records. So when we recommend something, it's because the numbers back it up.</p>`,

          `<p style="margin:0 0 16px">One quick question so I can point you in the right direction: are you working right now, or looking to study straight after graduation? Just reply to this email.</p>`,

          `<p style="margin:0 0 24px">Talk soon,<br>Rishi</p>`,

          // Signature divider
          `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:8px"><tr><td style="padding-top:20px">`,

          // Logo
          `<img src="https://edifyedu.in/logos/edify_logo_192px.png" alt="edifyedu.in" width="140" style="display:block;width:140px;height:auto;margin-bottom:12px" />`,

          // Name and role
          `<p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#0f172a">Rishi Kumar <span style="font-weight:normal;color:#64748b">| Founder</span></p>`,

          // Site link and WhatsApp
          `<p style="margin:0 0 4px;font-size:13px">`,
          `<a href="https://edifyedu.in" style="color:#f97316;text-decoration:none">edifyedu.in</a>`,
          `<span style="color:#cbd5e1;margin:0 6px">&#183;</span>`,
          `<a href="https://wa.me/${escHtml(wa)}" style="color:#64748b;text-decoration:none">WhatsApp +91 70612 85806</a>`,
          `</p>`,

          // Credibility line
          `<p style="margin:8px 0 10px;font-size:12px;color:#64748b;line-height:1.4">125+ UGC-DEB approved universities compared. Independent, commission-free.</p>`,

          // Social links
          `<p style="margin:0;font-size:12px">`,
          `<a href="https://youtube.com/@edify_edu" style="color:#64748b;text-decoration:none;margin-right:12px">YouTube</a>`,
          `<a href="https://www.instagram.com/edifyedu.in/" style="color:#64748b;text-decoration:none;margin-right:12px">Instagram</a>`,
          `<a href="https://www.linkedin.com/company/edifyeducation/" style="color:#64748b;text-decoration:none">LinkedIn</a>`,
          `</p>`,

          `</td></tr></table>`,
          `</td></tr></table>`,
        ].join('\n'),
      }).catch(() => {})
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
          state: stateValue,
          program: programValue,
          university: universityValue,
          sourcePage: sourceValue,
          couponCode: couponCode || '',
          bestTimeToCall: bestTimeToCall || '',
          notes: notes || '',
        }),
      }).catch(() => {}) // Non-blocking
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Enquiry API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
