import { createSupabaseServiceClient } from '@/lib/supabase/service';
import LeadsClient from './LeadsClient';
import type { Lead, Activity } from './actions';
import { buildProgUnisIndex } from './program-lookup';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeadsPage() {
  const sb = createSupabaseServiceClient();

  const [{ data: leadsData, error: leadsErr }, { data: actData, error: actErr }, progUnisIndex] = await Promise.all([
    sb.from('leads')
      .select('id,name,phone,email,city,program,university,source,message,preferred_time,stage,next_call_date,next_call_time,created_at,updated_at,last_submitted_at,imported')
      .order('last_submitted_at', { ascending: false }),
    sb.from('lead_activity')
      .select('id,lead_id,occurred_on,occurred_time,type,outcome,reason,remark,created_at')
      .order('occurred_on', { ascending: true })
      .order('created_at', { ascending: true }),
    buildProgUnisIndex(),
  ]);

  if (leadsErr || actErr) {
    return (
      <div className="app">
        <div className="card" style={{ borderColor: 'var(--red-line)', color: 'var(--red)' }}>
          Supabase query failed: {(leadsErr || actErr)?.message}
        </div>
      </div>
    );
  }

  const leads = (leadsData ?? []) as Lead[];
  const activity = (actData ?? []) as Activity[];

  return <LeadsClient initialLeads={leads} initialActivity={activity} progUnisIndex={progUnisIndex} />;
}
