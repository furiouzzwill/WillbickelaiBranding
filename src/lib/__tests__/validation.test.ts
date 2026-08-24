import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "@/lib/validation/auth";

describe("signUpSchema", () => {
  const valid = {
    email: "creator@example.com",
    password: "a-strong-passphrase",
    displayName: "Alex Rivera",
  };

  it("accepts valid input", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("trims surrounding whitespace from email and name", () => {
    const parsed = signUpSchema.parse({
      ...valid,
      email: "  creator@example.com  ",
      displayName: "  Alex Rivera  ",
    });
    expect(parsed.email).toBe("creator@example.com");
    expect(parsed.displayName).toBe("Alex Rivera");
  });

  it("rejects a malformed email", () => {
    expect(signUpSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects a password under 8 characters", () => {
    expect(signUpSchema.safeParse({ ...valid, password: "short" }).success).toBe(
      false,
    );
  });

  it("rejects a password over bcrypt's 72-byte limit", () => {
    const parsed = signUpSchema.safeParse({ ...valid, password: "x".repeat(73) });
    expect(parsed.success).toBe(false);
  });

  it("rejects a whitespace-only display name", () => {
    expect(signUpSchema.safeParse({ ...valid, displayName: "   " }).success).toBe(
      false,
    );
  });
});

describe("signInSchema", () => {
  it("does not apply signup password rules, so existing passwords still work", () => {
    const parsed = signInSchema.safeParse({
      email: "creator@example.com",
      password: "old",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires a password to be present", () => {
    const parsed = signInSchema.safeParse({
      email: "creator@example.com",
      password: "",
    });
    expect(parsed.success).toBe(false);
  });
});
