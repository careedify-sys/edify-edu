export function validateBody(body: unknown, maxBytes = 5000): { ok: true; body: any } | { ok: false; error: string; status: number } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid body', status: 400 }
  }
  const size = JSON.stringify(body).length
  if (size > maxBytes) {
    return { ok: false, error: 'Payload too large', status: 413 }
  }
  return { ok: true, body }
}
