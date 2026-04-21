// lib/data/page-content.ts
// Server-only helper — reads pre-built JSON at build time (SSG compatible)
import fs from 'fs'
import path from 'path'
import type { PageContent, SpecPageContent } from './page-content-schema'

const cache = new Map<string, PageContent | null>()
const specCache = new Map<string, SpecPageContent | null>()

export function getPageContent(uniSlug: string, program: string): PageContent | null {
  const key = `${uniSlug}-${program.toLowerCase()}`
  if (cache.has(key)) return cache.get(key)!

  const filePath = path.join(process.cwd(), 'lib', 'data', 'page-content', `${key}.json`)
  if (!fs.existsSync(filePath)) {
    cache.set(key, null)
    return null
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const content = JSON.parse(raw) as PageContent
    cache.set(key, content)
    return content
  } catch {
    cache.set(key, null)
    return null
  }
}

export function getSpecPageContent(
  uniSlug: string,
  program: string,
  specSlug: string
): SpecPageContent | null {
  const key = `${uniSlug}-${program.toLowerCase()}-${specSlug}`
  if (specCache.has(key)) return specCache.get(key)!

  const filePath = path.join(process.cwd(), 'lib', 'data', 'page-content', `${key}.json`)
  if (!fs.existsSync(filePath)) {
    specCache.set(key, null)
    return null
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const content = JSON.parse(raw) as SpecPageContent
    specCache.set(key, content)
    return content
  } catch {
    specCache.set(key, null)
    return null
  }
}
