# Phase 3 — Google Search Console Playbook

**Author:** Rishi Kumar  
**Date:** 2026-04-19  
**Status:** Document only — do NOT execute until git push + Vercel deploy confirmed

---

## Pre-requisites

1. Confirm `git push origin main` completed
2. Confirm Vercel deploy succeeded (check dashboard)
3. Wait 5 minutes for CDN cache flush before starting

---

## Step 1 — Submit Sitemap

**Where:** GSC → Sitemaps (left sidebar)

1. Go to: `https://search.google.com/search-console/sitemaps`
2. Property: `https://edifyedu.in/`
3. Click **Add a new sitemap**
4. Enter: `sitemap.xml`
5. Click **Submit**

**Expected:** GSC shows sitemap submitted, URL count ~2163 within 48 hours.

**If existing sitemap entry shows "Could not fetch":** Delete it and resubmit.

---

## Step 2 — Removals Tool (Remove Old Broken URLs)

**Where:** GSC → Removals → Temporary Removals

Priority: top 50 URLs from `audit-report.csv` where `status=404` or `TITLE_SAYS_NOT_FOUND=TRUE` and the URL is NOT in the new valid-urls.json.

To get the list:
```bash
node -e "
const csv = require('fs').readFileSync('audit-report.csv','utf8').split('\n')
const headers = csv[0].replace(/\"/g,'').split(',')
const rows = csv.slice(1).filter(Boolean).map(l => {
  const v=[]; let q=false,c=''
  for(const ch of l){if(ch==='\"'){q=!q}else if(ch===','&&!q){v.push(c);c=''}else c+=ch}
  v.push(c)
  const o={}; headers.forEach((h,i)=>o[h]=v[i]||''); return o
})
const valid = new Set(require('./lib/data/valid-urls.json'))
const bad = rows.filter(r => (r.status!=='200'||r.TITLE_SAYS_NOT_FOUND==='TRUE') && !valid.has(r.url.replace('https://edifyedu.in','')))
bad.slice(0,50).forEach(r => console.log(r.url))
"
```

For each URL in the list:
1. Click **New Request → Temporarily remove URL**
2. Paste the URL
3. Select **Remove URL only**
4. Submit

This de-indexes old broken pages within 24 hours while redirects propagate.

---

## Step 3 — Request Re-crawl for Redirected URLs

**Where:** GSC → URL Inspection → Request Indexing

Re-crawl the top 20 redirected URLs to let Google update its index quickly.

Priority order (highest-traffic redirects first):
1. `/universities/jain-university-online/m-com`
2. `/universities/amity-university-online/b-com`
3. `/universities/amity-university-online/m-com`
4. `/universities/lovely-professional-university-online/b-com`
5. `/universities/lovely-professional-university-online/m-com`
6. `/universities/chandigarh-university-online/b-com`
7. `/universities/chandigarh-university-online/m-com`
8. `/programs/b-com`
9. `/programs/m-com`
10. `/programs/b-com/accounting`
11. `/programs/b-com/accounting-and-finance`
12. `/programs/m-com/finance`
13. `/programs/m-com/accounting`
14. `/universities/nmims-online/b-com`
15. `/universities/nmims-online/m-com`
16. `/universities/ignou-online/mba`
17. `/universities/yenepoya-online/bca`
18. `/universities/vtu-online/mba`
19. `/universities/ignou-online/ma`
20. `/universities/vtu-online/mca`

For each:
1. Paste full URL (with https://edifyedu.in prefix) into URL Inspection bar
2. Click **Request Indexing**
3. Note: GSC limits to ~10 requests per day — spread over 2 days

---

## Step 4 — Monitor Coverage Report (4-Week Schedule)

**Where:** GSC → Coverage (or Pages, in newer GSC UI)

| Week | What to check | Action if needed |
|---|---|---|
| Week 1 (post-deploy +7d) | "Valid" URL count vs ~2163 expected | If <1500, check sitemap fetch |
| Week 1 | "Excluded: 301 redirect" count | Should increase by ~318 |
| Week 1 | "Not found (404)" count | Should decrease from ~677 |
| Week 2 (post-deploy +14d) | "Crawled - currently not indexed" | Review thin-content pages |
| Week 3 (post-deploy +21d) | Impressions/clicks delta in Performance | Look for traffic recovery on B.Com/M.Com |
| Week 4 (post-deploy +28d) | Coverage errors resolved % | Target: <50 remaining errors |

**Key metric to watch:** `TITLE_SAYS_NOT_FOUND` pages — these were soft-404s that Google may have already deindexed. The redirect + new sitemap should recover them.

---

## Step 5 — IndexNow Notification (after sitemap submit)

```bash
npm run indexnow:notify-all
```

This pings Bing IndexNow with all sitemap URLs. Run once, 24h after deploy.

---

## Notes

- The 183 unmapped broken URLs in `scripts/unmapped-broken-urls.md` need manual review. Most are universities that offered B.Com/M.Com but are not in the current Excel (removed or renamed). For these, consider either:
  - Adding the university to the Excel with correct program data, then re-running `npm run build:urls` + `node scripts/build-redirects.js`
  - Manually adding redirect rules to next.config.js pointing to the university hub page
- Do not use the Removals tool on pages that have valid 301 redirects — let Google discover the redirect naturally
