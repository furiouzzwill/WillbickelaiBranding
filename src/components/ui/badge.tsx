import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--surface-elevated)] text-muted-foreground",
        brand:
          "border-transparent bg-[var(--primary-subtle)] text-[var(--primary)]",
        success: "border-transparent bg-[var(--success)]/15 text-[var(--success)]",
        warning: "border-transparent bg-[var(--warning)]/15 text-[var(--warning)]",
        danger: "border-transparent bg-[var(--danger-subtle)] text-[var(--danger)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
