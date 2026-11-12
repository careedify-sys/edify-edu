// Audit: how each published blog post captures leads.
// Run: npx tsx scripts/audit-blog-lead-capture.mts
//
// Mirrors the blog template (app/blog/[slug]/page.tsx) and the CTA splitter
// (components/BlogContentWithCTAs.tsx): a "<div class=cta-box" becomes an
// inline form, BlogLeadForm shows only when the post has no university CTA
// bundle, and every link to /contact inside the body sends the reader away.

import { getPublishedPosts } from '../lib/blog'
import { BLOG_CTA_BUNDLES } from '../lib/university-blog-cta'

const CTA_BOX_RE = /<div class="cta-box"[\s\S]*?<\/div>/g
const CONTACT_RE = /href="\/contact[^"]*"/g

const posts = getPublishedPosts()
let noInlineForm = 0, withContactLinks = 0, contactLinks = 0, firstFormPctSum = 0, firstFormN = 0
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
  rows.push(`${p.slug}\tinlineForms=${boxes.length}\tcontactLinks=${links}\tbundle=${bundle}`)
}
console.log(`published posts: ${posts.length}`)
console.log(`posts with NO inline form in the body: ${noInlineForm}`)
console.log(`posts with links to /contact left in the body: ${withContactLinks} (${contactLinks} links)`)
console.log(`first inline form sits on average ${Math.round((firstFormPctSum / Math.max(firstFormN, 1)) * 100)}% down the body`)
console.log('Every page also gets the on-screen form (components/LeadPrompt.tsx), and links to /contact open it in place.')
if (process.argv.includes('--rows')) console.log(rows.join('\n'))
