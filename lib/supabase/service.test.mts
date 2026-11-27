// Guard: the service-role client must send every request with cache: 'no-store',
// so Next's Data Cache can never serve a stale switch or setting.
// Run: npx tsx lib/supabase/service.test.mts
import assert from 'node:assert/strict'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
const seen: Array<RequestInit | undefined> = []
globalThis.fetch = (async (_i: unknown, init?: RequestInit) => { seen.push(init); return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }) }) as typeof fetch
const { createSupabaseServiceClient } = await import('./service')
const sb = createSupabaseServiceClient()
await sb.from('wa_settings').select('value').eq('key', 'referral_disclosure')
await sb.rpc('referral_count_open', { p_token: 'x' })
assert.equal(seen.length, 2)
for (const init of seen) assert.equal(init?.cache, 'no-store')
console.log('ok   service client sends cache: no-store on GET and RPC\n1 passed')
