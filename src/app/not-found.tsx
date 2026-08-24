import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-sm font-medium text-[var(--primary)]">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        That page doesn&apos;t exist, or it hasn&apos;t been built yet.
      </p>
      <Link
        href="/"
        className={`${buttonVariants({ variant: "secondary" })} mt-6`}
      >
        Back to home
      </Link>
    </main>
  );
}
