// app/api/universities/route.ts
// Lightweight API endpoint so client components can fetch university
// lists without bundling the full 420KB data.ts into client JS.
import { NextRequest, NextResponse } from 'next/server'
import { UNIVERSITIES } from '@/lib/data'
import type { Program } from '@/lib/data'

const progSlug = (p: string) =>
  p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

// Cached at Edge for 1 hour — revalidates on next build
export const revalidate = 86400

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const program   = searchParams.get('program')   // e.g. "MBA"
  const region    = searchParams.get('region')    // e.g. "South"
  const naacMin   = searchParams.get('naacMin')   // e.g. "A+"
  const nirf_max  = parseInt(searchParams.get('nirf_max') ?? '999')
  const limit     = parseInt(searchParams.get('limit')    ?? '200')
  const fields    = searchParams.get('fields')?.split(',') // sparse response

  let unis = UNIVERSITIES

  if (program) unis = unis.filter(u => u.programs.includes(program as Program))
  if (region)  unis = unis.filter(u => u.region === region)
  if (nirf_max < 999) unis = unis.filter(u => u.nirf <= nirf_max)

  unis = unis.slice(0, limit)

  // Sparse field selection — only send what client needs
  const SAFE_FIELDS = [
    'id','name','abbr','city','state','region','nirf','naac',
    'feeMin','feeMax','emiFrom','highlight','programs','color',
    'psuEligible','ugc','approvals',
  ] as const
  type SafeField = typeof SAFE_FIELDS[number]

  const selected = fields?.filter((f): f is SafeField =>
    (SAFE_FIELDS as readonly string[]).includes(f)
  ) as SafeField[] | undefined

  const result = unis.map(u => {
    if (!selected) return u
    return Object.fromEntries(
      selected.map(f => [f, u[f]])
    )
  })

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
