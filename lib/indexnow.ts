// lib/indexnow.ts
// Notifies IndexNow-supporting search engines when a URL is created or updated.
// Supported engines: Bing, Yandex, Seznam, Naver, Mojeek, Yep.
// NOT supported: Google (they do not implement IndexNow).

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const HOST = 'edifyedu.in'

interface IndexNowPayload {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

/**
 * Notifies IndexNow of one or more URLs that have been created or updated.
 * Fails silently if the network request fails. Logs outcome for debugging.
 *
 * @param urls - Single URL string or array of URL strings to notify about.
 *               Must be absolute URLs on the same domain (edifyedu.in).
 */
export async function notifyIndexNow(urls: string | string[]): Promise<void> {
  const urlList = Array.isArray(urls) ? urls : [urls]
  const apiKey = process.env.INDEXNOW_API_KEY

  if (!apiKey) {
    console.warn('[IndexNow] INDEXNOW_API_KEY not set, skipping notification')
    return
  }

  // Validate URLs are on our domain
  const validUrls = urlList.filter((url) => {
    try {
      const parsed = new URL(url)
      return parsed.hostname === HOST || parsed.hostname === `www.${HOST}`
    } catch {
      console.warn(`[IndexNow] Invalid URL skipped: ${url}`)
      return false
    }
  })

  if (validUrls.length === 0) {
    console.warn('[IndexNow] No valid URLs to notify')
    return
  }

  const payload: IndexNowPayload = {
    host: HOST,
    key: apiKey,
    keyLocation: `https://${HOST}/${apiKey}.txt`,
    urlList: validUrls,
  }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    // IndexNow success codes: 200 (OK) or 202 (Accepted)
    if (response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] Successfully notified ${validUrls.length} URL(s)`)
    } else if (response.status === 400) {
      console.error('[IndexNow] Bad request (invalid format):', await response.text())
    } else if (response.status === 403) {
      console.error('[IndexNow] Key file not verified at keyLocation. Check public/{key}.txt exists and contains the key.')
    } else if (response.status === 422) {
      console.error('[IndexNow] URLs do not match key or host:', await response.text())
    } else if (response.status === 429) {
      console.warn('[IndexNow] Rate limited. Will retry on next notification.')
    } else {
      console.error(`[IndexNow] Unexpected status ${response.status}:`, await response.text())
    }
  } catch (error) {
    // Never let IndexNow failures break the main operation
    console.error('[IndexNow] Network error (non-fatal):', error)
  }
}

/**
 * Convenience: build absolute URL from a path and notify in one call.
 *
 * @param path - URL path starting with /, e.g. /universities/amity-university-online
 */
export async function notifyIndexNowPath(path: string): Promise<void> {
  const url = `https://${HOST}${path.startsWith('/') ? path : `/${path}`}`
  return notifyIndexNow(url)
}
