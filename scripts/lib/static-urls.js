// scripts/lib/static-urls.js
//
// The hand-maintained static pages that belong in lib/data/valid-urls.json,
// which is the sitemap source.
//
// This list lives in its own module because it used to exist TWICE. Both
// scripts/build-valid-urls.js and scripts/backfill-manifest-from-data.js write
// valid-urls.json, in that order, and each carried its own copy. On 2026-09-28
// '/methodology' was added to the first copy and not the second, so from that
// day every build produced a sitemap with /methodology in it and then
// immediately rewrote the file without it. The page exists at
// app/methodology/page.tsx, is linked from the footer and from
// /best-online-mba-india, and sets its own canonical, so nothing else gave the
// loss away.
//
// Adding a static page means adding it here, once.

const STATIC_URLS = [
  '/',
  '/universities',
  '/programs',
  '/compare',
  '/about',
  '/contact',
  '/coupons',
  '/privacy-policy',
  '/blog',
  '/guides',
  // Added 2026-09-28. States where every figure on the site comes from and what
  // happens when one cannot be verified. It is the page the site is most likely
  // to be cited for: a Perplexity test the same day cited EdifyEdu once, and the
  // citation was on verification method rather than on any recommendation.
  '/methodology',
]

module.exports = { STATIC_URLS }
