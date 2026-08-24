import { NextResponse, type NextRequest } from "next/server";

import { resolveRedirect } from "@/lib/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Exchanges an email-confirmation or OAuth code for a session.
 *
 * Redirect targets are resolved against the request origin and forced to be
 * relative, so a crafted `next` parameter cannot turn this into an open
 * redirect to an attacker's domain.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = resolveRedirect(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing_code", origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/sign-in?error=invalid_code", origin),
    );
  }

  return NextResponse.redirect(new URL(next, origin));
}
