"use client";

import { useEffect } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary.
 *
 * Shows a generic message. `error.message` is deliberately not rendered:
 * server errors can carry internal detail, and Next.js already redacts it in
 * production — surfacing it here would only ever leak in development while
 * teaching users nothing useful.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page failed to load. Try again — if it keeps happening, the
          reference below helps us track it down.
        </p>

        {error.digest ? (
          <Alert className="mt-6 text-left">
            <span className="font-mono text-xs">Reference: {error.digest}</span>
          </Alert>
        ) : null}

        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
