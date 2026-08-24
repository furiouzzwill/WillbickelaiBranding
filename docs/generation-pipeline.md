# Generation Pipeline

## Principle

The pipeline never asks a model for runnable code and then runs it. It asks for a
**structured specification**, validates that specification against a schema, and renders it
with code we control.

```
Prompt → validated spec → controlled renderer → output
```

Raw prompting is the fallback for *concept* imagery only. Anything composited — layouts,
animations, alerts — goes through a spec.

## Stages

```
1. Request        User picks a creation type and writes a short description.
2. Brand Context  Load Brand DNA + approved assets + platform requirements.
3. Planning       Convert request + context into a structured spec.
4. Validation     Zod-validate the spec. Reject before spending money.
5. Generation     Dispatch to the image or motion engine.
6. Persistence    Store output, create asset + generation records.
```

Validation sits *before* generation on purpose: provider calls are the expensive step, so a
malformed spec must fail for free.

## Status Machine

```
queued → planning → generating → validating → rendering → completed
                                                        ↘ failed
```

Every transition is persisted. Users see a friendly per-state message; provider errors and
stack traces are stored in `generations.error` and never rendered raw. Failed jobs are
retryable — retries reuse the stored spec rather than re-planning, so a retry cannot
silently produce something different.

## Image Generation (Phase 5)

**Provider:** OpenAI Image API. **Model:** `gpt-image-2` — verified against the official
docs at implementation time and read from `OPENAI_IMAGE_MODEL` so it is never a stale
hardcoded string.

Relevant capabilities: arbitrary sizes (edges divisible by 16, aspect ratio within 3:1,
max edge 3840), `quality` of `low`/`medium`/`high`/`auto`, `png`/`jpeg`/`webp` output, and
`background: "transparent"` for PNG/WebP — which is what logo and overlay assets need.
Responses return **base64**, not a URL, so the server decodes and uploads to storage
directly.

### Endpoint

```
POST /api/generate/image
```

```jsonc
{
  "brandId": "uuid",
  "generationType": "logo",       // logo | background | pattern | banner | graphic
  "prompt": "Bold geometric wordmark, monogram lockup",
  "aspectRatio": "1:1"
}
```

Server sequence — the order is the security model:

1. Authenticate the user (`requireUser()`).
2. Verify the user owns `brandId`.
3. Rate-limit the caller.
4. Load Brand DNA.
5. Build a controlled prompt.
6. Call the provider.
7. Decode base64 → upload via `StorageService`.
8. Create `assets` + `generations` records.
9. Return the asset.

### Controlled prompt building

User text is **direction, not the prompt**. The builder composes a deterministic prompt from
Brand DNA — subject, personality, palette, visual style axes, and negative constraints from
`rules.avoid` — and inserts the user's direction as one bounded, length-capped section.

This keeps output on-brand, makes results reproducible, and means the user's text cannot
restructure the instruction. The builder is a pure function, so it is unit-tested against
fixed Brand DNA inputs with no network calls.

## Motion Generation (Phase 6)

```
Brand DNA → HyperFrames design config (DESIGN.md) → composition spec → composition → render
```

The motion specification is the contract:

```jsonc
{
  "assetType": "logo-reveal",
  "duration": 4,
  "canvas": { "width": 1920, "height": 1080, "transparent": true },
  "brandId": "uuid",
  "elements": [
    { "type": "logo",     "animation": "scale" },
    { "type": "text",     "value": "NEW SUBSCRIBER", "animation": "word-reveal" },
    { "type": "username", "value": "{{username}}",   "animation": "fade" }
  ],
  "entrance": "glitch",
  "exit": "fade"
}
```

Every `animation`, `entrance`, and `exit` value must resolve to a **registered preset**. An
unregistered name is a validation failure, not a best-effort guess — which is what makes it
safe to accept a model-authored spec.

### Preset registry

Presets are registered in categories — entrances, text animations, logo animations, exits,
transitions — and the registry is built for expansion. Only the presets the current phase
needs are implemented; the rest are added as creation types ship. `rules.avoid` can exclude
presets from selection entirely, so brand rules constrain the *spec*, not just prompt text.

## Cost and Usage

Every provider call writes a `generations` row regardless of outcome. Each row carries
enough metadata — provider, type, size, quality, duration — to compute credits later
without a schema change. Pricing is deliberately not encoded yet.
