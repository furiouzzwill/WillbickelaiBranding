import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { __resetClientEnvCache, clientEnv } from "@/lib/env";
import {
  __resetServerEnvCache,
  isConfigured,
  serverEnv,
} from "@/lib/env.server";

const ORIGINAL_ENV = { ...process.env };

function resetCaches() {
  __resetClientEnvCache();
  __resetServerEnvCache();
}

function setEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

beforeEach(() => {
  resetCaches();
  setEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    NEXT_PUBLIC_APP_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    OPENAI_API_KEY: undefined,
    OPENAI_IMAGE_MODEL: undefined,
  });
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  resetCaches();
});

describe("clientEnv", () => {
  it("parses a valid public configuration", () => {
    const env = clientEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
  });

  it("defaults the app URL for local development", () => {
    expect(clientEnv().NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws a readable error when a required variable is missing", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: undefined });
    resetCaches();
    expect(() => clientEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("rejects a malformed Supabase URL rather than failing later at request time", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" });
    resetCaches();
    expect(() => clientEnv()).toThrow(/valid URL/);
  });
});

describe("serverEnv", () => {
  it("defaults the image model to the verified current model", () => {
    expect(serverEnv().OPENAI_IMAGE_MODEL).toBe("gpt-image-2");
  });

  it("allows the image model to be overridden without a code change", () => {
    setEnv({ OPENAI_IMAGE_MODEL: "gpt-image-3" });
    resetCaches();
    expect(serverEnv().OPENAI_IMAGE_MODEL).toBe("gpt-image-3");
  });

  it("treats phase-gated secrets as optional so earlier phases boot", () => {
    expect(() => serverEnv()).not.toThrow();
    expect(serverEnv().OPENAI_API_KEY).toBeUndefined();
  });
});

describe("isConfigured", () => {
  it("reports integrations as unconfigured when their secret is absent", () => {
    expect(isConfigured("imageGeneration")).toBe(false);
    expect(isConfigured("storage")).toBe(false);
  });

  it("reports an integration as configured once its secret is present", () => {
    setEnv({ OPENAI_API_KEY: "sk-test" });
    resetCaches();
    expect(isConfigured("imageGeneration")).toBe(true);
    expect(isConfigured("storage")).toBe(false);
  });
});
