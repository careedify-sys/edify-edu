// app/api/revalidate/route.ts
// On-demand ISR revalidation endpoint for Google Sheets CMS webhook
// Secret must be passed in Authorization header (not query string)
// Usage: POST /api/revalidate with { paths: [...], tags: [...], slug?: "..." }
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 20
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

function verifyAuth(req: NextRequest): boolean {
  // Check Authorization header first (preferred)
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '')
    return token === process.env.REVALIDATE_SECRET
  }
  // Fallback: query string (for admin panel GET requests)
  const secret = req.nextUrl.searchParams.get('secret')
  return secret === process.env.REVALIDATE_SECRET
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { paths, tags, slug } = body as {
      paths?: string[]
      tags?: string[]
      slug?: string // convenience: university slug auto-expands to all related paths
    }

    const revalidated: string[] = []

    // If a university slug is provided, expand to all related paths
    if (slug) {
      const uniPaths = [
        `/universities/${slug}`,
        `/universities/${slug}/mba`,
        `/universities/${slug}/mca`,
        `/universities/${slug}/bba`,
        `/universities/${slug}/bca`,
      ]
      for (const p of uniPaths) {
        revalidatePath(p)
        revalidated.push(`path:${p}`)
      }
      // Also revalidate listing pages
      revalidatePath('/universities')
      revalidated.push('path:/universities')
    }

    // Revalidate specific paths
    if (paths?.length) {
      for (const p of paths) {
        revalidatePath(p)
        revalidated.push(`path:${p}`)
      }
    }

    // Revalidate by cache tag
    if (tags?.length) {
      for (const t of tags) {
        revalidateTag(t)
        revalidated.push(`tag:${t}`)
      }
    }

    // Always revalidate sitemap when content changes
    revalidatePath('/sitemap.xml')

    return NextResponse.json({
      revalidated: true,
      items: revalidated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Revalidation failed', details: String(error) },
      { status: 500 }
    )
  }
}

// GET for admin panel simple revalidation (uses query string secret as fallback)
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = req.nextUrl.searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    revalidatePath(path)
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed', details: String(error) },
      { status: 500 }
    )
  }
}
