# B2: official online-education domains, top 10 queue (2026-11-28)

Scope: the 10 universities in the "Working queue" of `audits/OPERATING-PLAN.md` (from `audits/queue-ranking-2026-11-16.md`). Purpose: schema `sameAs` only, never a visible link.

## How the gate decides

`scripts/check-official-urls.mts` does not check ownership. It counts every record that has an `officialUrl` and fails only on these cases: the URL is not https, it has a trailing slash, its host contains a blocklisted aggregator or lookalike (for example `collegebandhu` or `galgotiasuniversityonline`), or `feeVerifiedOn` is malformed, in the future, or set with no URL. Ownership is a human rule written into the script comment: set `officialUrl` only after reading the portal's own fee page, or after the university's main domain links to it.

The gate run today printed: `OK (143 universities, 23 with a confirmed portal, 23 with a fee verified against it)`. The brief quotes 29. Today's tree gives 23.

## Method and verdict rule

1. Fetch the portal homepage. It must name the university and carry its online or UGC identity.
2. Fetch the university's main domain and check that it links to the portal. The DEB register (deb.ugc.ac.in/Home/HEI_Prog_List) has no website column, so it cannot tie a domain to an HEI. It is not used for this check. The page was also over 10 MB for WebFetch today.
3. CONFIRMED needs both steps. A portal that names the university but cannot be traced from the main domain is UNVERIFIED. A lookalike also names the university, which is the galgotiasuniversityonline.com lesson.
4. MISMATCH means `lib/data.ts` holds a different domain. When `lib/data.ts` holds no `officialUrl`, the row is marked "absent". That is not a mismatch.

Tools: WebFetch, plus curl for HTTP status and redirects. For Amity, WebFetch got a 404 from the portal root. The portal was then read once via agent-reach. A second agent-reach read failed (upstream paused). For DSU, obscura `--obey-robots` hit a Cloudflare challenge page. It was not bypassed.

## Results

| # | id | `lib/data.ts` officialUrl | Portal checked | Portal evidence (under 15 words) | Main-domain evidence | Checked | Verdict |
|---:|---|---|---|---|---|---|---|
| 1 | bits-pilani-work-integrated-online | absent (record at `lib/data.ts:7643`) | https://bits-pilani-wilp.ac.in (200) | Footer: "An institution deemed to be a University estd. vide Sec.3 of the UGC Act"; header "Work Integrated Learning Programmes" | https://www.bits-pilani.ac.in links "Work Integrated Learning Programmes" and "WILP" to https://bits-pilani-wilp.ac.in/ (nav, Academics menu, footer) | 2026-11-28 | CONFIRMED (absent in data.ts, add) |
| 2 | galgotias-university-online | https://galgotiasonline.edu.in (`lib/data.ts:1667`) | https://galgotiasonline.edu.in (200) | "Galgotias University Online Distance Learning"; FAQ explains UGC-DEB; legal pages on galgotiasuniversity.edu.in | https://www.galgotiasuniversity.edu.in links "GU Online" and "Online Courses" to https://galgotiasonline.edu.in/ | 2026-11-28 | CONFIRMED |
| 3 | jain-university-online | https://onlinejain.com (`lib/data.ts:356`) | https://onlinejain.com (200) | "© 2026 JAIN (Deemed-to-be University). All rights reserved."; "UGC-Entitled programs" | https://www.jainuniversity.ac.in Academics menu links "JAIN Online Programs" to https://onlinejain.com/ | 2026-11-28 | CONFIRMED |
| 4 | dayananda-sagar-university-online | absent (record at `lib/data.ts:770`) | https://dsuonline.com (200) | "Copyright © DSU. All Rights Reserved"; "UGC & DEB Approved"; own /mandatory-disclosures page cites "Dayananda Sagar University Act – 2012" | https://www.dsu.edu.in returns 403 to WebFetch and curl. obscura (--obey-robots) got the Cloudflare "Just a moment..." challenge, not bypassed. The main page's "Online Degree Programs" block could not be traced to a URL. The portal's disclosures page does not link to dsu.edu.in. | 2026-11-28 | UNVERIFIED |
| 5 | symbiosis-university-online | https://ssodl.edu.in (`lib/data.ts:1866`) | https://ssodl.edu.in (200) | "an integral part of the esteemed Symbiosis International (Deemed University) (SIU)"; links "Visit SIU Website" | https://siu.edu.in/programmes/online-education links all 21 online programmes to ssodl.edu.in pages | 2026-11-28 | CONFIRMED |
| 6 | dr-dy-patil-vidyapeeth-online | absent (record at `lib/data.ts:4896`) | https://www.dypatilonline.com (200; bare domain 301s to www) | Footer: "Dr. D. Y. Patil Vidyapeeth, Centre for Online Learning"; "UGC entitled" | https://dpu.edu.in links "Centre for Online Learning" to https://www.dypatilonline.com/ (twice, Institutes sections) | 2026-11-28 | CONFIRMED (absent in data.ts, add) |
| 7 | amity-university-online | https://amityonline.com (`lib/data.ts:479`) | https://amityonline.com (curl 200; WebFetch 404; read via agent-reach) | Title "Amity Online, India's 1st UGC Approved online UG/ PG Degree"; "UGC Entitled" | https://www.amity.edu links "Amity University Online" and "Online Degree Programs" to https://amityonline.com/ | 2026-11-28 | CONFIRMED |
| 8 | uttaranchal-university-online | https://onlineuu.in (`lib/data.ts:4330`) | https://onlineuu.in (200; www also 200) | "Official website of Uttaranchal University's Online Degree Program"; "© Uttaranchal University" | https://www.uudoon.in Programs menu links "Online Learning (OL)" to https://www.onlineuu.in/ | 2026-11-28 | CONFIRMED |
| 9 | shoolini-university-online | absent (record at `lib/data.ts:1346`) | https://shoolini.online (200) | "Shoolini University will award the Degree."; "UGC ENTITLED DEGREE"; logo links shooliniuniversity.com | https://shooliniuniversity.com links "Shoolini Online" to https://online.shooliniuniversity.com/, which returns 301 to https://shoolini.online/ | 2026-11-28 | CONFIRMED (absent in data.ts, add) |
| 10 | adichunchanagiri-university-online | absent (record at `lib/data.ts:8427`) | https://acuonline.edu.in (200) | "Adichunchanagiri University Online" (no UGC-DEB wording on homepage) | https://acu.edu.in hero links "Online Programmes" to https://acuonline.edu.in/ | 2026-11-28 | CONFIRMED (absent in data.ts, add) |

Counts: 9 CONFIRMED (5 already in `lib/data.ts` and matching, 4 absent), 0 MISMATCH, 1 UNVERIFIED (DSU).

## Notes for the engineer

- The 5 existing `officialUrl` values match, so they need no change.
- Adding the 4 new values raises the gate's "confirmed portal" count from 23 to 27. `officialUrl` alone does not need `feeVerifiedOn`, so the gate passes without a date. Do not add `feeVerifiedOn` from this audit, because it covers domains, not fees.
- Do not use a trailing slash, because the gate fails on it. Dr. D.Y. Patil uses the `www.` host, because the bare domain redirects there.
- BITS: the portal footer cites Sec.3 of the UGC Act. Per the 18 Nov verify file, BITS has no DEB register rows. That is fine for `sameAs`, but do not treat this domain as a DEB claim.
- DSU: the portal names DSU, shows "UGC & DEB Approved" and has its own mandatory disclosures. Only the link from the main domain is unproven, because Cloudflare blocks it. Re-check when https://www.dsu.edu.in is reachable, or have Rishi confirm in a browser that its "Online Degree Programs" block links to dsuonline.com.

## JSON for CONFIRMED rows

```json
{
  "bits-pilani-work-integrated-online": "https://bits-pilani-wilp.ac.in",
  "galgotias-university-online": "https://galgotiasonline.edu.in",
  "jain-university-online": "https://onlinejain.com",
  "symbiosis-university-online": "https://ssodl.edu.in",
  "dr-dy-patil-vidyapeeth-online": "https://www.dypatilonline.com",
  "amity-university-online": "https://amityonline.com",
  "uttaranchal-university-online": "https://onlineuu.in",
  "shoolini-university-online": "https://shoolini.online",
  "adichunchanagiri-university-online": "https://acuonline.edu.in"
}
```
