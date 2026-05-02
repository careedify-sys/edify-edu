'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { brand } from '@/lib/brand';
import { track } from '@/lib/tracking';

type Uni = {
  slug: string; name: string; short_name: string | null;
  city: string | null; state: string | null;
  is_ioe: boolean; programme_count: number;
  brand_slug?: string | null;
  aliases?: string[] | null;
  university_type?: string | null;
};

type FilterValue = 'all' | 'deemed' | 'state-private' | 'state-public' | 'central' | 'ioe';

export function VerifySearch({ universities, compact = false }: { universities: Uni[]; compact?: boolean }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');

  const deduped = useMemo(() => {
    const seenBrands = new Set<string>();
    const result: Uni[] = [];
    for (const uni of universities) {
      if (uni.brand_slug) {
        if (seenBrands.has(uni.brand_slug)) continue;
        seenBrands.add(uni.brand_slug);
        result.push({ ...uni, slug: `${uni.brand_slug}-online` });
      } else {
        result.push(uni);
      }
    }
    return result;
  }, [universities]);

  const filtered = useMemo(() => {
    let list = deduped;

    // Apply type/IoE filter
    if (filter !== 'all') {
      list = list.filter(u => {
        const type = (u.university_type || '').toLowerCase();
        if (filter === 'deemed') return type.includes('deemed');
        if (filter === 'state-private') return type.includes('private') && !type.includes('deemed');
        if (filter === 'state-public') return (type.includes('state') && !type.includes('private')) || type.includes('public');
        if (filter === 'central') return type.includes('central');
        if (filter === 'ioe') return u.is_ioe;
        return true;
      });
    }

    // Apply search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(u => {
        const haystack = [
          u.name, u.short_name, u.state, u.city,
          ...(u.aliases || [])
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    return list;
  }, [query, filter, deduped]);

  const filterOptions: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'deemed', label: 'Deemed-to-be' },
    { value: 'state-private', label: 'State Private' },
    { value: 'state-public', label: 'State Public' },
    { value: 'central', label: 'Central' },
    { value: 'ioe', label: 'IoE only' },
  ];

  return (
    <>
      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            color: brand.goldMid, fontSize: 18,
          }}>⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) track.search(e.target.value);
            }}
            placeholder="Search any university — try Manipal, Symbiosis, Delhi"
            autoFocus
            style={{
              width: '100%', padding: '16px 18px 16px 48px', boxSizing: 'border-box',
              fontSize: 15, borderRadius: 14, border: `1.5px solid ${brand.creamBorder}`,
              background: brand.white, color: brand.textPrimary, outline: 'none',
              fontWeight: 400,
            }}
          />
        </div>
      </div>

      {compact && !query.trim() ? (
        <div style={{ marginTop: 12, fontSize: 13, color: brand.textMuted, textAlign: 'center' }}>
          Most searched: {' '}
          {['Manipal', 'Amity', 'NMIMS', 'LPU', 'Symbiosis'].map((name, i, arr) => (
            <span key={name}>
              <span style={{ color: brand.goldDeep, fontWeight: 500, cursor: 'pointer' }} onClick={() => setQuery(name)}>
                {name}
              </span>
              {i < arr.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>
      ) : null}

      {compact && query.trim() && (
        <>
          <div style={{ fontSize: 12, color: brand.textMuted, marginTop: 8, marginBottom: 10, paddingLeft: 4 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
            {filtered.slice(0, 6).map(uni => (
              <Link
                key={uni.slug}
                href={`/verify/${uni.slug}`}
                style={{
                  background: brand.cream, border: `1px solid ${brand.creamBorder}`,
                  borderRadius: 10, padding: '10px 14px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {uni.short_name || uni.name}
                  </div>
                  <div style={{ fontSize: 11, color: brand.textMuted, marginTop: 1 }}>
                    {uni.state && `${uni.state} · `}{uni.programme_count} programmes
                  </div>
                </div>
                <span style={{ color: brand.gold, fontSize: 14, flexShrink: 0 }}>›</span>
              </Link>
            ))}
            {filtered.length > 6 && (
              <div style={{ fontSize: 12, color: brand.goldMid, textAlign: 'center', padding: '6px 0', fontWeight: 500 }}>
                + {filtered.length - 6} more — scroll down to browse all
              </div>
            )}
          </div>
        </>
      )}

      {!compact && (
      <>
      {/* Filter chips */}
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11, color: brand.textMuted, alignSelf: 'center', marginRight: 4 }}>
          Browse by:
        </span>
        {filterOptions.map(opt => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: active ? brand.cream : brand.textBody,
                background: active ? brand.navy : brand.white,
                border: `1px solid ${active ? brand.navy : brand.creamBorder}`,
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {query && (
        <div style={{ fontSize: 12, color: brand.textMuted, marginBottom: 14, paddingLeft: 4 }}>
          {filtered.length} of {deduped.length} universities matching &quot;{query}&quot;
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center', color: brand.textMuted,
          fontSize: 14, background: brand.cream, borderRadius: 12,
        }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: brand.textPrimary, marginBottom: 6 }}>
            No universities match
          </div>
          <div style={{ fontSize: 13, color: brand.textMuted }}>
            Try a shorter search or different filter.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gap: 8,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}>
          {filtered.map(uni => (
            <Link
              key={uni.slug}
              href={`/verify/${uni.slug}`}
              style={{
                background: brand.cream, border: `1px solid ${brand.creamBorder}`,
                borderRadius: 10, padding: '12px 14px', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                textDecoration: 'none', gap: 12, transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = brand.creamWarm;
                e.currentTarget.style.borderColor = brand.gold;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = brand.cream;
                e.currentTarget.style.borderColor = brand.creamBorder;
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {uni.short_name || uni.name}
                </div>
                <div style={{ fontSize: 11, color: brand.textMuted, marginTop: 2 }}>
                  {uni.state && `${uni.state} · `}{uni.programme_count} programmes
                </div>
              </div>
              {uni.is_ioe && (
                <span style={{
                  background: brand.creamWarm, color: brand.goldDeep,
                  fontSize: 9, padding: '2px 7px', borderRadius: 999, fontWeight: 500, flexShrink: 0,
                }}>IoE</span>
              )}
              <span style={{ color: brand.gold, fontSize: 14, flexShrink: 0 }}>›</span>
            </Link>
          ))}
        </div>
      )}
      </>
      )}
    </>
  );
}
