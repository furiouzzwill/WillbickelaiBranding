import { Sparkles } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-brand-glow flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5 rounded-lg"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Sparkles className="size-4.5 text-[var(--primary-foreground)]" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        {children}

        <p className="mt-8 text-center text-xs text-[var(--subtle-foreground)]">
          {siteConfig.tagline}
        </p>
      </div>
    </div>
  );
}
