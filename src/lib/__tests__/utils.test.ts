import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("lets a later conflicting Tailwind utility win", () => {
    // This is the whole reason for tailwind-merge: a caller's className must
    // override a component's default rather than depending on CSS order.
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, undefined, null, "py-1")).toBe("px-2 py-1");
  });

  it("supports conditional objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
