// lib/data-server.ts — Server-only data access
// This file can only be imported in Server Components, API routes, and layouts.
// Importing it in a 'use client' file will cause a build-time error.
import 'server-only'

// Re-export everything from the main data module
export * from './data'
