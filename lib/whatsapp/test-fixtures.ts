// Mock Meta webhook payloads for tests. Fake numbers in the 91980000xxxx range;
// no real student data.

export function inboundText(o: {
  id: string
  from?: string
  fromUserId?: string
  text: string
  name?: string
  username?: string
  timestamp?: string
}) {
  const m: Record<string, unknown> = {
    id: o.id,
    timestamp: o.timestamp ?? '1764000000',
    type: 'text',
    text: { body: o.text },
  }
  if (o.from) m.from = o.from
  if (o.fromUserId) m.from_user_id = o.fromUserId
  const contact: Record<string, unknown> = { profile: { name: o.name ?? 'Test User', ...(o.username ? { username: o.username } : {}) } }
  if (o.from) contact.wa_id = o.from
  if (o.fromUserId) contact.user_id = o.fromUserId
  ;(m as any).__contact = contact
  return m
}

export function statusEvent(o: {
  id: string
  status: string
  recipient?: string
  recipientUserId?: string
  timestamp?: string
  pricing?: Record<string, unknown>
  errors?: Array<Record<string, unknown>>
}) {
  const s: Record<string, unknown> = { id: o.id, status: o.status, timestamp: o.timestamp ?? '1764000050' }
  if (o.recipient) s.recipient_id = o.recipient
  if (o.recipientUserId) s.recipient_user_id = o.recipientUserId
  if (o.pricing) s.pricing = o.pricing
  if (o.errors) s.errors = o.errors
  return s
}

export function buildPayload(o: {
  messages?: Array<Record<string, unknown>>
  statuses?: Array<Record<string, unknown>>
  contacts?: Array<Record<string, unknown>>
  entryId?: string
  phoneNumberId?: string
}) {
  const contacts = o.contacts ?? (o.messages ?? []).map(m => (m as any).__contact).filter(Boolean)
  const messages = (o.messages ?? []).map(m => {
    const { __contact, ...rest } = m as any
    return rest
  })
  const value: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    metadata: { display_phone_number: '910000000000', phone_number_id: o.phoneNumberId ?? 'TEST_PNID' },
  }
  if (contacts.length) value.contacts = contacts
  if (messages.length) value.messages = messages
  if (o.statuses?.length) value.statuses = o.statuses
  return {
    object: 'whatsapp_business_account',
    entry: [{ id: o.entryId ?? 'TEST_WABA', changes: [{ field: 'messages', value }] }],
  }
}
