import { AppShell } from "@/components/layout/app-shell";
import { displayNameFor, requireUser } from "@/lib/auth";

/**
 * Authenticated route group.
 *
 * `requireUser()` here is the authoritative check for every route in the
 * group — middleware only handles the redirect UX.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <AppShell displayName={displayNameFor(user)} email={user.email ?? ""}>
      {children}
    </AppShell>
  );
}
