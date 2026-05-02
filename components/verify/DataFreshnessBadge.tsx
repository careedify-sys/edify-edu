import { brand } from '@/lib/brand';

export function DataFreshnessBadge({ updatedAt }: { updatedAt: string }) {
  const date = new Date(updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <div style={{ padding: '14px 20px', background: brand.cream, borderTop: `1px solid ${brand.creamBorder}` }}>
      <div style={{ fontSize: 10, color: brand.textMuted, lineHeight: 1.6, textAlign: 'center' }}>
        Last updated {date} · Sources: UGC, AICTE, NAAC, NIRF official portals
      </div>
    </div>
  );
}
