// Same rule as mockEnabled() in actions.ts: mock data only outside production.
export function waMode(): 'mock' | 'live' {
  return process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production' ? 'mock' : 'live'
}
