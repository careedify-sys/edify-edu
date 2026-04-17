# IndexNow — Setup and Operations Guide

## What is IndexNow?

IndexNow is an open protocol that lets website owners push URL change notifications directly to participating search engines. Instead of waiting weeks for bots to crawl and discover new content, IndexNow-aware engines process submitted URLs within hours.

## Which search engines benefit?

- Bing
- Yandex
- Seznam
- Naver
- Mojeek
- Yep

**Google does NOT support IndexNow.** Google uses its own indexing pipeline (Search Console, sitemaps, links). IndexNow notifications have zero effect on Google.

**AI search tools (ChatGPT Search, Perplexity, Microsoft Copilot)** pull from Bing's index, so faster Bing indexing accelerates appearance in AI-powered search results too.

## How EdifyEdu uses IndexNow

Every CMS sync automatically notifies IndexNow of all university and blog URLs in the sync batch. No manual action required.

The notification is fire-and-forget: if Bing's API is unreachable, the CMS sync still completes normally. IndexNow failures are logged to Vercel function logs but never block content operations.

## Key file

IndexNow requires a verification file hosted at:

```
https://edifyedu.in/{KEY}.txt
```

The file contains the key as plain text. This proves domain ownership.

The file lives at `public/931451fdd494b294a01a07f0bd554348.txt` in the repo.

## How to rotate the API key if compromised

1. Generate a new 32-char hex key:
   ```bash
   node -e "const {randomBytes}=require('crypto');console.log(randomBytes(16).toString('hex'))"
   ```

2. Create `public/{new-key}.txt` with the new key as contents.

3. Delete the old key file `public/{old-key}.txt`.

4. Update `INDEXNOW_API_KEY` in `.env.local` and Vercel Dashboard → Settings → Environment Variables.

5. Commit and deploy.

## Manual bulk notification after a major deploy

Run this after any large content change to re-notify all sitemap URLs:

```bash
npm run indexnow:notify-all
```

This fetches `https://edifyedu.in/sitemap.xml`, extracts all `<loc>` URLs, and submits them in batches of up to 10,000.

## Where logs appear

Check Vercel function logs at:

```
Vercel Dashboard → Project → Deployments → Functions → /api/cms/sync
```

Look for lines starting with `[IndexNow]`.

## Diagnosing failures

| Status | Cause | Fix |
|--------|-------|-----|
| 403 | Key file not found or content mismatch | Verify `public/{key}.txt` exists and contains exactly the key string |
| 422 | URLs do not belong to the declared host | All submitted URLs must be on edifyedu.in |
| 429 | Rate limited | Wait and retry; do not submit the same URLs more than once per day |
| 400 | Malformed JSON payload | Check `lib/indexnow.ts` payload shape |

## Rate limits

IndexNow allows up to 10,000 URLs per POST and one submission per URL per day. The CMS sync submits all changed URLs in a single batch, so this stays well within limits for normal content operations.
