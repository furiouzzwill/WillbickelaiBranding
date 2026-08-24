import { Sparkles } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { siteConfig } from "@/config/site";

export type AppShellProps = {
  displayName: string;
  email: string;
  children: React.ReactNode;
};

/**
 * Authenticated application frame.
 *
 * The sidebar is fixed on large screens and collapses to a horizontal bar on
 * small ones — enough responsive behaviour for the shell without pulling in a
 * drawer before there is navigation depth to justify it.
 */
export function AppShell({ displayName, email, children }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-[var(--border)] bg-[var(--surface)] lg:h-svh lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Sparkles
              className="size-4 text-[var(--primary-foreground)]"
              aria-hidden
            />
          </span>
          <Link href="/dashboard" className="rounded font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
        </div>

        <div className="flex-1 px-3 pb-3 lg:overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="hidden lg:block">
          <UserMenu displayName={displayName} email={email} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <div className="lg:hidden">
          <UserMenu displayName={displayName} email={email} />
        </div>
      </div>
    </div>
  );
}
