// "[text](/path)" link markup used by the first-hand copy (lib/data/first-hand/).

/** Markup to plain text, for FAQPage schema and any text-only output. */
export function stripLinks(s: string): string {
  return s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
}
