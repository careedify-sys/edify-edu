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

  // Added 2026-10-06. The /compare/[pair] pages were prerendered and linked
  // from /compare but were in no sitemap: a live check on 2026-10-06 found
  // exactly one /compare URL submitted, the hub. Google had reached them by
  // crawling alone, and they were still the best-converting pages on the site
  // (1.4% to 2.8% CTR against a 0.55% site average), on 98 to 389 impressions
  // each. They are listed here rather than derived because this file is
  // CommonJS and the pair list is TypeScript. scripts/check-compare-pair-urls.mts
  // asserts this block equals PAIR_SLUGS exactly, so the two cannot drift.
  '/compare/nmims-vs-symbiosis',
  '/compare/amity-vs-manipal-jaipur',
  '/compare/amity-vs-nmims',
  '/compare/sikkim-manipal-vs-amity',
  '/compare/amrita-vs-nmims',
  '/compare/manipal-jaipur-vs-nmims',
  '/compare/manipal-jaipur-vs-manipal-mahe',
  '/compare/amity-vs-symbiosis',
  '/compare/amity-vs-lpu',
  '/compare/lpu-vs-manipal-jaipur',
  '/compare/chandigarh-vs-lpu',
  '/compare/amity-vs-chandigarh',
  '/compare/manipal-jaipur-vs-chandigarh',
  '/compare/jain-vs-lpu',
  '/compare/amity-vs-jain',
  '/compare/symbiosis-vs-nmims-bba',
  '/compare/amity-vs-lpu-mca',
  '/compare/manipal-jaipur-vs-chandigarh-mca',
  '/compare/lpu-vs-chandigarh-mca',
  '/compare/manipal-jaipur-vs-sikkim-manipal',
  '/compare/manipal-jaipur-vs-sikkim-manipal-mca',
  '/compare/amity-vs-manipal-jaipur-mca',
  '/compare/amity-vs-jain-mca',
  '/compare/amity-vs-lpu-bba',
  '/compare/sharda-vs-galgotias-bba',
  '/compare/amity-vs-lpu-bca',
  '/compare/ignou-vs-lpu',
  // AI-citation sprint pairs (2026-11-04).
  '/compare/amity-vs-dy-patil',
  '/compare/amity-vs-srm',
  '/compare/ignou-vs-amity',
  '/compare/symbiosis-vs-manipal',
  '/compare/dy-patil-vs-manipal',
  '/compare/jain-vs-manipal',
  '/compare/srm-vs-manipal',
  '/compare/nmims-vs-dy-patil',
  '/compare/nmims-vs-jain',
  '/compare/nmims-vs-mahe',
  '/compare/bits-pilani-vs-nmims',
  '/compare/vit-vs-srm',
  '/compare/jain-vs-amrita',
  '/compare/dy-patil-vs-symbiosis',

  // Added 2026-11-02. The Online DBA section: pillar, two topic pages and one
  // page per programme in data/dba-programmes.ts. Keep this block equal to
  // that file's slugs when a programme is added or removed.
  '/online-dba',
  '/online-dba/dba-vs-phd',
  '/online-dba/dba-fees',
  '/online-dba/golden-gate-university-dba',
  '/online-dba/rushford-business-school-dba',
  '/online-dba/ssbm-executive-dba',
  '/online-dba/esgci-dba',
  '/online-dba/eimt-dba',
  '/online-dba/birchwood-university-dba',
]

module.exports = { STATIC_URLS }
