// scripts/notify-sitemap-to-indexnow.ts
// Run after a full deploy to notify IndexNow of all URLs in the sitemap.
// Usage: npm run indexnow:notify-all

import { notifyIndexNow } from '../lib/indexnow'

async function main() {
  const response = await fetch('https://edifyedu.in/sitemap.xml')
  if (!response.ok) {
    console.error(`Failed to fetch sitemap: HTTP ${response.status}`)
    process.exit(1)
  }

  const xml = await response.text()

  // Extract all <loc> URLs
  const urlMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/g)
  const urls = Array.from(urlMatches, (m) => m[1])

  console.log(`Found ${urls.length} URLs in sitemap`)

  if (urls.length === 0) {
    console.warn('No URLs found in sitemap. Check https://edifyedu.in/sitemap.xml is reachable.')
    process.exit(1)
  }

  // IndexNow accepts up to 10,000 URLs per request; batch if needed
  const batchSize = 10000
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    console.log(`Notifying batch ${batchNum} (${batch.length} URLs)`)
    await notifyIndexNow(batch)
    // Small delay between batches to be polite
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  console.log('Done')
}

main().catch(console.error)
