import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { validateBody } from '@/lib/validate-body'
import { UNIVERSITIES } from '@/lib/data'
import type { University, Program } from '@/lib/data'

const escHtml = (s: string = '') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')

function normalizeForMatch(s: string): string {
  return s.toLowerCase()
    .replace(/\b(online|university|deemed|to be|school|institute|academy|foundation)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchUniversity(input: string): University | null {
  const trimmed = input.trim()
  if (trimmed.length < 3) return null
  const norm = normalizeForMatch(trimmed)
  if (!norm) return null

  let bestScore = 0
  let bestMatch: University | null = null
  let tied = false

  for (const uni of UNIVERSITIES) {
    let score = 0
    const normName = normalizeForMatch(uni.name)
    const normAbbr = uni.abbr.toLowerCase().replace(/[^a-z0-9]/g, '')
    const normId = uni.id.replace(/-/g, ' ').replace(/\bonline\b/, '').trim()

    if (norm === normAbbr || normAbbr.includes(norm) || norm.includes(normAbbr)) {
      score = 3
    } else if (normName.includes(norm)) {
      score = 2
    } else if (normId.includes(norm)) {
      score = 1
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = uni
      tied = false
    } else if (score > 0 && score === bestScore && uni.id !== bestMatch?.id) {
      tied = true
    }
  }

  return tied ? null : bestMatch
}

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
      const leadDigits = phone.replace(/\D/g, '')
      const leadWaNumber = leadDigits.startsWith('91') ? leadDigits : `91${leadDigits}`
      const leadFirstName = name.split(' ')[0]
      const waMsgParts = [`Hi ${leadFirstName}, this is Rishi from edifyedu.in. Thanks for your enquiry`]
      if (programValue !== 'Not specified' && universityValue !== 'Not specified') {
        waMsgParts.push(` about ${programValue} at ${universityValue}`)
      } else if (programValue !== 'Not specified') {
        waMsgParts.push(` about ${programValue}`)
      } else if (universityValue !== 'Not specified') {
        waMsgParts.push(` about ${universityValue}`)
      }
      waMsgParts.push(`. I have the fee structure and eligibility details ready for you. Is now a good time to share them?`)
      const waMsg = encodeURIComponent(waMsgParts.join(''))
      const waLink = `https://wa.me/${leadWaNumber}?text=${waMsg}`
      const telLink = `tel:+${leadWaNumber}`

      resend.emails.send({
        from: 'edifyedu.in Leads <leads@edifyedu.in>',
        to: [process.env.LEAD_EMAIL_PRIMARY || 'hello@edifyedu.in', ...(process.env.LEAD_EMAIL_SECONDARY ? [process.env.LEAD_EMAIL_SECONDARY] : [])],
        subject: `New Lead: ${name.slice(0, 50)} | ${programValue.slice(0, 50)} @ ${universityValue.slice(0, 50)}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:500px">
            <h2 style="color:#0f172a;margin:0 0 16px">New Enquiry: ${escHtml(leadFirstName)} — ${escHtml(programValue)}</h2>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 12px"><tr><td>
              <a href="${waLink}" target="_blank" style="display:block;background:#25D366;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;text-align:center;text-decoration:none;padding:14px 24px;border-radius:8px">
                Message ${escHtml(leadFirstName)} on WhatsApp
              </a>
            </td></tr></table>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px"><tr><td style="text-align:center">
              <a href="${telLink}" style="color:#0f172a;font-size:14px;text-decoration:none">
                Call +91 ${escHtml(cleanPhone)}
              </a>
            </td></tr></table>

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
      const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'

      const matchedUni = hasUniversity ? matchUniversity(universityValue) : null
      const uniDisplayName = matchedUni ? matchedUni.name.replace(/\s*Online\s*$/i, '') : null

      const programAsType = hasProgram ? programValue as Program : null
      const progDetail = matchedUni && programAsType
        ? matchedUni.programDetails?.[programAsType] : null
      const duration = progDetail?.duration || null

      const naacGrade = matchedUni?.naac || null
      const nirfRank = matchedUni
        ? (programAsType === 'MBA' && matchedUni.nirfMgt != null && matchedUni.nirfMgt < 500
            ? { value: matchedUni.nirfMgt, label: 'NIRF Management' }
            : matchedUni.nirf != null && matchedUni.nirf < 500
              ? { value: matchedUni.nirf, label: 'NIRF University' }
              : null)
        : null
      const ugcApproved = matchedUni?.ugc === true

      const hasDataLines = !!(naacGrade || nirfRank || ugcApproved || duration)
      const showDataBlock = !!matchedUni && hasDataLines

      const programSlug = hasProgram ? programValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''
      let compareLink = 'https://edifyedu.in/universities'
      let compareLinkText = 'Compare all universities we track'
      if (hasProgram) {
        compareLink = `https://edifyedu.in/programs/${programSlug}`
        compareLinkText = `Compare ${escHtml(programValue)} programs across universities`
      }

      let subjectLine: string
      if (hasUniversity && hasProgram) {
        subjectLine = `${uniDisplayName || universityValue} ${programValue} — verified details and next steps`
      } else if (hasProgram) {
        subjectLine = `Your ${programValue} enquiry — what happens next`
      } else {
        subjectLine = `Your enquiry — what happens next`
      }

      // ── Plain-text data block ──
      const textDataLines: string[] = []
      if (showDataBlock) {
        textDataLines.push(`${uniDisplayName} — ${hasProgram ? programValue : 'Online Programs'}`)
        if (naacGrade) textDataLines.push(`  NAAC: ${naacGrade}`)
        if (nirfRank) textDataLines.push(`  ${nirfRank.label}: #${nirfRank.value}`)
        if (ugcApproved) textDataLines.push(`  UGC-DEB approved: Yes`)
        if (duration) textDataLines.push(`  Duration: ${duration}`)
        textDataLines.push('')
      }

      // ── HTML data block ──
      let htmlDataBlock = ''
      if (showDataBlock) {
        const rows: string[] = []
        if (naacGrade) rows.push(`<tr><td style="padding:6px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">NAAC</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;color:#0f172a;border-bottom:1px solid #f1f5f9">${escHtml(naacGrade)}</td></tr>`)
        if (nirfRank) rows.push(`<tr><td style="padding:6px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">${escHtml(nirfRank.label)}</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;color:#0f172a;border-bottom:1px solid #f1f5f9">#${nirfRank.value}</td></tr>`)
        if (ugcApproved) rows.push(`<tr><td style="padding:6px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">UGC-DEB approved</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;color:#10b981;border-bottom:1px solid #f1f5f9">Yes</td></tr>`)
        if (duration) rows.push(`<tr><td style="padding:6px 12px;font-size:13px;color:#64748b">Duration</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;color:#0f172a">${escHtml(duration)}</td></tr>`)

        htmlDataBlock = [
          `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:0 0 20px">`,
          `<tr><td colspan="2" style="padding:10px 12px;font-size:14px;font-weight:bold;color:#0f172a;border-bottom:1px solid #e2e8f0">${escHtml(uniDisplayName!)} ${hasProgram ? `— ${escHtml(programValue)}` : ''}</td></tr>`,
          ...rows,
          `</table>`,
        ].join('\n')
      }

      resend.emails.send({
        from: 'Rishi Kumar <hello@edifyedu.in>',
        replyTo: 'hello@edifyedu.in',
        to: [email],
        subject: subjectLine,
        text: [
          `Hi ${firstName},`,
          '',
          `Here's what you asked about, checked against official records:`,
          '',
          ...textDataLines,
          `Fee structures change with every admission cycle, so our representative will confirm the current fee with you directly, including the charges that are easy to miss.`,
          '',
          `WHAT HAPPENS NEXT`,
          `Our team will message you on WhatsApp within 24 hours with the confirmed fee structure, an eligibility check for your profile, and any scholarships you qualify for.`,
          `No sales pressure, no repeated calls. If we think this is not the right fit for you, we will say so.`,
          '',
          `COMPARE BEFORE YOU DECIDE`,
          `${compareLinkText}: ${compareLink}`,
          '',
          `These details come from UGC-DEB, NAAC and NIRF records. edifyedu.in takes zero commission from universities, so there is nothing in it for us either way.`,
          '',
          `One question so I can point you right: are you working right now, or studying full time? Just reply, I read these myself.`,
          '',
          `Rishi`,
          `edifyedu.in`,
          '',
          `---`,
          `Rishi Kumar | Founder`,
          `edifyedu.in - https://edifyedu.in`,
          `WhatsApp: +91 70612 85806 - https://wa.me/${wa}`,
          `125+ UGC-DEB approved universities compared. Independent, commission-free.`,
          `Instagram: https://www.instagram.com/edifyedu.in/`,
          `LinkedIn: https://www.linkedin.com/company/edifyeducation/`,
        ].join('\n'),
        html: [
          `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1e293b">`,
          `<tr><td style="padding:0">`,

          `<p style="margin:0 0 16px">Hi ${escHtml(firstName)},</p>`,

          `<p style="margin:0 0 20px">Here's what you asked about, checked against official records:</p>`,

          htmlDataBlock,

          `<p style="margin:0 0 20px;font-size:14px;color:#64748b">Fee structures change with every admission cycle, so our representative will confirm the current fee with you directly, including the charges that are easy to miss.</p>`,

          `<p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#0f172a">What happens next</p>`,
          `<p style="margin:0 0 6px">Our team will message you on WhatsApp within 24 hours with the confirmed fee structure, an eligibility check for your profile, and any scholarships you qualify for.</p>`,
          `<p style="margin:0 0 20px">No sales pressure, no repeated calls. If we think this is not the right fit for you, we will say so.</p>`,

          `<p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#0f172a">Compare before you decide</p>`,
          `<p style="margin:0 0 20px"><a href="${compareLink}" style="color:#f97316;text-decoration:underline">${compareLinkText}</a></p>`,

          `<p style="margin:0 0 20px;font-size:13px;color:#64748b">These details come from UGC-DEB, NAAC and NIRF records. edifyedu.in takes zero commission from universities, so there is nothing in it for us either way.</p>`,

          `<p style="margin:0 0 20px">One question so I can point you right: are you working right now, or studying full time? Just reply, I read these myself.</p>`,

          `<p style="margin:0 0 0">Rishi<br><span style="font-size:13px;color:#64748b">edifyedu.in</span></p>`,

          // ── Signature ──
          `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px"><tr><td style="border-top:1px solid #e2e8f0;padding-top:20px">`,

          `<img src="https://edifyedu.in/logos/edify_logo_512px.png" alt="edifyedu.in" width="140" height="47" style="display:block;width:140px;height:47px;border:0;outline:none;text-decoration:none;margin-bottom:14px" />`,

          `<p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:#0f172a">Rishi Kumar</p>`,
          `<p style="margin:0 0 10px;font-size:13px;color:#64748b">Founder, <a href="https://edifyedu.in" style="color:#f97316;text-decoration:none">edifyedu.in</a></p>`,

          `<p style="margin:0 0 10px;font-size:13px;color:#64748b">`,
          `<a href="https://wa.me/${escHtml(wa)}" style="color:#64748b;text-decoration:none">WhatsApp +91 70612 85806</a>`,
          `</p>`,

          `<p style="margin:0 0 12px;font-size:12px;color:#94a3b8;line-height:1.5">125+ UGC-DEB approved universities compared. Independent, commission-free.</p>`,

          `<p style="margin:0;font-size:12px">`,
          `<a href="https://www.instagram.com/edifyedu.in/" style="color:#94a3b8;text-decoration:none">Instagram</a>`,
          `<span style="color:#e2e8f0;margin:0 6px">|</span>`,
          `<a href="https://www.linkedin.com/company/edifyeducation/" style="color:#94a3b8;text-decoration:none">LinkedIn</a>`,
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
