'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { brand } from '@/lib/brand';
import { track } from '@/lib/tracking';

type Programme = {
  id: string; name: string; short_name: string | null; category: string | null;
  duration_years: number | null; ugc_valid_till: string | null; aicte_listed: boolean;
};

export function ProgrammeFinder({ universitySlug, programmes }: { universitySlug: string; programmes: Programme[] }) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return programmes;
    const q = query.toLowerCase();
    return programmes.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.short_name?.toLowerCase().includes(q)) ||
      (p.category?.toLowerCase().includes(q))
    );
  }, [query, programmes]);

  const visible = showAll ? filtered : filtered.slice(0, 3);
  const hidden = filtered.length - visible.length;

  return (
    <div style={{ padding: '0 20px 22px', background: brand.white }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 12px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>Find your programme</h2>
        <span style={{ fontSize: 11, color: brand.goldMid, fontWeight: 500 }}>{programmes.length} approved</span>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: brand.goldMid, fontSize: 14,
        }}>⌕</span>
        <input
          type="text" value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) track.search(e.target.value);
          }}
          placeholder="MBA, MCA, Banking…"
          style={{
            width: '100%', padding: '12px 14px 12px 38px', boxSizing: 'border-box',
            fontSize: 13, borderRadius: 10, border: `1px solid ${brand.creamBorder}`,
            background: brand.cream, color: brand.textPrimary,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visible.map(prog => <ProgrammeRow key={prog.id} programme={prog} universitySlug={universitySlug} />)}

        {hidden > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            style={{
              background: brand.cream, border: `1px solid ${brand.creamBorder}`,
              borderRadius: 10, padding: '11px 14px', cursor: 'pointer',
              fontSize: 12, color: brand.goldMid, fontWeight: 500,
            }}
          >+ {hidden} more programme{hidden > 1 ? 's' : ''}</button>
        )}

        {filtered.length === 0 && (
          <div style={{
            padding: 20, textAlign: 'center', color: brand.textMuted,
            fontSize: 13, background: brand.cream, borderRadius: 10,
          }}>No programmes match &quot;{query}&quot;. Try MBA, MCA, or BBA.</div>
        )}
      </div>
    </div>
  );
}

function ProgrammeRow({ programme, universitySlug }: { programme: Programme; universitySlug: string }) {
  const validTill = programme.ugc_valid_till
    ? new Date(programme.ugc_valid_till).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  return (
    <Link
      href={`/universities/${universitySlug}/programmes/${programme.id}`}
      onClick={() => track.ctaClick('programme_row', { programmeId: programme.id })}
      style={{
        background: brand.successBgSoft, border: `1px solid ${brand.successBorder}`,
        borderRadius: 10, padding: '12px 14px', display: 'flex',
        alignItems: 'center', gap: 12, textDecoration: 'none',
      }}
    >
      <div style={{
        width: 22, height: 22, background: brand.successAccent, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ color: brand.white, fontSize: 11, fontWeight: 500 }}>✓</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>{programme.name}</div>
        <div style={{ fontSize: 11, color: brand.successText, marginTop: 2 }}>
          {programme.duration_years && `${programme.duration_years} yrs · `}
          UGC{programme.aicte_listed && ' + AICTE'}
          {validTill && ` · valid till ${validTill}`}
        </div>
      </div>
      <span style={{ color: brand.successText, fontSize: 14 }}>›</span>
    </Link>
  );
}
