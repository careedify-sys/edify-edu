# Topical authority — internal link starvation, 2026-09-13

Measured by crawling all 2,907 live sitemap pages and parsing every `<a href>`.
Method and raw output: `scripts/audit-internal-link-graph.mjs`,
`audits/internal-link-graph.md`, `audits/internal-link-graph.json`.

Site chrome is excluded. Navbar, Footer and BottomNav appear on every page, so
counting them would give `/compare` ~2,900 inbound links and drown the signal.
Any target linked from more than half of all pages is treated as chrome.

**Why link count matters here, with this site's own evidence:** across the 55
university+programme pairs that have both a review blog and a hub, the page with
more internal links is the better-ranking page in **51 of 55 (93%)**. That is the
within-pair test from `audits/seo-internal-links-session-2026-08-23.md` §2. Do
not cite the cross-sectional version, which inverts.

---

## 1. Baseline

**1,516 of 2,875 pages (53%) had 0 or 1 inbound contextual link.**

| page type | pages | 0 links | 1 link | 2 links | avg |
|---|---:|---:|---:|---:|---:|
| **uni spec page** | **1,919** | **404** | **953** | 547 | **1.1** |
| verify page | 124 | 17 | 96 | 8 | 1.0 |
| cgpa value page | 26 | 0 | 26 | 0 | 1.0 |
| blog post | 192 | 0 | 18 | 35 | 8.2 |
| uni programme hub | 457 | 0 | 0 | 9 | 8.8 |
| university page | 138 | 0 | 0 | 0 | 28.9 |
| programme hub | 2 | 0 | 0 | 0 | 16.5 |
| coupon page | 12 | 0 | 0 | 4 | 3.8 |
| guide | 2 | 0 | 0 | 0 | 9.5 |

Two readings of this table matter.

**The hubs are fixed.** 457 programme hubs, zero orphans, average 8.8. That is
the SiblingProgrammes work from 2026-08-23 holding. The method there is the one
reused below.

**The problem moved one level down.** Specialisation pages are 67% of the site
and average 1.1 inbound links. 1,357 of 1,919 have zero or one.

---

## 2. Why spec pages were starved — three distinct causes

### A. 186 pages: the hub linked an alias, not the canonical URL

`SpecializationGrid` emitted `specSlug(spec)` straight from `lib/data.ts`. When
`resolveSpec` canonicalises that to a different slug, the link pointed at a
redirect:

```
/universities/jain-university-online/mba  links  →  /mba/human-resource-management   (308)
                                       which redirects to  /mba/hr-management        (200)
```

So the canonical page received **zero** direct internal links while its alias
absorbed them. **189 such links across 457 hubs, orphaning 186 canonical pages.**

**Fixed** in `components/UniProgramBody.tsx`: spec links are canonicalised
through `resolveSpec` before rendering.

### B. 143 pages: specs that exist only in the manifest were never listed

The grid renders `pd.specs` from `lib/data.ts`. Specs that live only in
`programs-manifest.json` are in the sitemap and render fine, but nothing linked
them, so Googlebot reached them by sitemap alone.

**Fixed** in the same place: the grid list is now the union of `data.ts` specs
and `getAllSpecsForProgram()` manifest rows, deduped by canonical slug.

### C. 75 pages: linked only from a `noindex` hub — NOT fixed, and not a code defect

These are linked, but their only source carries `robots: noindex, follow`. Equity
still flows (`follow`), but from a page with little authority of its own.

Root cause is the placeholder-fee cluster: `shouldIndexProgrammeHub()` correctly
noindexes a hub with no usable fee. Example: `alliance-university-online/bba`.
**This needs real fees from official portals and cannot be fixed from inside the
codebase** — same blocker as §5b of the August audit and the parked 125-row
cluster. Worklist: `audits/noindex-hub-fee-worklist-2026-08-23.csv`.

---

## 3. The 953 pages with exactly one link — the main fix

Causes A and B only rescue orphans. The larger bucket was specialisation pages
whose single link is their programme hub: if that one source is reworded or
pruned, the page goes orphan, and one link confers very little topical signal.

Spec pages previously linked **no** sibling specialisations at all.

**Fixed:** `components/SiblingSpecialisations.tsx`, rendered by `UniSpecBody` in
both its rich-JSON and generic branches, so all 1,919 pages carry it. Each spec
page links up to 8 siblings under the same (university, programme).

Two design decisions carried over from existing precedent:

- **Rotation, not first-N.** The offset is seeded from the current slug, so
  inbound links spread across the whole group instead of piling onto whichever
  specialisations sort first. Same reasoning as `getPeerUniversities`, and the
  same fix as commit `c7376f1` for peer links.
- **Gated on `isLinkable()`.** A sibling that is noindex or does not resolve is
  never linked, so the block cannot emit a wasted or broken link.

Anchor text is `"{Program} in {Spec name}"` — descriptive and keyword-relevant,
not "click here".

**Measured on a running server, 40 spec pages sampled across the site:** average
**5.0** sibling links each, every one returning 200 directly. Roughly **9,600 new
internal links**, taking spec pages from avg 1.1 to an expected ~6 inbound.

---

## 4. Still open

| item | pages | blocker |
|---|---:|---|
| Spec pages linked only from a noindex hub (cause C) | 75 | Real fees needed from official portals |
| Verify pages: 17 orphans, 96 with one link | 113 | No component links them contextually. Candidate: a verify link on the university page, gated on `getVerifyPage()` |
| CGPA value pages, exactly one link each | 26 | Low priority. 51% of impressions, 0 leads, Google answers these with its own widget |

Re-measure after deploy by re-running
`node scripts/audit-internal-link-graph.mjs` and comparing against §1.
