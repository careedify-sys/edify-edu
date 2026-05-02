'use client';
import { useEffect } from 'react';
import { getOrCreateAnonId } from '@/lib/anon-session';

export function TrackPageView({ universityId }: { universityId: string; universitySlug: string }) {
  useEffect(() => {
    const anonId = getOrCreateAnonId();
    fetch('/api/verify/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        university_id: universityId,
        anon_session_id: anonId,
        source: document.referrer.includes('/compare') ? 'compare' : 'search',
        referrer_url: document.referrer || null,
      }),
    }).catch(() => {});
  }, [universityId]);

  return null;
}
