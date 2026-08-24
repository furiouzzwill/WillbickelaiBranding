import { describe, expect, it } from "vitest";

import {
  creationCategories,
  creationTypes,
  creationTypesByCategory,
  findCreationType,
} from "@/config/creation-types";

describe("creation type registry", () => {
  it("has unique ids", () => {
    const ids = creationTypes.map((type) => type.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only references declared categories", () => {
    const known = new Set(Object.keys(creationCategories));
    for (const type of creationTypes) {
      expect(known.has(type.category)).toBe(true);
    }
  });

  it("uses valid aspect ratios", () => {
    for (const type of creationTypes) {
      expect(type.aspectRatio).toMatch(/^\d+:\d+$/);
    }
  });

  it("marks every type unavailable until its phase ships", () => {
    // Phase 1 ships no creation types. This guards against a type being
    // flipped to available before its generator actually exists.
    expect(creationTypes.every((type) => !type.available)).toBe(true);
  });

  it("filters by category", () => {
    const branding = creationTypesByCategory("branding");
    expect(branding.length).toBeGreaterThan(0);
    expect(branding.every((type) => type.category === "branding")).toBe(true);
  });

  it("finds a type by id and returns undefined for unknown ids", () => {
    expect(findCreationType("animated-logo-reveal")?.engine).toBe("motion");
    expect(findCreationType("does-not-exist")).toBeUndefined();
  });

  it("gives stream overlay assets an alpha channel", () => {
    // Overlays are composited over live video in OBS, so opaque output would
    // be unusable regardless of how good it looks.
    const overlays = ["webcam-overlay", "subscriber-alert", "lower-third"];
    for (const id of overlays) {
      expect(findCreationType(id)?.transparent).toBe(true);
    }
  });
});
