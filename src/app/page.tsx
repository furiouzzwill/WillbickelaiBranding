import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getUser } from "@/lib/auth";

export default async function LandingPage() {
  // Signed-in users have no reason to see marketing copy.
  if (await getUser()) redirect("/dashboard");

  return (
    <main className="bg-brand-glow flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-[var(--primary)]" aria-hidden />
        For creators, streamers, and small businesses
      </span>

      <h1 className="text-gradient-brand max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        {siteConfig.tagline}
      </h1>

      <p className="mt-6 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
        Define your colours, typography, logo, and style once. Then generate
        logos, graphics, overlays, alerts, and animations that all look like you.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
          Get started
          <ArrowRight aria-hidden />
        </Link>
        <Link
          href="/sign-in"
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
