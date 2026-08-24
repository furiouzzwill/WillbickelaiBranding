import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground",
        "placeholder:text-[var(--subtle-foreground)]",
        "transition-colors hover:border-[var(--border-strong)]",
        "focus-visible:border-[var(--primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-[var(--danger)]",
        className,
      )}
      {...props}
    />
  );
}
