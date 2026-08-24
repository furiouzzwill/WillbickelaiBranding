import { LogOut } from "lucide-react";

import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export type UserMenuProps = {
  displayName: string;
  email: string;
};

export function UserMenu({ displayName, email }: UserMenuProps) {
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3 border-t border-[var(--border)] px-3 py-3">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-subtle)] text-xs font-semibold text-[var(--primary)]"
      >
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
        <p className="truncate text-xs text-[var(--subtle-foreground)]">{email}</p>
      </div>

      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut aria-hidden />
        </Button>
      </form>
    </div>
  );
}
