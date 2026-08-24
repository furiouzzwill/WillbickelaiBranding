import { z } from "zod";

/**
 * Public environment access, validated once at first use.
 *
 * Only `NEXT_PUBLIC_*` values live here, so this module is safe to import from
 * anywhere. Secrets live in `env.server.ts`, which is marked `server-only` —
 * the boundary is a build error, not a convention.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is required")
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
});

export type ClientEnv = z.infer<typeof clientSchema>;

export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time only when each
 * variable is referenced as a full static literal, so they cannot be read
 * dynamically here.
 */
function readClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    throw new Error(
      "Invalid public environment configuration.\n" +
        `${formatIssues(parsed.error)}\n` +
        "Copy .env.example to .env.local and fill in the values.",
    );
  }

  return parsed.data;
}

let cachedClientEnv: ClientEnv | undefined;

/** Public configuration. Safe in both server and client components. */
export function clientEnv(): ClientEnv {
  cachedClientEnv ??= readClientEnv();
  return cachedClientEnv;
}

/** Reset cached values. Test-only. */
export function __resetClientEnvCache(): void {
  cachedClientEnv = undefined;
}
