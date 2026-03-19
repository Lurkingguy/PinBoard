// lib/supabase.ts
// This file sets up the Supabase client for use throughout the app.
// We create two clients:
// 1. A browser client for use in Client Components
// 2. A server client for use in Server Components and API routes

import { createBrowserClient } from '@supabase/ssr'

// Browser client — used in 'use client' components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
