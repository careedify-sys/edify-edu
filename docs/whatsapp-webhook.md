# WhatsApp Cloud API webhook

Endpoint: `https://edifyedu.in/api/whatsapp/webhook`

Receive-only. It verifies Meta's subscription check (GET) and accepts signed
message and delivery-status events (POST). It sends no WhatsApp messages.

Since Phase 1 (docs/whatsapp-platform-implementation-plan.md) every signed
delivery is stored in Supabase before the 200 and projected into contacts,
conversations, messages and statuses. Run
`supabase/migrations/20261201120000_whatsapp_core.sql` BEFORE deploying it,
or the webhook answers 500 (Meta retries).

## Files

| File | Role |
|---|---|
| `app/api/whatsapp/webhook/route.ts` | GET verification, POST events, logging |
| `lib/whatsapp/signature.ts` | `X-Hub-Signature-256` HMAC check, constant-time token compare |
| `lib/whatsapp/ingest.ts` | POST handling: verify, store, process (testable, no framework imports) |
| `lib/whatsapp/store.ts` | Supabase RPC calls (service role) |
| `app/api/cron/whatsapp-sweep/route.ts` | Every 5 min: retries stored events that did not complete, purges raw bodies after 30 days |
| `supabase/migrations/20261201120000_whatsapp_core.sql` | Tables and the processing functions (`.down.sql` undoes it) |

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
| POST, signed, valid, stored | 200 `EVENT_RECEIVED` (even if processing failed: the sweeper retries) |
| POST, signed, valid, database write failed | 500 (Meta retries) |
| Either, env var missing | 500 `Not configured` |

Duplicates are stopped by unique keys in Postgres: the SHA-256 of the raw body
(whole-delivery retries), the message wamid, and wamid+status for statuses.
This holds across Vercel instances.

Logs show counts and types only, for example
`{"event":12,"state":"completed","messages":1,"duplicates":0,"statuses":0,...,"messageTypes":{"text":1}}`.
No phone numbers, names, text, media ids, tokens, payloads or error messages.

## Tests

```
npx tsx lib/whatsapp/ingest.test.mts
PGLITE_MODULE=file:///<dir>/node_modules/@electric-sql/pglite/dist/index.js npx tsx lib/whatsapp/sql.test.mts
```

The SQL suite runs the migrations on PGlite (Postgres in WebAssembly); install
PGlite outside the repo (`npm i --prefix <dir> @electric-sql/pglite@0.3`). It is
single-connection, so multi-connection concurrency needs a real non-production
Postgres.

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
