# WhatsApp Cloud API webhook

Endpoint: `https://edifyedu.in/api/whatsapp/webhook`

Receive-only. It verifies Meta's subscription check (GET) and accepts signed
message and delivery-status events (POST). It sends no WhatsApp messages.

## Files

| File | Role |
|---|---|
| `app/api/whatsapp/webhook/route.ts` | GET verification, POST events, logging |
| `lib/whatsapp/signature.ts` | `X-Hub-Signature-256` HMAC check, constant-time token compare |
| `lib/whatsapp/dedupe.ts` | Duplicate-event guard (per-instance, 24h TTL) |

## Environment variables (server-only)

| Name | Value |
|---|---|
| `WHATSAPP_VERIFY_TOKEN` | Random string you choose. Paste the same value into Meta's "Verify token" box. |
| `META_APP_SECRET` | Meta App Dashboard, App settings, Basic, App secret. |

Generate a verify token:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Never prefix either with `NEXT_PUBLIC_`. That would ship it to the browser.

## Behaviour

| Request | Response |
|---|---|
| GET, `hub.mode=subscribe`, correct token, alphanumeric challenge | 200, challenge echoed as text/plain |
| GET, anything else | 403 |
| POST, missing/wrong/malformed signature | 401 |
| POST, body over 1 MB | 413 |
| POST, signed, invalid JSON | 400 |
| POST, signed, not `whatsapp_business_account` | 200, ignored |
| POST, signed, valid | 200 `EVENT_RECEIVED` |
| Either, env var missing | 500 `Not configured` |

Dedupe keys: `msg:<wamid>` for messages, `status:<wamid>:<status>` for status
updates, so `sent`, `delivered` and `read` each count once.

Logs show counts and types only, for example
`{"messages":1,"statuses":0,"duplicates":0,"messageTypes":{"text":1}}`.
No phone numbers, names, text, media ids, tokens or payloads.

## Known limit: dedupe is per instance

The in-memory cache catches a fast retry on the same warm Vercel instance, not a
retry that lands on another instance. That is harmless while the handlers do
nothing. Before adding a side effect (saving a lead, replying), add a table with
a UNIQUE key column and insert-on-conflict-do-nothing, and only act when the
insert created a row.

## Vercel deploy

1. Vercel, project `edify-edu-dh2m`, Settings, Environment Variables. Add both
   variables for Production (and Preview if you test there). Mark them Sensitive.
2. Deploy: merge this branch to `main` and push. Env var changes only apply to
   deployments built after they were added, so redeploy if the variables were
   added after the last build.
3. Smoke test (expects `hello123` back):
   ```
   curl "https://edifyedu.in/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=hello123"
   ```
   A wrong token must return 403. An unsigned POST must return 401.
4. Meta App Dashboard, WhatsApp, Configuration, Webhook, Edit:
   - Callback URL: `https://edifyedu.in/api/whatsapp/webhook` (apex, not `www`:
     `www` 308-redirects and Meta's check can fail on a redirect)
   - Verify token: the `WHATSAPP_VERIFY_TOKEN` value
   - Verify and save, then under Webhook fields subscribe to `messages`.
5. Send a WhatsApp message to the business number and check Vercel, Logs, for
   `[whatsapp-webhook] received` with `"messages":1`.

Cloudflare: `/api/*` responses carry `Cache-Control: no-store`, so the edge does
not cache them. If a Cloudflare WAF or bot rule challenges Meta's servers, the
verify step fails with a non-200; allow the path in that case.

Rotating the app secret: update `META_APP_SECRET` in Vercel and redeploy at the
same time, or POSTs return 401 until both sides match.
