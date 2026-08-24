import "server-only";

import { z } from "zod";

import { formatIssues } from "@/lib/env";

/**
 * Server-only environment access.
 *
 * The `server-only` import makes this a *build* error if anything in a client
 * bundle reaches it, so the secret boundary is enforced by the compiler rather
 * than by a runtime check that only fires once the key has already shipped.
 *
 * Variables a later phase requires are optional today, so the app boots with
 * only the two public Supabase values configured.
 */

const serverSchema = z.object({
  // Required from Phase 4.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Required from Phase 5.
  OPENAI_API_KEY: z.string().min(1).optional(),
  // Verified against official OpenAI docs. Overridable so the model name is
  // never a stale hardcoded string.
  OPENAI_IMAGE_MODEL: z.string().min(1).default("gpt-image-2"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (!cachedServerEnv) {
    const parsed = serverSchema.safeParse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_IMAGE_MODEL: process.env.OPENAI_IMAGE_MODEL,
    });

    if (!parsed.success) {
      throw new Error(
        `Invalid server environment configuration.\n${formatIssues(parsed.error)}`,
      );
    }

    cachedServerEnv = parsed.data;
  }

  return cachedServerEnv;
}

/**
 * Whether an optional, phase-gated integration is configured. Lets the UI show
 * an honest "not configured" state instead of failing at call time.
 */
export function isConfigured(feature: "storage" | "imageGeneration"): boolean {
  const env = serverEnv();
  switch (feature) {
    case "storage":
      return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
    case "imageGeneration":
      return Boolean(env.OPENAI_API_KEY);
  }
}

/** Reset cached values. Test-only. */
export function __resetServerEnvCache(): void {
  cachedServerEnv = undefined;
}
