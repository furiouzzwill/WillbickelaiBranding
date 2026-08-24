"use client";

import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";

/**
 * Supabase client for client components.
 *
 * Uses the anon key only — every query it makes is subject to Row Level
 * Security, so this key is safe in the browser by design.
 */
export function createBrowserSupabaseClient() {
  const env = clientEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
