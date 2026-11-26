-- Undo 20261201120000_whatsapp_core.sql. NOT run automatically.
-- Deletes every stored WhatsApp message, contact and webhook event. Run only
-- after reverting the webhook code, and only if the data is not needed.

drop function if exists wa_exhausted_count();
drop function if exists wa_purge_raw_bodies();
drop function if exists wa_events_to_retry(integer);
drop function if exists wa_process_event(bigint);
drop function if exists wa_begin_attempt(bigint);
drop function if exists wa_ingest_event(text, text);
drop function if exists wa_apply_payload(jsonb);
drop function if exists wa_recompute_status(text);
drop function if exists wa_message_body(jsonb);
drop function if exists wa_upsert_conversation(uuid, text);
drop function if exists wa_upsert_contact(text, text, text, text, text, text);
drop function if exists wa_epoch(text);
drop function if exists wa_digits(text);
drop function if exists wa_status_rank(text);

drop table if exists wa_settings;
drop table if exists wa_webhook_events;
drop table if exists wa_message_statuses;
drop table if exists wa_messages;
drop table if exists wa_conversations;
drop table if exists wa_contact_identity_history;
drop table if exists wa_contacts;

select pg_notify('pgrst', 'reload schema');
