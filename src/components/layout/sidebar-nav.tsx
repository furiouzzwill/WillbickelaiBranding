"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * Primary navigation.
 *
 * Sections whose phase has not shipped render as disabled "Soon" entries
 * rather than being hidden — the product surface stays legible without
 * pretending a route works.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {mainNav.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        const className = cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
            : "text-muted-foreground hover:bg-[var(--surface-hover)] hover:text-foreground",
          item.comingSoon && "cursor-not-allowed opacity-45 hover:bg-transparent",
        );

        if (item.comingSoon) {
          return (
            <span key={item.href} className={className} aria-disabled="true">
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{item.title}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={className}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
