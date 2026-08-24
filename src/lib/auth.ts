import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * The signed-in user, or null.
 *
 * Uses `getUser()` rather than `getSession()`: `getUser()` revalidates the JWT
 * against the Supabase auth server, whereas `getSession()` trusts the cookie
 * payload as-is. Only the former is safe to authorise against on the server.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * The signed-in user, or a redirect to sign-in.
 *
 * This is the authoritative application-level check. Middleware redirects are
 * for UX; authorisation lives here and in Row Level Security.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Display name for a user, falling back through metadata to the email local part. */
export function displayNameFor(user: User): string {
  const metadata = user.user_metadata as
    | { display_name?: unknown; full_name?: unknown }
    | undefined;

  const candidate =
    typeof metadata?.display_name === "string" ? metadata.display_name : undefined;
  const fullName =
    typeof metadata?.full_name === "string" ? metadata.full_name : undefined;

  return (
    candidate?.trim() ||
    fullName?.trim() ||
    user.email?.split("@")[0] ||
    "there"
  );
}
