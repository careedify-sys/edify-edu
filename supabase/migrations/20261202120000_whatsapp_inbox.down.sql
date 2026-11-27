-- Undo 20261202120000_whatsapp_inbox.sql. NOT run automatically.
-- Deletes inbox notes, consent records (including recorded opt-outs) and the
-- audit log. Phase 1 tables and stored messages are untouched, and the
-- Phase 1 webhook keeps working. Run only AFTER the inbox code is reverted
-- and that revert is live, or the sweep and the inbox will log errors.

drop function if exists wa_crm_contact_blocks();
drop function if exists wa_apply_retention();
drop function if exists wa_record_opt_outs();
drop function if exists wa_month_usage(text);
drop function if exists wa_finish_outbound(uuid, text, text, integer, text);
drop function if exists wa_reserve_outbound(uuid, uuid, text, text, jsonb, text);
drop function if exists wa_contact_opted_out(uuid);
drop function if exists wa_is_opt_out(text);
drop function if exists wa_leads_by_digits(text);
drop function if exists wa_conversations_changed(timestamptz);
drop function if exists wa_list_conversations(text, text, boolean, timestamptz, uuid, integer);

drop index if exists wa_messages_created_idx;
drop index if exists wa_message_statuses_received_idx;

drop table if exists wa_audit_log;
drop table if exists wa_consent;
drop table if exists wa_notes;

delete from wa_settings where key in
  ('monthly_cap_inr', 'rates', 'free_service_allowance', 'billing_timezone', 'cap_override',
   'last_sweep', 'last_retention');

select pg_notify('pgrst', 'reload schema');
