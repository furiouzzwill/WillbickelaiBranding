import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/lib/env";

/**
 * Supabase client bound to a proxy request/response pair.
 *
 * Returns the response alongside the client because refreshed auth cookies are
 * written onto it — the caller must return *this* response (or copy its
 * cookies) or the refreshed session is silently dropped.
 */
export function createProxySupabaseClient(request: NextRequest) {
  const response = NextResponse.next({ request });
  const env = clientEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  return { supabase, response };
}
