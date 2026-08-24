import { describe, expect, it } from "vitest";

import {
  DEFAULT_REDIRECT,
  resolveRedirect,
  safeRelativePath,
} from "@/lib/redirects";

describe("safeRelativePath", () => {
  it("accepts a same-origin relative path", () => {
    expect(safeRelativePath("/dashboard")).toBe("/dashboard");
    expect(safeRelativePath("/brands/abc?tab=identity")).toBe(
      "/brands/abc?tab=identity",
    );
  });

  it("rejects an absolute URL", () => {
    expect(safeRelativePath("https://evil.example.com")).toBeUndefined();
    expect(safeRelativePath("http://evil.example.com")).toBeUndefined();
  });

  it("rejects a protocol-relative URL", () => {
    // "//evil.com" is a valid absolute URL to the browser, so it must not
    // pass a naive startsWith("/") check.
    expect(safeRelativePath("//evil.example.com")).toBeUndefined();
  });

  it("rejects backslash variants that some parsers normalise to //", () => {
    expect(safeRelativePath("/\\evil.example.com")).toBeUndefined();
    expect(safeRelativePath("/\\/evil.example.com")).toBeUndefined();
  });

  it("rejects a scheme-relative path that does not start with a slash", () => {
    expect(safeRelativePath("dashboard")).toBeUndefined();
    expect(safeRelativePath("javascript:alert(1)")).toBeUndefined();
  });

  it("rejects non-string input", () => {
    expect(safeRelativePath(undefined)).toBeUndefined();
    expect(safeRelativePath(null)).toBeUndefined();
    expect(safeRelativePath(["/dashboard"])).toBeUndefined();
  });
});

describe("resolveRedirect", () => {
  it("returns a safe path unchanged", () => {
    expect(resolveRedirect("/library")).toBe("/library");
  });

  it("falls back to the default for unsafe or absent input", () => {
    expect(resolveRedirect("//evil.example.com")).toBe(DEFAULT_REDIRECT);
    expect(resolveRedirect(undefined)).toBe(DEFAULT_REDIRECT);
  });
});
