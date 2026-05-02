import { brand } from '@/lib/brand';

type Accreditation = {
  body: string; category: string | null; status: string;
  grade: string | null; score: number | null; rank: number | null;
  total_ranked: number | null; via_school: string | null;
  cycle: string | null; valid_till: string | null; notes: string | null;
};

export function ApprovalsCard({ accreditations, ugcStatus }: {
  accreditations: Accreditation[]; ugcStatus: string; ugcValidTill: string | null;
}) {
  const aicte = accreditations.find(a => a.body === 'AICTE');
  const naac = accreditations.find(a => a.body === 'NAAC');
  const aacsb = accreditations.find(a => a.body === 'AACSB');
  const nba = accreditations.find(a => a.body === 'NBA');

  const rows = [
    { title: 'UGC-DEB', statusText: ugcStatus === 'approved' ? 'Active' : 'Lapsed', desc: 'Mandatory for online programmes', icon: 'check' as const, variant: 'success' as const },
  ];

  if (aicte) rows.push({ title: 'AICTE', statusText: aicte.status === 'active' ? 'Active' : 'Lapsed', desc: 'Online MBA / MCA listed on register', icon: 'check' as const, variant: 'success' as const });

  if (naac) {
    const cgpa = naac.score ? `CGPA ${naac.score}` : '';
    const cycle = naac.cycle ? `Cycle ${naac.cycle}` : '';
    const validTill = naac.valid_till ? `valid till ${new Date(naac.valid_till).getFullYear()}` : '';
    const desc = [cycle, validTill].filter(Boolean).join(' · ') || 'Accredited by NAAC';
    rows.push({ title: 'NAAC', statusText: cgpa || 'Accredited', desc, icon: 'grade' as const, variant: 'warm' as const, grade: naac.grade } as any);
  }

  if (aacsb) rows.push({ title: 'AACSB', statusText: aacsb.via_school ? `via ${aacsb.via_school.split(',')[0].split(' ').slice(0, 4).join(' ')}` : 'Accredited', desc: 'Global B-school accreditation', icon: 'star' as const, variant: 'warm' as const } as any);

  if (nba) rows.push({ title: 'NBA', statusText: nba.score ? `${Math.round(nba.score)} courses` : 'Accredited', desc: nba.notes || 'Programme-level accreditation by NBA', icon: 'star' as const, variant: 'warm' as const } as any);

  if (rows.length === 0) return null;

  return (
    <div style={{ padding: '22px 20px', background: brand.cream }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>Approvals & accreditations</h2>
      </div>
      <div style={{ background: brand.white, border: `1px solid ${brand.creamBorder}`, borderRadius: 12, overflow: 'hidden' }}>
        {rows.map((r: any, i) => <ApprovalRow key={r.title} isLast={i === rows.length - 1} {...r} />)}
      </div>
    </div>
  );
}

function ApprovalRow({ isLast, icon, variant, title, grade, statusText, desc }: any) {
  const iconBg = variant === 'success' ? brand.successBg : brand.creamWarm;
  const iconColor = variant === 'success' ? brand.successAccent : brand.goldDeep;
  const statusColor = variant === 'success' ? brand.successAccent : brand.goldDeep;

  return (
    <div style={{
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : `1px solid ${brand.divider}`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon === 'check' && <span style={{ fontSize: 13, color: iconColor, fontWeight: 500 }}>✓</span>}
        {icon === 'grade' && <span style={{ fontSize: 11, color: iconColor, fontWeight: 500 }}>{grade}</span>}
        {icon === 'star' && <span style={{ fontSize: 13, color: iconColor, fontWeight: 500 }}>★</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>{title}</span>
          {statusText && <span style={{ fontSize: 11, color: statusColor, fontWeight: 500 }}>{statusText}</span>}
        </div>
        {desc && <div style={{ fontSize: 11, color: brand.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
    </div>
  );
}
