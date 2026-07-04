#!/usr/bin/env node
/**
 * scripts/check-sitemap.mjs
 * Fetches the live sitemap and HEAD-requests every URL to find redirects/errors.
 *
 * Usage:  node scripts/check-sitemap.mjs
 *         node scripts/check-sitemap.mjs --concurrency 10
 *         node scripts/check-sitemap.mjs --sitemap https://edifyedu.in/sitemap.xml
 */

const SITEMAP_URL = 'https://edifyedu.in/sitemap.xml'
const DEFAULT_CONCURRENCY = 5

function parseArgs() {
  const args = process.argv.slice(2)
  let concurrency = DEFAULT_CONCURRENCY
  let sitemap = SITEMAP_URL
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--concurrency' && args[i + 1]) concurrency = parseInt(args[++i], 10)
    if (args[i] === '--sitemap' && args[i + 1]) sitemap = args[++i]
  }
  return { concurrency, sitemap }
}

async function fetchSitemap(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`)
  return res.text()
}

function extractUrls(xml) {
  const urls = []
  const re = /<loc>([^<]+)<\/loc>/g
  let m
  while ((m = re.exec(xml)) !== null) urls.push(m[1])
  return urls
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' })
    const status = res.status
    const location = res.headers.get('location') || ''
    return { url, status, location }
  } catch (err) {
    return { url, status: 0, location: '', error: err.message }
  }
}

async function runWithConcurrency(items, fn, concurrency) {
  const results = []
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const i = idx++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

async function main() {
  const { concurrency, sitemap } = parseArgs()

  console.log(`Fetching sitemap: ${sitemap}`)
  const xml = await fetchSitemap(sitemap)
  const urls = extractUrls(xml)
  console.log(`Found ${urls.length} URLs. Checking with concurrency=${concurrency}...\n`)

  const results = await runWithConcurrency(urls, checkUrl, concurrency)

  const problems = results.filter(r => r.status < 200 || r.status >= 300)
  const redirects = problems.filter(r => r.status >= 300 && r.status < 400)
  const clientErrors = problems.filter(r => r.status >= 400 && r.status < 500)
  const serverErrors = problems.filter(r => r.status >= 500)
  const networkErrors = problems.filter(r => r.status === 0)

  if (problems.length === 0) {
    console.log('All URLs returned 2xx. No issues found.')
    return
  }

  if (redirects.length > 0) {
    console.log(`── 3xx Redirects (${redirects.length}) ──`)
    for (const r of redirects) {
      console.log(`  ${r.status}  ${r.url}`)
      if (r.location) console.log(`       → ${r.location}`)
    }
    console.log()
  }

  if (clientErrors.length > 0) {
    console.log(`── 4xx Client Errors (${clientErrors.length}) ──`)
    for (const r of clientErrors) console.log(`  ${r.status}  ${r.url}`)
    console.log()
  }

  if (serverErrors.length > 0) {
    console.log(`── 5xx Server Errors (${serverErrors.length}) ──`)
    for (const r of serverErrors) console.log(`  ${r.status}  ${r.url}`)
    console.log()
  }

  if (networkErrors.length > 0) {
    console.log(`── Network Errors (${networkErrors.length}) ──`)
    for (const r of networkErrors) console.log(`  ERR  ${r.url}  (${r.error})`)
    console.log()
  }

  console.log(`Summary: ${urls.length} total, ${problems.length} problems (${redirects.length} redirects, ${clientErrors.length} 4xx, ${serverErrors.length} 5xx, ${networkErrors.length} network)`)
  process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
