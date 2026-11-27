// Where a marketing opt-in came from. Shared by the server rules and the
// browser form, so it holds no server-only imports.
export const CONSENT_SOURCES = ['enrolment_record', 'lead_form', 'whatsapp_message', 'phone_call', 'referral_reply', 'admin_entry', 'other'] as const
export type ConsentSourceKey = (typeof CONSENT_SOURCES)[number]
export const CONSENT_SOURCE_TEXT: Record<ConsentSourceKey, string> = {
  enrolment_record: 'Admission or enrolment form with a WhatsApp opt-in',
  lead_form: 'Website enquiry form with a WhatsApp opt-in',
  whatsapp_message: 'They asked on WhatsApp',
  phone_call: 'They agreed on a phone call',
  referral_reply: 'They replied to a referral message',
  admin_entry: 'Written record held by edifyedu.in',
  other: 'Other written record',
}
