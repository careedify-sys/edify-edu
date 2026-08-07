import { NextRequest, NextResponse } from 'next/server'
import { validateBody } from '@/lib/validate-body'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

// Rate limiter, same shape as /api/enquiry so behaviour matches under load.
const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX    = 3
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

const cap = (v: unknown, max: number) => typeof v === 'string' ? v.slice(0, max).trim() : ''
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a minute.' }, { status: 429 })
  }

  try {
    const raw = await req.json()
    const check = validateBody(raw, 10000)
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }

    const universitySlug = cap(raw.universitySlug, 100).toLowerCase()
    const programme      = cap(raw.programme, 100)
    const studentName    = cap(raw.studentName, 200)
    const city           = cap(raw.city, 100)
    const reviewBody     = cap(raw.reviewBody, 4000)
    const ratingNum      = Number(raw.rating)
    const enrolmentYear  = raw.enrolmentYear ? Number(raw.enrolmentYear) : null

    if (!universitySlug || !SLUG_RE.test(universitySlug)) {
      return NextResponse.json({ error: 'Invalid university' }, { status: 400 })
    }
    if (!studentName || studentName.length < 2) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }
    if (!reviewBody || reviewBody.length < 30) {
      return NextResponse.json({ error: 'Review must be at least 30 characters' }, { status: 400 })
    }
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }
    if (enrolmentYear !== null && (!Number.isInteger(enrolmentYear) || enrolmentYear < 2000 || enrolmentYear > 2100)) {
      return NextResponse.json({ error: 'Invalid enrolment year' }, { status: 400 })
    }

    const sb = createSupabaseServiceClient()
    // verified is server-controlled. Client cannot set it, and source is fixed.
    const { error } = await sb.from('reviews').insert({
      university_slug: universitySlug,
      programme:       programme || null,
      student_name:    studentName,
      city:            city || null,
      rating:          ratingNum,
      review_body:     reviewBody,
      enrolment_year:  enrolmentYear,
      verified:        false,
      source:          'form',
    })

    if (error) {
      console.error('Reviews insert failed:', error)
      return NextResponse.json({ error: 'Could not save review' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reviews API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const universitySlug = cap(url.searchParams.get('universitySlug'), 100).toLowerCase()

    const sb = createSupabaseServiceClient()
    let q = sb
      .from('reviews')
      .select('id, university_slug, programme, student_name, city, rating, review_body, enrolment_year, created_at')
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (universitySlug) {
      if (!SLUG_RE.test(universitySlug)) {
        return NextResponse.json({ error: 'Invalid university' }, { status: 400 })
      }
      q = q.eq('university_slug', universitySlug)
    }

    const { data, error } = await q
    if (error) {
      console.error('Reviews read failed:', error)
      return NextResponse.json({ error: 'Could not read reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews: data ?? [] })
  } catch (err) {
    console.error('Reviews GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
