// lib/data/first-hand/index.ts
// One file per university. Add a university by importing its file here.
import type { FirstHandUniversity } from './types'
import { AMITY_FIRST_HAND } from './amity-university-online'

const FIRST_HAND: Record<string, FirstHandUniversity> = {
  [AMITY_FIRST_HAND.universityId]: AMITY_FIRST_HAND,
}

/** Rishi's first-hand content for this university, or undefined when there is none. */
export function getFirstHand(universityId: string): FirstHandUniversity | undefined {
  return FIRST_HAND[universityId]
}

export function firstHandUniversityIds(): string[] {
  return Object.keys(FIRST_HAND)
}

export type { FirstHandUniversity, FirstHandApproval, FirstHandFaq } from './types'
