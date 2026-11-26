-- Undo 20261202120000_whatsapp_inbox.sql. NOT run automatically.
-- Deletes inbox notes, consent records and the audit log. Phase 1 tables and
-- stored messages are untouched. Run only after reverting the inbox code.

drop function if exists wa_month_usage(text);
drop function if exists wa_finish_outbound(uuid, text, text, integer, text);
drop function if exists wa_begin_outbound(uuid, uuid, text, text, jsonb, text);
drop function if exists wa_leads_by_digits(text);
drop function if exists wa_conversations_changed(timestamptz);
drop function if exists wa_list_conversations(text, text, boolean, timestamptz, uuid, integer);

drop index if exists wa_messages_outbound_idx;

drop table if exists wa_audit_log;
drop table if exists wa_consent;
drop table if exists wa_notes;

delete from wa_settings where key in
  ('monthly_cap_inr', 'rates', 'free_service_allowance', 'billing_timezone', 'cap_override', 'last_sweep');

select pg_notify('pgrst', 'reload schema');
