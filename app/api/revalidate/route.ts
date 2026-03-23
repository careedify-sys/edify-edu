// app/api/revalidate/route.ts
// On-demand ISR revalidation endpoint for Google Sheets CMS integration
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  // Verify secret
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { paths, tags } = body as { paths?: string[]; tags?: string[] }

    const revalidated: string[] = []

    // Revalidate specific paths
    if (paths?.length) {
      for (const p of paths) {
        revalidatePath(p)
        revalidated.push(`path:${p}`)
      }
    }

    // Revalidate by cache tag (e.g. 'universities', 'programs')
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

// Also support GET for simple path revalidation
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const path = req.nextUrl.searchParams.get('path')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
