'use client';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { Activity, Lead, OutcomeKey, Stage } from './actions';
import { quickSchedule, saveOutcome, setNextCall, updateLeadFields } from './actions';

// ── Formatters ─────────────────────────────────────────────────────────────
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function todayISO() { return new Date().toISOString().slice(0, 10); }
function parseISO(s: string) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function daysUntil(s: string): number {
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.round((parseISO(s).getTime() - t.getTime()) / 86400000);
}
function fmtNice(s: string) { const d = parseISO(s); return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`; }
function fmtTime(t: string | null) {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  let h = Number(hStr); const m = mStr;
  const ap = h < 12 ? 'am' : 'pm';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
function fmtPhone(p: string) {
  // "917061234567" → "+91 70612 34567"
  const digits = p.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return p;
}
function waDigits(p: string) {
  const d = p.replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
}

const DOT: Record<Stage, string> = {
  'Fresh':          '#9AA0A6',
  'Follow-up':      'var(--amber-dot)',
  'Interested':     'var(--accent)',
  'Converted':      'var(--accent)',
  'Next session':   'var(--blue)',
  'Not interested': '#B7BCC3',
};
const NI_REASONS = [
  'Budget too high', 'Not eligible', 'Chose another option',
  'Just exploring', 'Wrong / unreachable number', 'Other',
];

type OutcomeDef = {
  kind: 'reach' | 'talk' | 'note';
  stage?: Stage;
  stageIfFresh?: Stage;
  defDays?: number | null;
  intake?: boolean;
  none?: boolean;
  reason?: boolean;
  timeField?: boolean;
  keepSched?: boolean;
  noAdvance?: boolean;
  noteLbl: string;
  place: string;
  chipCls?: string;
};

const OUT: Record<OutcomeKey, OutcomeDef> = {
  'No answer':      { kind: 'reach', stageIfFresh: 'Follow-up', defDays: 1, noteLbl: 'Note (optional)', place: 'e.g. rang out, will retry' },
  'Busy':           { kind: 'reach', stageIfFresh: 'Follow-up', defDays: 1, noteLbl: 'Note (optional)', place: 'e.g. asked to call later' },
  'Callback':       { kind: 'reach', stageIfFresh: 'Follow-up', defDays: 0, timeField: true, noteLbl: 'Note (optional)', place: 'e.g. wants a call back' },
  'Interested':     { kind: 'talk', stage: 'Interested', defDays: 2, timeField: true, chipCls: 'good',
                      noteLbl: 'What did you discuss? (fees, program, doubts…)', place: 'note the full conversation here' },
  'Follow-up':      { kind: 'talk', stage: 'Follow-up', defDays: 3, timeField: true,
                      noteLbl: 'Follow-up remarks', place: "what's still pending" },
  'Next session':   { kind: 'talk', stage: 'Next session', intake: true, chipCls: 'session',
                      noteLbl: 'Note — which intake & why', place: 'e.g. wants Jan 2027, needs time' },
  'Converted':      { kind: 'talk', stage: 'Converted', none: true, chipCls: 'good',
                      noteLbl: 'Remarks — university, payment, etc.', place: 'how it closed' },
  'Not interested': { kind: 'talk', stage: 'Not interested', none: true, reason: true, chipCls: 'bad',
                      noteLbl: 'Remarks', place: 'anything to remember' },
  'Add note':       { kind: 'note', keepSched: true, noAdvance: true, noteLbl: 'Your note', place: 'jot anything about this lead' },
};

function addDaysISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dueInfo(l: Lead): { t: string; sub: string; over: boolean; none?: boolean } {
  if (l.stage === 'Converted' || l.stage === 'Not interested') return { t: '—', sub: '', over: false, none: true };
  if (l.stage === 'Next session') return { t: 'Next session', sub: l.next_call_date ? fmtNice(l.next_call_date) : 'next cycle', over: false };
  if (!l.next_call_date) return { t: 'Not scheduled', sub: '', over: false, none: true };
  const d = daysUntil(l.next_call_date);
  let rel: string;
  if (d < 0) rel = `Overdue ${-d}d`;
  else if (d === 0) rel = 'Today';
  else if (d === 1) rel = 'Tomorrow';
  else rel = `In ${d} days`;
  const tm = l.next_call_time ? ` · ${fmtTime(l.next_call_time)}` : '';
  return { t: rel, sub: `${fmtNice(l.next_call_date)}${tm}`, over: d < 0 };
}

// Templates: 6 WhatsApp variants, personalised by lead.
function templates(l: Lead) {
  const first = (l.name || '').split(' ')[0];
  const city = l.city || 'your city';
  const uni = l.university || 'the university you asked about';
  const prog = l.program || 'the program';
  return {
    'Welcome':
`Hi ${first}, this is Rishi from edifyedu.in 👋

Thanks for enquiring about Online ${prog} at ${uni}. I help students in ${city} and across India choose the right online degree — no commissions, no pressure, just honest guidance.

I'll call you shortly. If now isn't a good time, reply with a better time.`,
    'Missed call':
`Hi ${first}, Rishi from edifyedu.in — I just tried calling but couldn't reach you 📞

No worries at all. Reply here whenever you're free, or I'll try again tomorrow. Quick one to save your time: is Online ${prog} still what you're exploring?`,
    'Details shared':
`Hi ${first}, as promised, here are the verified details for Online ${prog} at ${uni} — approval, fees and duration, all cross-checked by us.

Have a look and tell me if anything's unclear. I'm happy to compare it with one or two other universities too, so you can decide with full clarity.`,
    'Gentle follow-up':
`Hi ${first}, just following up on our chat about ${uni} 🙂

Take your time — it's a big decision. If any doubt is holding you back (fees, approval, placements), tell me and I'll get you the honest answer.`,
    'Decision nudge':
`Hi ${first}, a small heads-up — the current admission cycle for ${uni} is filling up, so if you're leaning towards it, starting soon helps you avoid the last-minute rush.

No pressure at all; I just don't want you to miss the window. Shall I help you begin?`,
    'Re-connect':
`Hi ${first}, it's Rishi from edifyedu.in — we spoke a little while ago about Online ${prog}.

Just checking in to see where you've reached. If you've paused the plan or chosen another path, that's completely fine — just let me know so I can guide you accordingly.`,
  };
}
type TplKey = keyof ReturnType<typeof templates>;

// ── Icons (minimal set) ────────────────────────────────────────────────────
const iSearch = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
);
const iLock = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
);
const iSchool = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>
);
const iHist = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l3 2"/></svg>
);
const iCal = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
);
const iPhone = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2H7a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>
);
const iWa = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 01-12.3 7.5L3 21l2-5.7A8.4 8.4 0 1121 11.5z"/></svg>
);
const iEdit = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>
);
const iPlus = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
);
const iMail = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
);
const iPin = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
);
const iOk = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></svg>
);
const iOff = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l20 20M9 5.4A2 2 0 0111 4h2a2 2 0 012 1.7c.1.9.3 1.7.5 2.5"/><path d="M5.3 9.3A16 16 0 0014.7 18.7"/></svg>
);
const iNo = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
);
const iClock = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
);
const iNote = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
);

// ── Component ──────────────────────────────────────────────────────────────
type ProgUni = { id: string; name: string; abbr: string; naac: string | null; nirf: number | null };
type Props = {
  initialLeads: Lead[];
  initialActivity: Activity[];
  progUnisIndex: Record<string, ProgUni[]>;
};

const PROG_KEYS: string[] = ['MBA','MCA','BBA','BCA','BA','B.Com','M.Com','MA','MSc','BSc'];

export default function LeadsClient({ initialLeads, initialActivity, progUnisIndex }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activityByLead, setActivityByLead] = useState<Record<string, Activity[]>>(() => {
    const m: Record<string, Activity[]> = {};
    for (const a of initialActivity) (m[a.lead_id] ||= []).push(a);
    return m;
  });
  const [filter, setFilter] = useState<'new' | 'today' | 'all' | 'backlog' | Stage>('new');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selId, setSelId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const [waMode, setWaMode] = useState<TplKey | null>(null);
  const [capture, setCapture] = useState<OutcomeKey | null>(null);
  const [showUniSel, setShowUniSel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      // Server-side cookie clear (both session + any pending OTP).
      await fetch('/api/admin-auth', { method: 'DELETE' });
    } catch {
      /* even on network failure we redirect — middleware will re-gate */
    }
    // Hard redirect so the page refetches without stale in-memory state.
    window.location.href = '/admin-login';
  }, []);

  // ── derived ────────────────────────────────────────────────────────────
  // "Today" is now strictly the call queue — active leads with a scheduled
  // next-call date that's today or earlier. Dropped the old "Fresh with no
  // calls → Today" branch because it flooded Today with the 214 imported
  // leads. Those now surface via the New tab (last 7 days by created_at).
  const isTodayLead = useCallback((l: Lead) => {
    if (l.stage === 'Converted' || l.stage === 'Not interested' || l.stage === 'Next session') return false;
    if (!l.next_call_date) return false;
    return daysUntil(l.next_call_date) <= 0;
  }, []);

  // "New" = non-imported AND last submitted within the last 7 days. Uses
  // last_submitted_at (not created_at) so a repeat website submission on an
  // existing lead bubbles it back to the top. Imported=true is excluded
  // outright so the historical backlog never pollutes the New view.
  const NEW_WINDOW_MS = 7 * 86400000;
  const isNewLead = useCallback((l: Lead) => {
    if (l.imported) return false;
    return Date.now() - new Date(l.last_submitted_at).getTime() <= NEW_WINDOW_MS;
  }, [NEW_WINDOW_MS]);

  const visible = useMemo(() => {
    let v = leads.slice();
    if      (filter === 'new')     v = v.filter(isNewLead);
    else if (filter === 'today')   v = v.filter(isTodayLead);
    else if (filter === 'backlog') v = v.filter(l => l.imported);
    else if (filter === 'Fresh')   v = v.filter(l => l.stage === 'Fresh' && !l.imported);
    else if (filter !== 'all')     v = v.filter(l => l.stage === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      v = v.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      );
    }
    if (filter === 'new' || filter === 'backlog') {
      // Most-recent submission first.
      v.sort((a, b) => new Date(b.last_submitted_at).getTime() - new Date(a.last_submitted_at).getTime());
    } else {
      const sortKey = (l: Lead) => l.next_call_date ? daysUntil(l.next_call_date) : 999;
      v.sort((a, b) => sortKey(a) - sortKey(b));
    }
    return v;
  }, [leads, filter, search, isTodayLead, isNewLead]);

  // Pagination: 50 per page. Reset to page 0 whenever the filter or search
  // changes so we don't show an empty page after narrowing the list.
  const PAGE_SIZE = 50;
  useEffect(() => { setPage(0); }, [filter, search]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, visible.length);
  const pageSlice = visible.slice(pageStart, pageEnd);

  const selLead = useMemo(() => leads.find(l => l.id === selId) || null, [leads, selId]);
  const selActivity = useMemo(
    () => (selId ? (activityByLead[selId] || []) : []),
    [selId, activityByLead],
  );

  // Fresh count excludes backlog leads too (same rule as the Fresh filter).
  const freshCount   = useMemo(() => leads.filter(l => l.stage === 'Fresh' && !l.imported).length, [leads]);
  const stageCount   = useCallback((s: Stage) => leads.filter(l => l.stage === s).length, [leads]);
  const todayCount   = useMemo(() => leads.filter(isTodayLead).length, [leads, isTodayLead]);
  const newCount     = useMemo(() => leads.filter(isNewLead).length, [leads, isNewLead]);
  const backlogCount = useMemo(() => leads.filter(l => l.imported).length, [leads]);
  const convPct = leads.length ? Math.round((stageCount('Converted') / leads.length) * 100) : 0;

  // ── keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === 'Escape' && capture) { setCapture(null); return; }
      const idx = visible.findIndex(l => l.id === selId);
      if ((e.key === 'j' || e.key === 'J') && visible.length) {
        setSelId(visible[Math.min(idx + 1, visible.length - 1)].id);
        setWaMode(null); setCapture(null); setShowUniSel(false);
      }
      if ((e.key === 'k' || e.key === 'K') && visible.length) {
        setSelId(visible[Math.max(idx - 1, 0)].id);
        setWaMode(null); setCapture(null); setShowUniSel(false);
      }
      const map: Record<string, OutcomeKey> = {
        '1': 'Interested', '2': 'Follow-up', '3': 'No answer', '4': 'Callback', '5': 'Not interested',
      };
      if (map[e.key] && selLead && selLead.stage !== 'Converted' && selLead.stage !== 'Not interested') {
        setCapture(prev => prev === map[e.key] ? null : map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, selId, capture, selLead]);

  // ── mutations ──────────────────────────────────────────────────────────
  const patchLead = useCallback((lead: Lead) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
  }, []);
  const appendActivity = useCallback((a: Activity) => {
    setActivityByLead(prev => ({ ...prev, [a.lead_id]: [...(prev[a.lead_id] || []), a] }));
  }, []);

  const advanceAfterSave = useCallback(() => {
    if (!selId) return;
    const idx = visible.findIndex(l => l.id === selId);
    const next = visible[idx + 1] || visible[idx - 1];
    if (next) setSelId(next.id);
  }, [visible, selId]);

  const doQuickSched = (chip: 'tomorrow' | 'in3' | 'nextweek' | 'nextsession' | 'none') => {
    if (!selLead) return;
    startTransition(async () => {
      const r = await quickSchedule({ leadId: selLead.id, chip });
      if (r.ok) { patchLead(r.lead); showToast('Schedule updated'); }
      else showToast(`Save failed: ${r.error}`);
    });
  };
  const doSetNext = (date: string | null, time: string | null) => {
    if (!selLead) return;
    startTransition(async () => {
      const r = await setNextCall({ leadId: selLead.id, date, time });
      if (r.ok) patchLead(r.lead);
      else showToast(`Save failed: ${r.error}`);
    });
  };
  const doUpdateFields = (patch: Partial<Lead>) => {
    if (!selLead) return;
    startTransition(async () => {
      const r = await updateLeadFields({ leadId: selLead.id, patch: patch as Parameters<typeof updateLeadFields>[0]['patch'] });
      if (r.ok) patchLead(r.lead);
      else showToast(`Save failed: ${r.error}`);
    });
  };
  const doSaveCapture = (form: { note: string; reason: string | null; date: string | null; time: string | null }) => {
    if (!selLead || !capture) return;
    const outcome = capture;
    const advance = !OUT[outcome].noAdvance;
    startTransition(async () => {
      const r = await saveOutcome({
        leadId: selLead.id, outcome, note: form.note, reason: form.reason, date: form.date, time: form.time,
      });
      if (r.ok) {
        patchLead(r.lead);
        appendActivity(r.activity);
        setCapture(null);
        showToast(`${selLead.name} · saved`);
        if (advance) advanceAfterSave();
      } else {
        showToast(`Save failed: ${r.error}`);
      }
    });
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="top">
        <div className="brand"><span className="mk">e</span>Leads CRM</div>
        <span className="total num">{leads.length} leads · {convPct}% converted</span>
        <div className="search">
          {iSearch}
          <input
            ref={searchRef}
            placeholder="Search name or phone"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <span className="secure">{iLock} Secure · Rishi</span>
        <button
          className="logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out and clear session"
        >
          {loggingOut ? 'Signing out…' : 'Log out'}
        </button>
      </div>

      <div className="tabs">
        <TabBtn label="New"            count={newCount}                  on={filter==='new'}           onClick={()=>setFilter('new')} accent />
        <TabBtn label="Today"          count={todayCount}                on={filter==='today'}         onClick={()=>setFilter('today')} />
        <span className="tab-sep" aria-hidden />
        <TabBtn label="All"            count={leads.length}              on={filter==='all'}           onClick={()=>setFilter('all')} />
        <TabBtn label="Fresh"          count={freshCount}                on={filter==='Fresh'}         onClick={()=>setFilter('Fresh')} />
        <TabBtn label="Follow-up"      count={stageCount('Follow-up')}   on={filter==='Follow-up'}     onClick={()=>setFilter('Follow-up')} />
        <TabBtn label="Interested"     count={stageCount('Interested')}  on={filter==='Interested'}    onClick={()=>setFilter('Interested')} />
        <TabBtn label="Next session"   count={stageCount('Next session')}on={filter==='Next session'}  onClick={()=>setFilter('Next session')} />
        <TabBtn label="Converted"      count={stageCount('Converted')}   on={filter==='Converted'}     onClick={()=>setFilter('Converted')} />
        <TabBtn label="Not interested" count={stageCount('Not interested')} on={filter==='Not interested'} onClick={()=>setFilter('Not interested')} />
        <span className="tab-sep" aria-hidden />
        <TabBtn label="Backlog"        count={backlogCount}              on={filter==='backlog'}       onClick={()=>setFilter('backlog')} muted />
      </div>

      <div className="main">
        <div className="list">
          <div className="lhead">
            <div className="c-name">Name</div>
            <div className="c-prog">Program · University</div>
            <div className="c-stage">Stage</div>
            <div className="c-next">Next call</div>
          </div>

          {visible.length === 0 ? (
            <div className="empty">No leads here. Try another filter.</div>
          ) : (
            pageSlice.map(l => {
              const di = dueInfo(l);
              const nx = l.stage === 'Next session' ? 'Next yr' : di.t;
              const sel = l.id === selId;
              const isNew = isNewLead(l);
              return (
                <div
                  key={l.id}
                  className={`row${sel ? ' sel' : ''}`}
                  onClick={() => { setSelId(l.id); setWaMode(null); setCapture(null); setShowUniSel(false); }}
                >
                  <div className="c-name">
                    <span className="dot" style={{ background: DOT[l.stage] }} />
                    <div className="nm">
                      <div className="n1">
                        {l.name}
                        {isNew && <span className="new-badge" title="Created in the last 7 days">NEW</span>}
                      </div>
                      <div className="n2 num">{fmtPhone(l.phone)}</div>
                    </div>
                  </div>
                  <div className="c-prog">
                    {l.program ? `Online ${l.program}` : '—'}{l.university ? ` · ${l.university}` : ''}
                  </div>
                  <div className="c-stage">{l.stage}</div>
                  <div className={`c-next${di.over ? ' over' : ''}`}>{nx}</div>
                </div>
              );
            })
          )}

          <div className="pager">
            <span>
              {visible.length === 0
                ? '0 shown'
                : `${pageStart + 1}–${pageEnd} of ${visible.length}`}
              {' · '}
              {(filter === 'new' || filter === 'backlog') ? 'Sorted by most recent' : 'Sorted by next call'}
            </span>
            {totalPages > 1 && (
              <span className="page-nav">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >← Prev</button>
                <span className="page-of">Page {currentPage + 1} of {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  aria-label="Next page"
                >Next →</button>
              </span>
            )}
          </div>
        </div>

        <div className="detail">
          {!selLead ? (
            <div className="card"><div className="d-empty">Select a lead to see details.</div></div>
          ) : (
            <DetailPane
              key={selLead.id}
              lead={selLead}
              activity={selActivity}
              progUnis={selLead.program ? (progUnisIndex[selLead.program] || []) : []}
              waMode={waMode}
              setWaMode={setWaMode}
              capture={capture}
              setCapture={setCapture}
              showUniSel={showUniSel}
              setShowUniSel={setShowUniSel}
              onQuickSched={doQuickSched}
              onSetNext={doSetNext}
              onUpdateFields={doUpdateFields}
              onSaveCapture={doSaveCapture}
            />
          )}
        </div>
      </div>

      <div className="kb">
        <span><b>J</b> / <b>K</b> move</span>
        <span><b>1</b>–<b>5</b> log outcome</span>
        <span><b>/</b> search</span>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)',
          background: 'var(--text)', color: '#fff', padding: '11px 16px', borderRadius: 11,
          fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,.18)', zIndex: 50,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Detail pane ────────────────────────────────────────────────────────────
function DetailPane(props: {
  lead: Lead; activity: Activity[]; progUnis: ProgUni[];
  waMode: TplKey | null; setWaMode: (k: TplKey | null) => void;
  capture: OutcomeKey | null; setCapture: (k: OutcomeKey | null) => void;
  showUniSel: boolean; setShowUniSel: (b: boolean) => void;
  onQuickSched: (c: 'tomorrow'|'in3'|'nextweek'|'nextsession'|'none') => void;
  onSetNext: (date: string | null, time: string | null) => void;
  onUpdateFields: (patch: Partial<Lead>) => void;
  onSaveCapture: (f: { note: string; reason: string | null; date: string | null; time: string | null }) => void;
}) {
  const { lead: l, activity, progUnis, waMode, setWaMode, capture, setCapture, showUniSel, setShowUniSel } = props;
  const stageCls = l.stage === 'Interested' ? 'interested'
    : l.stage === 'Converted' ? 'converted'
    : l.stage === 'Next session' ? 'session' : '';
  const di = dueInfo(l);
  const tpl = templates(l);
  const canCall = l.stage !== 'Converted' && l.stage !== 'Not interested';
  const wa = waDigits(l.phone);
  const lastNote = [...activity].reverse().find(a => a.remark)?.remark || l.message;

  // Quick chip currently active
  const chipActive: string | null =
    l.stage === 'Next session' ? 'nextsession'
    : !l.next_call_date ? 'none'
    : (() => {
        const d = daysUntil(l.next_call_date);
        if (d === 1) return 'tomorrow';
        if (d === 3) return 'in3';
        if (d === 7) return 'nextweek';
        return null;
      })();

  return (
    <div className="card">
      <div className="d-top">
        <span className="dot" style={{ background: DOT[l.stage], width: 9, height: 9 }} />
        <span className="d-name">{l.name}</span>
        <span className={`d-stage ${stageCls}`}>{l.stage}</span>
        <span className="d-phone num">{fmtPhone(l.phone)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
        {iMail}<span>{l.email || '—'}</span>
        <span style={{ color: 'var(--text-3)' }}>·</span>
        {iPin}<span>{l.city || '—'}</span>
      </div>

      <div className="strip">
        {iSchool}
        <span>Online <b>{l.program || '—'}</b>{l.university ? <> · <b>{l.university}</b></> : null}</span>
        <button className="chg" onClick={() => setShowUniSel(!showUniSel)}>{iEdit} Change</button>
      </div>
      {showUniSel && l.program && (
        <div className={`unisel show`}>
          <select
            defaultValue={l.university || ''}
            onChange={e => { props.onUpdateFields({ university: e.target.value || null }); setShowUniSel(false); }}
          >
            <option value="">— unset —</option>
            {progUnis.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="ctx">
        {iHist}
        {lastNote
          ? <span>Last note: <b>{lastNote}</b></span>
          : <span style={{ color: 'var(--text-3)' }}>Fresh lead — no notes yet</span>}
      </div>

      <div className="lbl">
        UNIVERSITIES OFFERING ONLINE {(l.program || '').toUpperCase()} · FROM UGC/NIRF DATA
      </div>
      <div className="unis">
        {progUnis.length ? progUnis.map(u => (
          <span key={u.id} className={`uni${u.name === l.university ? ' match' : ''}`}>
            {u.abbr || u.name}{u.nirf != null ? ` #${u.nirf}` : ''}
          </span>
        )) : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>No data for this program yet</span>}
      </div>

      <div className="cta">
        <a
          className="btn-call"
          href={canCall ? `tel:+${wa}` : undefined}
          aria-disabled={!canCall}
        >{iPhone} Call now</a>
        <button className="btn-wa" onClick={() => setWaMode(waMode === null ? 'Welcome' : null)} title="WhatsApp">{iWa}</button>
      </div>

      <div className={`wa-box${waMode !== null ? ' show' : ''}`}>
        <div className="wt">
          {(Object.keys(tpl) as TplKey[]).map(k => (
            <span key={k} className={`wa-t${waMode === k ? ' on' : ''}`} onClick={() => setWaMode(k)}>{k}</span>
          ))}
        </div>
        <div className="wa-msg">{waMode ? tpl[waMode] : ''}</div>
        {waMode && (
          <a
            className="wa-send"
            href={`https://wa.me/${wa}?text=${encodeURIComponent(tpl[waMode])}`}
            target="_blank"
            rel="noreferrer noopener"
          >Send on WhatsApp →</a>
        )}
      </div>

      <div className="sched-wrap">
        <div className="lbl">NEXT CALL SCHEDULED</div>
        <div className="next">{iCal}<span><b>{di.t}</b>{di.sub ? ` · ${di.sub}` : ''}</span></div>
        <div className="sched">
          <span className="s-lbl">Quick:</span>
          <button className={`schip${chipActive==='tomorrow'?' on':''}`}     onClick={() => props.onQuickSched('tomorrow')}>Tomorrow</button>
          <button className={`schip${chipActive==='in3'?' on':''}`}          onClick={() => props.onQuickSched('in3')}>In 3 days</button>
          <button className={`schip${chipActive==='nextweek'?' on':''}`}     onClick={() => props.onQuickSched('nextweek')}>Next week</button>
          <button className={`schip session${chipActive==='nextsession'?' on':''}`} onClick={() => props.onQuickSched('nextsession')}>Next session</button>
          <button className={`schip${chipActive==='none'?' on':''}`}         onClick={() => props.onQuickSched('none')}>No follow-up</button>
        </div>
        <div className="pick">
          <span className="s-lbl">Or pick exact:</span>
          <input
            type="date"
            min={todayISO()}
            value={l.next_call_date || ''}
            onChange={e => props.onSetNext(e.target.value || null, l.next_call_time)}
          />
          <input
            type="time"
            value={l.next_call_time || ''}
            onChange={e => props.onSetNext(l.next_call_date, e.target.value || null)}
          />
        </div>
      </div>

      <div className="logbox">
        <div className="grp-lbl">AFTER THE CALL — PICK WHAT HAPPENED</div>
        <div className="grp-lbl" style={{ color: 'var(--text-2)', marginBottom: 6 }}>Couldn't reach</div>
        <div className="chips">
          {(['No answer','Busy','Callback'] as OutcomeKey[]).map(k => (
            <button key={k} className={`chip${capture===k?' on':''}`} onClick={() => setCapture(capture===k?null:k)}>{k}</button>
          ))}
        </div>
        <div className="grp-lbl" style={{ color: 'var(--text-2)', marginBottom: 6 }}>Talked to them — set status</div>
        <div className="chips">
          <button className={`chip good${capture==='Interested'?' on':''}`}       onClick={() => setCapture(capture==='Interested'?null:'Interested')}>Interested</button>
          <button className={`chip${capture==='Follow-up'?' on':''}`}             onClick={() => setCapture(capture==='Follow-up'?null:'Follow-up')}>Follow-up</button>
          <button className={`chip session${capture==='Next session'?' on':''}`}  onClick={() => setCapture(capture==='Next session'?null:'Next session')}>Next session</button>
          <button className={`chip good${capture==='Converted'?' on':''}`}        onClick={() => setCapture(capture==='Converted'?null:'Converted')}>Converted ✓</button>
          <button className={`chip bad${capture==='Not interested'?' on':''}`}    onClick={() => setCapture(capture==='Not interested'?null:'Not interested')}>Not interested</button>
        </div>
        <button className="addnote" onClick={() => setCapture(capture==='Add note'?null:'Add note')}>{iPlus} Add a note without a call</button>
        {capture && <CaptureForm lead={l} outcome={capture} onSave={props.onSaveCapture} onCancel={() => setCapture(null)} />}
      </div>

      <div className="hist-h">
        <div className="lbl">ACTIVITY LOG</div>
        {activity.length === 0
          ? <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Nothing logged yet.</div>
          : activity.map(a => {
              const isNote = a.type === 'note';
              const ok = a.outcome && ['Interested','Converted','Follow-up'].includes(a.outcome);
              const bad = a.outcome === 'Not interested';
              const blue = a.outcome === 'Next session';
              const cl = isNote ? 'n' : ok ? 'g' : bad ? 'r' : blue ? 'b' : 'm';
              const icon = isNote ? iNote : ok ? iOk : bad ? iNo : blue ? iClock : iOff;
              const head = isNote ? 'Remark' : (a.outcome || 'Call');
              return (
                <div key={a.id} className="hist">
                  <span className={cl}>{icon}</span>
                  <div className="body">
                    <span className="meta">
                      {fmtNice(a.occurred_on)}{a.occurred_time ? ` · ${fmtTime(a.occurred_time)}` : ''}
                    </span>
                    {' · '}<b>{head}</b>
                    {a.remark ? <> — <span className="txt">{a.remark}</span></> : null}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ── Capture form (per-outcome) ─────────────────────────────────────────────
function CaptureForm({ lead, outcome, onSave, onCancel }: {
  lead: Lead; outcome: OutcomeKey;
  onSave: (f: { note: string; reason: string | null; date: string | null; time: string | null }) => void;
  onCancel: () => void;
}) {
  const o = OUT[outcome];
  const defDate =
    o.intake ? '2027-01-15'
    : o.none ? ''
    : o.keepSched ? (lead.next_call_date || '')
    : addDaysISO(o.defDays ?? 1);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<string>(NI_REASONS[0]);
  const [date, setDate] = useState<string>(defDate);
  const [time, setTime] = useState<string>(o.timeField ? (lead.next_call_time || '') : '');
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { noteRef.current?.focus(); }, []);

  const dotColor = o.chipCls === 'session' ? 'var(--blue)'
    : o.chipCls === 'bad' ? 'var(--red)'
    : o.chipCls === 'good' ? 'var(--accent)'
    : 'var(--text-3)';
  const saveLbl = o.noAdvance ? 'Save note' : 'Save & next lead';

  return (
    <div className="capture">
      <div className="cap-title">
        <span className="dot" style={{ width: 8, height: 8, background: dotColor }} />
        {outcome === 'Add note' ? 'Add a note' : outcome}
      </div>

      {o.reason && (
        <div className="cap-field">
          <label>REASON</label>
          <select value={reason} onChange={e => setReason(e.target.value)}>
            {NI_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}

      <div className="cap-field">
        <label>{o.noteLbl.toUpperCase()}</label>
        <textarea ref={noteRef} placeholder={o.place} value={note} onChange={e => setNote(e.target.value)} />
      </div>

      {o.intake ? (
        <div className="cap-field">
          <label>NEXT INTAKE DATE</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      ) : !o.none ? (
        <div className="cap-field">
          <label>{o.keepSched ? 'NEXT CALL (optional)' : 'NEXT CALL SCHEDULED'}</label>
          <div className="cap-dt">
            <input type="date" min={todayISO()} value={date} onChange={e => setDate(e.target.value)} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>
      ) : null}

      <div className="cap-actions">
        <button
          className="cap-save"
          onClick={() => onSave({
            note,
            reason: o.reason ? reason : null,
            date: date || null,
            time: time || null,
          })}
        >{saveLbl}</button>
        <button className="cap-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function TabBtn({ label, count, on, onClick, accent, muted }: { label: string; count: number; on: boolean; onClick: () => void; accent?: boolean; muted?: boolean }) {
  return (
    <button className={`tab${on ? ' on' : ''}${accent ? ' tab-accent' : ''}${muted ? ' tab-muted' : ''}`} onClick={onClick} style={{ background: 'transparent', border: 'none', font: 'inherit' }}>
      {label} <span className="c num">· {count}</span>
    </button>
  );
}
