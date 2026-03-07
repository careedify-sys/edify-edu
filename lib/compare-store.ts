// lib/compare-store.ts
// Simple global compare state using localStorage so it persists across page navigations

export const MAX_COMPARE = 3

export function getCompareList(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('edify-compare') || '[]')
  } catch { return [] }
}

export function addToCompare(id: string): { success: boolean; message: string } {
  const list = getCompareList()
  if (list.includes(id)) return { success: false, message: 'Already added' }
  if (list.length >= MAX_COMPARE) return { success: false, message: `Max ${MAX_COMPARE} universities` }
  const updated = [...list, id]
  localStorage.setItem('edify-compare', JSON.stringify(updated))
  window.dispatchEvent(new Event('compare-updated'))
  return { success: true, message: 'Added to compare' }
}

export function removeFromCompare(id: string) {
  const updated = getCompareList().filter(x => x !== id)
  localStorage.setItem('edify-compare', JSON.stringify(updated))
  window.dispatchEvent(new Event('compare-updated'))
}

export function clearCompare() {
  localStorage.setItem('edify-compare', '[]')
  window.dispatchEvent(new Event('compare-updated'))
}

export function isInCompare(id: string): boolean {
  return getCompareList().includes(id)
}
