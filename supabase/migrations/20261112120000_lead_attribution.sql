-- Lead attribution: which channel and page brought each lead.
--
-- Before this, every lead in the Google Sheet said Source = "website" and
-- nothing recorded UTM tags, the referring site or the landing page. The site
-- now keeps an `edify_attr` cookie (last non-direct touch, 30 days) and
-- /api/enquiry writes these columns from it. `source` keeps its existing
-- "<page> · <widget>" format and is not touched.
--
-- channel: derived on the server (lib/attribution.ts deriveChannel): the UTM
-- source when present, else ai-assistant / organic-search / youtube /
-- instagram / facebook / reddit / quora / linkedin / whatsapp /
-- referral:<host>, else direct. Phone and WhatsApp leads added by hand use the
-- fixed answer list from the lead-tracking doc.
--
-- On a repeat submission by the same phone the route fills these only where
-- they are null, so the first known channel is kept.
--
-- Run in the Supabase SQL editor BEFORE the deploy goes live. All columns are
-- nullable, so existing rows are unaffected.

alter table leads add column if not exists channel      text;
alter table leads add column if not exists landing_page text;
alter table leads add column if not exists referrer     text;
alter table leads add column if not exists utm_source   text;
alter table leads add column if not exists utm_medium   text;
alter table leads add column if not exists utm_campaign text;
alter table leads add column if not exists utm_content  text;

create index if not exists leads_channel_idx on leads (channel);
