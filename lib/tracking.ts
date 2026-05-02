import { getOrCreateAnonId } from './anon-session';

type EventPayload = {
  event_type: string;
  event_target?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(payload: EventPayload) {
  if (typeof window === 'undefined') return;
  const body = {
    ...payload,
    anon_session_id: getOrCreateAnonId(),
    page_path: window.location.pathname,
  };
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    navigator.sendBeacon('/api/events', blob);
    return;
  }
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {}
}

export const track = {
  pageView: (path?: string) =>
    trackEvent({ event_type: 'page_view', metadata: { path: path || window.location.pathname } }),
  ctaClick: (target: string, metadata?: Record<string, unknown>) =>
    trackEvent({ event_type: 'cta_click', event_target: target, metadata }),
  search: (query: string) =>
    trackEvent({ event_type: 'search', metadata: { query } }),
};
