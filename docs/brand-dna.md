# Brand DNA

Brand DNA is the compiled, machine-readable representation of a brand's identity. It is the
single object every generation workflow reads from.

## Why it exists

A brand is edited across five relational tables (`brands`, `brand_colors`, `brand_fonts`,
`brand_socials`, plus the primary logo in `assets`). Generation needs all of it, on every
call, in one shot.

Brand DNA is a **compiled read model**: recomputed and written to `brands.brand_dna`
whenever any part of the identity changes. Two consequences matter:

1. **One query per generation.** No five-way join on a hot path.
2. **Reproducibility.** A `generations` row stores the DNA snapshot it used, so a past
   generation stays explainable after the brand is later edited.

The relational tables are the *editing surface*. The JSONB is the *read model*. They are
never edited independently.

## Shape

```jsonc
{
  "version": 1,
  "name": "NightShift Gaming",
  "type": "streamer",
  "description": "Late-night gaming and technology creator.",
  "audience": "Gamers ages 18-35",

  "personality": ["futuristic", "premium", "energetic"],

  "colors": {
    "primary":    "#A855F7",
    "secondary":  "#D946EF",
    "accent":     "#22D3EE",
    "background": "#09090B",
    "text":       "#FFFFFF"
  },

  "typography": {
    "heading": "Space Grotesk",
    "body":    "Inter",
    "accent":  "Orbitron"
  },

  "visualStyle": {
    "canvas":      "dark",        // dark | light
    "detail":      "minimal",     // minimal | detailed
    "dimension":   "dimensional", // flat | dimensional
    "texture":     "clean",       // clean | textured
    "era":         "modern",      // modern | retro
    "tone":        "expressive",  // corporate | expressive
    "style":       "futuristic tech",
    "description": "Dark futuristic tech aesthetic with purple neon accents and thin geometric lines."
  },

  "motionStyle": {
    "energy":     "high",    // low | medium | high
    "speed":      "fast",    // slow | medium | fast
    "intensity":  0.8,       // 0..1
    "style":      ["smooth", "technical", "neon"],
    "transition": "wipe",
    "easing":     "sharp"    // gentle | smooth | sharp | bouncy
  },

  "rules": {
    "prefer": ["thin neon borders", "minimal text", "geometric layouts"],
    "avoid":  ["cartoon illustrations", "large logos", "excessive particles"]
  },

  "logo": {
    "assetId":      "uuid",
    "url":          "https://...",
    "hasTransparency": true
  },

  "compiledAt": "2026-08-24T00:00:00.000Z"
}
```

`version` exists so the compiler can migrate older snapshots when the shape changes, rather
than breaking on them.

## Field notes

**`type`** — creator/business type (`streamer`, `youtuber`, `tiktok`, `podcaster`,
`gaming`, `business`, `personal`, …). Stored as an open string with a curated UI list, so
new types are added without a migration.

**`personality`** — multiple descriptors, order-significant: the first is weighted most
heavily in prompt construction.

**`colors`** — hex values, validated `^#[0-9A-Fa-f]{6}$`. `primary`, `background`, and
`text` are required; `secondary` and `accent` are optional.

**`visualStyle`** — the discrete axes are enums so they can be mapped deterministically to
prompt fragments and CSS. `description` is the free-text field, and it is treated as
*guidance*, never injected verbatim into a provider prompt.

**`motionStyle`** — drives HyperFrames timing. `intensity` scales animation distance and
overshoot; `speed` maps to duration multipliers; `easing` maps to a named GSAP curve.

**`rules`** — `prefer` becomes positive prompt weight and preset selection bias; `avoid`
becomes negative constraints and preset exclusion. Both are enforced at the *spec* level,
not just as prompt text, so "avoid excessive particles" can actually remove a particle
preset from the registry rather than politely asking a model not to use it.

## Lifecycle

```
Brand Builder wizard
        ↓  (per-step Zod validation)
Relational tables  (brands, brand_colors, brand_fonts, brand_socials, assets)
        ↓  compileBrandDna()
brands.brand_dna  (JSONB snapshot)
        ↓
Generation pipeline  →  snapshot copied into generations.input
```

Recompilation is triggered by any brand identity mutation. It is a pure function of the
relational rows — never hand-edited — so it can always be safely regenerated.

## Consumers

| Consumer | Uses |
| --- | --- |
| Image prompt builder | colors, personality, visual style, rules, type, audience |
| HyperFrames design config | colors, typography, visual style, logo |
| Motion spec builder | motion style, rules, personality |
| UI brand previews | colors, typography, logo |
