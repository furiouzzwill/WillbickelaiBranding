# HyperFrames Integration

HyperFrames is the motion/video engine: it renders HTML/CSS/JS compositions to video.
OpenAI handles static imagery; HyperFrames handles everything that moves.

Users never see the name "HyperFrames" in the product. They see **Create Animation**.

## Current status

**Not yet implemented — Phase 6.** The toolchain is now in place:

| Prerequisite | Status |
| --- | --- |
| HyperFrames CLI | ✅ `hyperframes@0.8.12` (Apache-2.0), via `npx` |
| Node.js | ✅ 22.22.2 — meets the CLI's `>= 22` requirement |
| HyperFrames skills | ✅ 20 installed, verified current |
| FFmpeg / FFprobe | ✅ 6.1.1 |
| Chrome Headless Shell | ✅ 152.0.7977.30 (required for local rendering) |

Optional and not needed for Phase 6: whisper-cpp (transcription), Kokoro (local TTS),
MusicGen (local BGM), a running Docker daemon (containerised rendering).

**Rule: do not improvise the framework API.** This document covers *our integration
design* and the *workflow*. Composition syntax, component names, and configuration format
must come from the installed skills or official HyperFrames documentation at implementation
time — not from memory and not from inference. Writing plausible-looking HyperFrames code
without that source would be a fabricated integration.

## Installing the toolchain

The CLI installs its own agent skills — they ship inside the npm package and are copied to
`~/.claude/skills` (and `~/.agents/skills`).

```bash
# Skills: installs the full published set
npx hyperframes skills

# Verify — exits non-zero if anything is stale or missing
npx hyperframes skills check

# FFmpeg (required for rendering)
apt-get update && apt-get install -y ffmpeg

# Chrome Headless Shell (required for local rendering)
npx hyperframes browser ensure

# Confirm the whole toolchain
npx hyperframes doctor
```

`npx hyperframes init` also refreshes the core skill set as a side effect. If the CLI is
unavailable, the fallback is `npx skills add heygen-com/hyperframes --all`.

**These install to the machine, not the repo.** In an ephemeral environment — a fresh
Claude Code web session, a CI runner — they must be reinstalled. A `SessionStart` hook is
the durable fix if that becomes a recurring cost.

### Installed skills

The core set is `hyperframes` (the mandatory entry point, which routes to the rest),
plus `hyperframes-core` (composition contract), `hyperframes-animation`,
`hyperframes-keyframes`, `hyperframes-creative`, `hyperframes-cli`,
`hyperframes-registry`, `hyperframes-audio`, and `media-use`.

`hyperframes-core` and `hyperframes-animation` are the ones Phase 6 depends on:
the composition contract and the motion primitives.

## Integration Design

```
Brand DNA
   ↓  compileHyperFramesDesign()
HyperFrames Design Config  (colors, typography, spacing, motion tokens)
   ↓
Composition Specification  (validated motion spec — see generation-pipeline.md)
   ↓  controlled renderer
HyperFrames Composition
   ↓  lint → inspect → preview → render
MP4 / WebM asset
```

### Design config generation

HyperFrames expects a defined visual identity *before* composition work. Since Brand DNA
already is that identity, the platform generates the equivalent of a `DESIGN.md`
automatically from it, per brand:

| Brand DNA | HyperFrames design config |
| --- | --- |
| `colors.*` | Colour tokens |
| `typography.heading` / `.body` / `.accent` | Type scale and families |
| `visualStyle.canvas` | Light or dark ground |
| `visualStyle.detail` / `.dimension` / `.texture` | Density, depth, and surface treatment |
| `motionStyle.speed` / `.intensity` / `.easing` | Duration multipliers, distances, easing curve |
| `rules.avoid` | Excluded presets and effects |

The user never writes or sees this file. It is a compilation artefact.

### Controlled rendering

The renderer maps a **validated motion specification** onto composition primitives. Model
output selects presets and content; it does not author executable code. An animation name
that is not in the preset registry fails validation before anything renders.

## Development Workflow

Validation is not optional. Each step catches a class of failure the next one cannot.

```
Build composition
      ↓
npx hyperframes lint       Catches syntax and configuration errors
      ↓
npx hyperframes inspect    Catches layout, overflow, and clipping problems
      ↓
npx hyperframes preview    Confirms motion actually reads correctly
      ↓
Fix issues
      ↓
npx hyperframes render     Only after the above pass
```

Rendering is the slowest and most expensive step, which is why it is last. Draft quality is
used while iterating; high quality is reserved for final output.

## The Layout-Before-Motion Rule

**Establish the finished visual layout before adding any animation.**

The final hero frame must be visually correct *first*. Only then are elements animated
*into* their defined CSS positions.

The failure mode this prevents: building a layout around arbitrary off-screen animated
positions. Compositions built that way look correct only in motion and fall apart the
moment a frame is inspected statically — and they are close to impossible to debug, because
there is no correct reference state to compare against.

Practically:

1. Compose the final frame with normal flow, flexbox, and grid.
2. Verify it with `inspect` — no overflow, no clipping, correct at the target resolution.
3. Add motion that resolves *to* those positions.
4. Reserve absolute positioning for intentional decorative layering, not for core layout.

## Output Formats

| Format | Use | Transparency |
| --- | --- | --- |
| MP4 (H.264) | Default delivery, universal playback | No |
| WebM (VP9) | Stream overlays and alerts | Yes — alpha channel |

Transparent WebM is what makes stream assets usable in OBS as overlays, so alerts and
overlays target WebM with alpha; flat assets target MP4.

## Phase 6 Scope

**One output only: Animated Logo Reveal.**

Not alerts, not stream packages, not a template library. Inputs are Brand DNA, the primary
logo, motion style, and a short user prompt. Output is a preview and an MP4 render saved to
the Brand Library.

Additional creation types come in Phase 9, in order: Subscriber Alert, Starting Soon, BRB,
Lower Third, Social Handle Animation, YouTube Intro, Stream Transition, Promo Animation —
and only once logo reveal is reliable.

## References

- CLI package: [`hyperframes`](https://www.npmjs.com/package/hyperframes) (0.8.12)
- Repository: https://github.com/heygen-com/hyperframes
- Authoritative syntax: the installed HyperFrames Claude skill
