import { createSupabaseServiceClient } from '@/lib/supabase/service';

export type ProgUni = {
  id: string;
  name: string;
  abbr: string;
  slug: string | null;
  naac: string | null;
  nirf: number | null;      // For MBA leads this is the Management rank when available.
  nirfLabel: string | null; // "Management" | "University" | etc.
};

// The CRM's program value → the exact category string used in
// public.programmes.category. Programmes lives in the existing Supabase
// schema, so we normalize the CRM's simpler labels to match.
const CATEGORY_ALIASES: Record<string, string[]> = {
  'MBA':   ['MBA'],
  'MCA':   ['MCA'],
  'BBA':   ['BBA'],
  'BCA':   ['BCA'],
  'BA':    ['BA'],
  'MA':    ['MA'],
  'BSc':   ['B.Sc'],
  'B.Sc':  ['B.Sc'],
  'MSc':   ['M.Sc'],
  'M.Sc':  ['M.Sc'],
  'BCom':  ['B.Com'],
  'B.Com': ['B.Com'],
  'MCom':  ['M.Com'],
  'M.Com': ['M.Com'],
};

// Programs to preload on every /leads render. Small enough that the whole
// index fits in one round-trip.
export const CRM_PROGRAMS: string[] = [
  'MBA', 'MCA', 'BBA', 'BCA', 'BA', 'MA', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com',
];

type EmbeddedRow = {
  category: string;
  universities: {
    id: string;
    name: string;
    slug: string | null;
    short_name: string | null;
    accreditations: {
      body: string;
      grade: string | null;
      rank: number | null;
      category: string | null;
    }[];
  } | null;
};

function pickNirf(
  program: string,
  accs: NonNullable<EmbeddedRow['universities']>['accreditations'],
): { rank: number | null; label: string | null } {
  const nirfRows = accs.filter(a => a.body === 'NIRF' && a.rank != null);
  if (nirfRows.length === 0) return { rank: null, label: null };
  // MBA leads care about Management rank first. Everyone else prefers
  // University rank; fall back to the lowest number if neither is tagged.
  const wantsMgt = program === 'MBA';
  const preferred = nirfRows.find(a =>
    (wantsMgt ? /management/i : /university|overall/i).test(a.category || ''),
  );
  if (preferred?.rank != null) {
    return { rank: preferred.rank, label: (preferred.category || (wantsMgt ? 'Management' : 'University')) };
  }
  const best = nirfRows.reduce((min, cur) => (cur.rank! < (min.rank ?? Infinity) ? cur : min), nirfRows[0]);
  return { rank: best.rank!, label: best.category || null };
}

function pickNaac(accs: NonNullable<EmbeddedRow['universities']>['accreditations']): string | null {
  const naac = accs.filter(a => a.body === 'NAAC' && a.grade);
  if (naac.length === 0) return null;
  // NAAC grade ordering: A++ > A+ > A > B++ > B+ > B > C > D
  const order = ['A++','A+','A','B++','B+','B','C','D'];
  return naac.sort((a, b) => order.indexOf(a.grade!) - order.indexOf(b.grade!))[0].grade;
}

// Build the CRM's program → universities index from Supabase (universities,
// programmes, accreditations). Returns { [crmProgram]: ProgUni[] }.
export async function buildProgUnisIndex(): Promise<Record<string, ProgUni[]>> {
  const sb = createSupabaseServiceClient();

  // Flatten all category aliases into a single distinct list for one query.
  const wantCategories = new Set<string>();
  for (const p of CRM_PROGRAMS) {
    for (const alias of (CATEGORY_ALIASES[p] || [p])) wantCategories.add(alias);
  }

  const { data, error } = await sb
    .from('programmes')
    .select('category,universities(id,name,slug,short_name,accreditations(body,grade,rank,category))')
    .in('category', Array.from(wantCategories));

  if (error) {
    console.error('program-lookup: Supabase query failed:', error.message);
    return {};
  }

  const rows = (data ?? []) as unknown as EmbeddedRow[];

  // For each CRM program, aggregate matching rows and dedupe by university id.
  const out: Record<string, ProgUni[]> = {};
  for (const crmProgram of CRM_PROGRAMS) {
    const aliases = new Set(CATEGORY_ALIASES[crmProgram] || [crmProgram]);
    const perUni = new Map<string, ProgUni>();
    for (const r of rows) {
      if (!r.universities || !aliases.has(r.category)) continue;
      const u = r.universities;
      if (perUni.has(u.id)) continue;
      const nirf = pickNirf(crmProgram, u.accreditations || []);
      perUni.set(u.id, {
        id: u.id,
        name: u.name,
        abbr: u.short_name || u.name,
        slug: u.slug,
        naac: pickNaac(u.accreditations || []),
        nirf: nirf.rank,
        nirfLabel: nirf.label,
      });
    }
    const arr = Array.from(perUni.values());
    arr.sort((a, b) => (a.nirf ?? 9999) - (b.nirf ?? 9999));
    out[crmProgram] = arr.slice(0, 12);
  }

  return out;
}
