'use server';
// Server actions for the /leads CRM.
// Auth is gated at TWO layers:
//   1) middleware.ts protects /leads (which is where server actions POST to);
//   2) requireAdmin() below is called at the top of every action as
//      defense-in-depth, so a middleware misconfiguration can never leak
//      lead data or accept mutations.

import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const SESSION_COOKIE = 'edify_admin_session';

// Returns null on success, or an {ok:false} object that actions can return
// as-is. Timing-safe compare against ADMIN_SESSION_TOKEN.
async function requireAdmin(): Promise<{ ok: false; error: string } | null> {
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!expected) return { ok: false, error: 'Server misconfigured' };
  const got = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!got) return { ok: false, error: 'Unauthorized' };
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return { ok: false, error: 'Unauthorized' };
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, error: 'Unauthorized' };
  return null;
}

export type Stage = 'Fresh' | 'Follow-up' | 'Interested' | 'Next session' | 'Registered' | 'Enrolled' | 'Not interested';
export type OutcomeKey =
  | 'No answer' | 'Busy' | 'Callback'
  | 'Interested' | 'Follow-up' | 'Next session' | 'Registered' | 'Enrolled' | 'Not interested'
  | 'Add note';

export type Activity = {
  id: string;
  lead_id: string;
  occurred_on: string;
  occurred_time: string | null;
  type: 'call' | 'note';
  outcome: string | null;
  reason: string | null;
  remark: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  program: string | null;
  university: string | null;
  source: string | null;
  message: string | null;
  preferred_time: string | null;
  stage: Stage;
  next_call_date: string | null;
  next_call_time: string | null;
  created_at: string;
  updated_at: string;
  last_submitted_at: string;
  imported: boolean;
};

// ── saveOutcome ────────────────────────────────────────────────────────────
// Writes one lead_activity row and applies the outcome's effect on the lead
// (stage transition, next_call_* update). Returns the fresh lead + the
// activity row so the client can patch state without re-fetching.
export async function saveOutcome(input: {
  leadId: string;
  outcome: OutcomeKey;
  note: string;
  reason: string | null;
  date: string | null;   // YYYY-MM-DD
  time: string | null;   // HH:MM
}): Promise<{ ok: true; lead: Lead; activity: Activity } | { ok: false; error: string }> {
  const guard = await requireAdmin(); if (guard) return guard;
  const sb = createSupabaseServiceClient();

  const { data: current, error: readErr } = await sb
    .from('leads').select('*').eq('id', input.leadId).single();
  if (readErr || !current) return { ok: false, error: readErr?.message || 'Lead not found' };

  // Build activity row.
  const isNote = input.outcome === 'Add note';
  let remark = input.note.trim();
  if (input.reason) remark = remark ? `${input.reason} — ${remark}` : input.reason;

  const activityInsert = {
    lead_id: input.leadId,
    occurred_on: new Date().toISOString().slice(0, 10),
    occurred_time: input.time || null,
    type: (isNote ? 'note' : 'call') as 'note' | 'call',
    outcome: isNote ? null : input.outcome,
    reason: input.reason,
    remark: remark || null,
  };

  const { data: act, error: actErr } = await sb
    .from('lead_activity').insert(activityInsert).select('*').single();
  if (actErr) return { ok: false, error: actErr.message };

  // Compute lead patch.
  const patch: Partial<Lead> = {};

  // Stage transitions per outcome.
  const STAGE_FROM_OUTCOME: Partial<Record<OutcomeKey, Stage>> = {
    'Interested':     'Interested',
    'Follow-up':      'Follow-up',
    'Next session':   'Next session',
    'Registered':     'Registered',
    'Enrolled':       'Enrolled',
    'Not interested': 'Not interested',
  };
  if (STAGE_FROM_OUTCOME[input.outcome]) {
    patch.stage = STAGE_FROM_OUTCOME[input.outcome];
  } else if ((input.outcome === 'No answer' || input.outcome === 'Busy' || input.outcome === 'Callback')
             && current.stage === 'Fresh') {
    patch.stage = 'Follow-up';
  }

  // Next-call update.
  // Final states clear the next call. Enrolled + Not interested are final.
  // Registered is not final — student may still need follow-up for payment,
  // so leave existing next_call_date alone unless the user picked a new one.
  if (input.outcome === 'Enrolled' || input.outcome === 'Not interested') {
    patch.next_call_date = null;
    patch.next_call_time = null;
  } else if (input.outcome === 'Registered') {
    // keepSched: touch next_call only if user set one in the capture form
    if (input.date) patch.next_call_date = input.date;
    if (input.time) patch.next_call_time = input.time;
  } else if (isNote) {
    // note-only: leave next_call untouched, unless date was explicitly set.
    if (input.date) patch.next_call_date = input.date;
    if (input.time) patch.next_call_time = input.time;
  } else if (input.outcome === 'Next session') {
    patch.next_call_date = input.date || '2027-01-15';
    patch.next_call_time = null;
  } else {
    patch.next_call_date = input.date || null;
    patch.next_call_time = input.time || null;
  }

  const { data: updated, error: upErr } = await sb
    .from('leads').update(patch).eq('id', input.leadId).select('*').single();
  if (upErr) return { ok: false, error: upErr.message };

  revalidatePath('/leads');
  return { ok: true, lead: updated as Lead, activity: act as Activity };
}

// ── quickSchedule ──────────────────────────────────────────────────────────
// The "quick" schedule chips: Tomorrow / In 3 days / Next week / Next session / No follow-up.
export async function quickSchedule(input: {
  leadId: string;
  chip: 'tomorrow' | 'in3' | 'nextweek' | 'nextsession' | 'none';
}): Promise<{ ok: true; lead: Lead } | { ok: false; error: string }> {
  const guard = await requireAdmin(); if (guard) return guard;
  const sb = createSupabaseServiceClient();
  const { data: current, error: readErr } = await sb
    .from('leads').select('*').eq('id', input.leadId).single();
  if (readErr || !current) return { ok: false, error: readErr?.message || 'Lead not found' };

  const patch: Partial<Lead> = {};
  const today = new Date();
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  switch (input.chip) {
    case 'tomorrow':    patch.next_call_date = addDays(1); patch.next_call_time = null; break;
    case 'in3':         patch.next_call_date = addDays(3); patch.next_call_time = null; break;
    case 'nextweek':    patch.next_call_date = addDays(7); patch.next_call_time = null; break;
    case 'nextsession': patch.stage = 'Next session'; patch.next_call_date = '2027-01-15'; patch.next_call_time = null; break;
    case 'none':        patch.next_call_date = null;      patch.next_call_time = null; break;
  }
  // Coming out of "Next session" via any dated chip → back to Follow-up.
  if (current.stage === 'Next session' && input.chip !== 'nextsession' && input.chip !== 'none') {
    patch.stage = 'Follow-up';
  }
  const { data, error } = await sb.from('leads').update(patch).eq('id', input.leadId).select('*').single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/leads');
  return { ok: true, lead: data as Lead };
}

// ── setNextCall ─────────────────────────────────────────────────────────────
// Explicit date/time picker.
export async function setNextCall(input: {
  leadId: string;
  date: string | null;
  time: string | null;
}): Promise<{ ok: true; lead: Lead } | { ok: false; error: string }> {
  const guard = await requireAdmin(); if (guard) return guard;
  const sb = createSupabaseServiceClient();
  const patch: Partial<Lead> = { next_call_date: input.date, next_call_time: input.time };
  const { data, error } = await sb.from('leads').update(patch).eq('id', input.leadId).select('*').single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/leads');
  return { ok: true, lead: data as Lead };
}

// ── updateLeadFields ────────────────────────────────────────────────────────
// Contact-block edits (university, name, email, city, program).
export async function updateLeadFields(input: {
  leadId: string;
  patch: Partial<Pick<Lead, 'name' | 'email' | 'city' | 'program' | 'university'>>;
}): Promise<{ ok: true; lead: Lead } | { ok: false; error: string }> {
  const guard = await requireAdmin(); if (guard) return guard;
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from('leads').update(input.patch).eq('id', input.leadId).select('*').single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/leads');
  return { ok: true, lead: data as Lead };
}
