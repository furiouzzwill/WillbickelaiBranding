import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { clientEnv } from "@/lib/env";

/**
 * Supabase client for server components, route handlers, and server actions.
 *
 * Must be created per request — never hoisted to a module-level singleton,
 * which would leak one user's session into another user's request.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const env = clientEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server components cannot set cookies. This is expected and safe:
            // middleware refreshes the session on every request, so the write
            // that matters happens there.
          }
        },
      },
    },
  );
}
