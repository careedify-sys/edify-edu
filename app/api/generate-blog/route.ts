import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {

  // Simple API auth — must pass X-Admin-Token header matching ADMIN_API_SECRET env var
  const adminSecret = process.env.ADMIN_API_SECRET
  const providedToken = req.headers.get('X-Admin-Token')
  if (adminSecret && providedToken !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const { topic, keyword, category } = await req.json()
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const prompt = `You are an expert content writer for an Indian edtech platform (Edify — edifyedu.in) that covers UGC-DEB approved online university degrees.

Write a detailed, honest blog post. Topic: "${topic}". Target keyword: "${keyword || topic}". Category: "${category || 'MBA Guides'}".

Rules:
- Honest, no paid promotion language
- India-specific (NIRF ranks, UGC-DEB, INR fees)
- Use actual university names where relevant
- Min 700 words of actual HTML content
- Year references should say 2026

Return ONLY valid JSON (no markdown, no backtick fences):
{
  "title": "SEO title under 65 chars with year 2026",
  "metaDescription": "Under 155 chars, includes keyword naturally",
  "category": "${category || 'MBA Guides'}",
  "readTime": 8,
  "targetKeyword": "${keyword || topic}",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "content": "<h2>Section heading</h2><p>Paragraph content...</p><h2>Section 2</h2><p>Content...</p>",
  "faqs": [
    {"q": "Specific question?", "a": "Detailed answer."},
    {"q": "Another question?", "a": "Another answer."},
    {"q": "Third question?", "a": "Third answer."}
  ]
}`

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Anthropic error: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: parsed })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
