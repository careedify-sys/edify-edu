import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'careedify-sys'
const GITHUB_REPO = process.env.GITHUB_REPO || 'edify-edu'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

async function getFileSHA(path: string): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.sha || null
}

async function pushFile(path: string, content: string, message: string): Promise<boolean> {
  const sha = await getFileSHA(path)
  const encoded = Buffer.from(content, 'utf-8').toString('base64')
  const body: any = { message, content: encoded, branch: GITHUB_BRANCH }
  if (sha) body.sha = sha

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  return res.ok
}

export async function POST(req: NextRequest) {
  try {

  // Simple API auth — must pass X-Admin-Token header matching ADMIN_API_SECRET env var
  const adminSecret = process.env.ADMIN_API_SECRET
  const providedToken = req.headers.get('X-Admin-Token')
  if (adminSecret && providedToken !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({
        error: 'GITHUB_TOKEN not configured in Vercel environment variables.',
        setup: 'Go to Vercel Dashboard → Settings → Environment Variables → Add GITHUB_TOKEN'
      }, { status: 500 })
    }

    const { files, commitMessage } = await req.json()
    // files: Array of { path: string, content: string }

    if (!files?.length) {
      return NextResponse.json({ error: 'No files to push' }, { status: 400 })
    }

    const results: { path: string; success: boolean }[] = []
    const timestamp = new Date().toISOString()
    const msg = commitMessage || `🔄 Edify Admin Update — ${timestamp}`

    for (const file of files) {
      const success = await pushFile(file.path, file.content, msg)
      results.push({ path: file.path, success })
      // Small delay to avoid GitHub rate limits
      await new Promise(r => setTimeout(r, 300))
    }

    const allSuccess = results.every(r => r.success)
    const failedFiles = results.filter(r => !r.success).map(r => r.path)

    return NextResponse.json({
      success: allSuccess,
      results,
      failedFiles,
      message: allSuccess
        ? `✅ ${results.length} files pushed to GitHub. Vercel deploying now — live in ~90 seconds.`
        : `⚠️ ${results.filter(r=>r.success).length}/${results.length} files pushed. Failed: ${failedFiles.join(', ')}`,
      deployUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
