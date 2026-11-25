// Duplicate-event guard for the WhatsApp webhook.
//
// Meta retries a delivery when it does not get a 200 quickly, and can send the
// same message or status more than once. Each event gets a stable key:
//   message: msg:<wamid>
//   status:  status:<wamid>:<status>   (sent, delivered, read are separate events)
//
// LIMIT: this cache lives in one serverless instance's memory. It catches the
// common case (a fast retry hitting the same warm instance) but not a retry
// that lands on a cold or different instance. That is safe today because the
// webhook has no side effects. Before adding any side effect (saving a lead,
// sending a reply), move dedupe to a persistent store with a UNIQUE constraint
// on the key, e.g. a Supabase table, and insert-on-conflict-do-nothing.

const TTL_MS = 24 * 60 * 60 * 1000
const MAX_KEYS = 10_000

const seen = new Map<string, number>() // key -> expiry epoch ms (insertion-ordered)

function prune(now: number) {
  // Map keeps insertion order and every entry gets the same TTL, so the
  // oldest entries come first. Stop at the first live one once under the cap.
  for (const key of Array.from(seen.keys())) {
    const expiry = seen.get(key) ?? 0
    if (expiry > now && seen.size <= MAX_KEYS) break
    seen.delete(key)
  }
}

/** Returns true the first time a key is seen within the TTL, false for repeats. */
export function markIfNew(key: string, now = Date.now()): boolean {
  const expiry = seen.get(key)
  if (expiry !== undefined && expiry > now) return false
  seen.delete(key)
  seen.set(key, now + TTL_MS)
  prune(now)
  return true
}

/** Test helper. */
export function _resetDedupe() {
  seen.clear()
}
