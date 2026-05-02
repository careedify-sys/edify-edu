const ANON_COOKIE_NAME = 'edify_anon_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getOrCreateAnonId(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`${ANON_COOKIE_NAME}=([^;]+)`));
  if (match) return match[1];
  const newId = (crypto.randomUUID && crypto.randomUUID()) ||
                Math.random().toString(36).slice(2) + Date.now().toString(36);
  document.cookie = `${ANON_COOKIE_NAME}=${newId}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax`;
  return newId;
}
