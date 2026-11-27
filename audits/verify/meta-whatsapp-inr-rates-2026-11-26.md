# Meta WhatsApp INR list rates, India row (read 26 Nov 2026)

Source: Meta for Developers, WhatsApp Business Platform pricing page, the "INR list rates" rate card linked there. The card is an .xlsx file served with a .csv name.

Effective from: 1 October 2026. Billing: per delivered message.

| Category | Rate (INR per delivered message) |
|---|---|
| Marketing | 0.8631 |
| Utility | 0.115 |
| Authentication | 0.115 |
| Authentication-International | 2.4971 |
| Service | 0.115 |

Free tier: 1,000 free service messages per business phone number per month, reset at midnight in the Messaging account time zone (pricing page, re-read by qa-checker 27 Nov 2026).

Where it is used: seeded into `wa_settings` (`rates`, `free_service_allowance`) by `supabase/migrations/20261202120000_whatsapp_inbox.sql`. It is shown only in the admin inbox at /leads/whatsapp, never on a public page. Re-check on the first day of each quarter.
