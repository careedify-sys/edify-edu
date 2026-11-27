// Opt-out detection. The same word list lives in SQL (wa_is_opt_out in
// 20261202120000_whatsapp_inbox.sql); sql.test.mts feeds OPT_OUT_SAMPLES to
// both so they cannot drift apart.
export const STOP_WORDS = /^\s*(stop|unsubscribe|stop all|band karo|mat bhejo|no more messages)\s*[.!]*\s*$/i

export const OPT_OUT_SAMPLES: Array<[string, boolean]> = [
  ['STOP', true], ['stop', true], [' Stop. ', true], ['stop!!', true], ['Unsubscribe', true], ['STOP ALL', true],
  ['band karo', true], ['Mat bhejo', true], ['no more messages', true],
  ['please stop', false], ['I cannot stop thinking about the MBA', false], ['stopped', false], ['', false],
]

export function isOptOutText(body: string | null | undefined): boolean {
  return !!body && STOP_WORDS.test(body)
}

// An inbound text opt-out received after the latest 'service' consent record.
export function looksLikeOptOut(
  messages: Array<{ direction: string; type: string; body: string | null; created_at: string }>,
  lastConsentAt: string | null,
): boolean {
  return messages.some(m => m.direction === 'inbound' && m.type === 'text' && isOptOutText(m.body)
    && (!lastConsentAt || m.created_at > lastConsentAt))
}
