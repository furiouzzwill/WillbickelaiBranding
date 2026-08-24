import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "danger";

const styles: Record<AlertVariant, { wrapper: string; icon: React.ElementType }> = {
  info: {
    wrapper: "border-[var(--border)] bg-[var(--surface-elevated)] text-muted-foreground",
    icon: Info,
  },
  success: {
    wrapper: "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]",
    icon: CheckCircle2,
  },
  danger: {
    wrapper: "border-[var(--danger)]/30 bg-[var(--danger-subtle)] text-[var(--danger)]",
    icon: AlertCircle,
  },
};

export type AlertProps = React.ComponentProps<"div"> & {
  variant?: AlertVariant;
};

export function Alert({
  className,
  variant = "info",
  children,
  ...props
}: AlertProps) {
  const { wrapper, icon: Icon } = styles[variant];

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm",
        wrapper,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
