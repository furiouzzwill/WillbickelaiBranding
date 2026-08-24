import { NextResponse, type NextRequest } from "next/server";

import { createProxySupabaseClient } from "@/lib/supabase/proxy";

/** Routes that require a session. Prefix-matched. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/brands",
  "/create",
  "/projects",
  "/library",
];

/** Routes a signed-in user should not see. */
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

/**
 * Refreshes the Supabase session on every matched request and applies coarse
 * route redirects.
 *
 * Next.js 16 renamed the `middleware` convention to `proxy`; this is the same
 * request-boundary hook under its current name.
 *
 * This is a UX layer, not a security boundary — it makes signed-out users land
 * on sign-in instead of a flash of empty UI. Authorisation is enforced by
 * `requireUser()` in each protected route and by Row Level Security.
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createProxySupabaseClient(request);

  // Also refreshes an expired session and writes the new cookies onto `response`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!user && isProtected) {
    const url = new URL("/sign-in", request.url);
    // Preserve the destination so sign-in can return the user to it.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. Auth cookies are not
     * needed to serve a favicon, and running middleware on them wastes a
     * round trip per asset.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
