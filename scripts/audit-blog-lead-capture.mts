// Audit: how each published blog post captures leads.
// Run: npx tsx scripts/audit-blog-lead-capture.mts
//
// Mirrors the blog template (app/blog/[slug]/page.tsx) and the CTA splitter
// (components/BlogContentWithCTAs.tsx): a "<div class=cta-box" becomes an
// inline form, BlogLeadForm shows only when the post has no university CTA
// bundle, and every link to /contact inside the body sends the reader away.

import { getPublishedPosts } from '../lib/blog'
import { BLOG_CTA_BUNDLES } from '../lib/university-blog-cta'
import { addEarlyFormSpot } from '../components/BlogContentWithCTAs'

const CTA_BOX_RE = /<div class="cta-box"[\s\S]*?<\/div>/g
const CONTACT_RE = /href="\/contact[^"]*"/g

const posts = getPublishedPosts()
let earlyAdded = 0, stillNoForm = 0, earlyPctSum = 0, noInlineForm = 0, withContactLinks = 0, contactLinks = 0, firstFormPctSum = 0, firstFormN = 0
const rows: string[] = []
for (const p of posts) {
  const html: string = (p as any).content || ''
  const boxes = [...html.matchAll(CTA_BOX_RE)]
  const afterSplit = html.replace(CTA_BOX_RE, '')
  const links = (afterSplit.match(CONTACT_RE) || []).length
  const bundle = !!(BLOG_CTA_BUNDLES as Record<string, unknown>)[p.slug]
  if (!boxes.length) noInlineForm++
  if (links) { withContactLinks++; contactLinks += links }
  if (boxes.length) { firstFormPctSum += boxes[0].index! / html.length; firstFormN++ }
  const withEarly = addEarlyFormSpot(html)
  const earlyAt = withEarly.indexOf('blog-early-form-spot')
  if (earlyAt !== -1) { earlyAdded++; earlyPctSum += earlyAt / html.length }
  if (!boxes.length && earlyAt === -1) stillNoForm++
  rows.push(`${p.slug}\tinlineForms=${boxes.length}\tcontactLinks=${links}\tbundle=${bundle}`)
}
console.log(`published posts: ${posts.length}`)
console.log(`posts with NO inline form in the body: ${noInlineForm}`)
console.log(`posts with links to /contact left in the body: ${withContactLinks} (${contactLinks} links)`)
console.log(`first inline form sits on average ${Math.round((firstFormPctSum / Math.max(firstFormN, 1)) * 100)}% down the body`)
console.log(`early form added to ${earlyAdded} posts, on average ${Math.round((earlyPctSum / Math.max(earlyAdded, 1)) * 100)}% down`)
console.log(`posts still with no form in the body: ${stillNoForm}`)
if (process.argv.includes('--rows')) console.log(rows.join('\n'))
