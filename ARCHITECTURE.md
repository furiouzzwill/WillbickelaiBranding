# Architecture

## Core Principle

**The brand is the source of truth.**

Every generated image, animation, video, template, and graphic inherits from the user's
Brand DNA. No generation path is allowed to bypass brand context. When a design decision is
ambiguous, the resolution is whichever option keeps brand identity authoritative.

The product should feel like the user has their own AI creative team that already
understands their brand — not a prompt box.

---

## System Overview

```
                        ┌─────────────────┐
                        │   User Request  │
                        │  (type + text)  │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  Brand Context  │   Brand DNA + approved assets
                        │   (resolved)    │   + platform requirements
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │Creative Planning│   Request → structured spec
                        │      Layer      │   (never raw prompt passthrough)
                        └────────┬────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        ┌────────▼────────┐            ┌─────────▼────────┐
        │Image Generation │            │ Motion Generation│
        │  OpenAI Images  │            │   HyperFrames    │
        │  (gpt-image-2)  │            │    + GSAP        │
        └────────┬────────┘            └─────────┬────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Asset Library  │   Storage + assets rows
                        └─────────────────┘
```

The two generation engines are peers behind a common planning layer. Adding a third engine
later means adding a provider, not restructuring the pipeline.

---

## Application Structure

```
src/
  app/
    (auth)/                  Public auth routes — sign-in, sign-up
      sign-in/
      sign-up/
    (app)/                   Authenticated shell — sidebar + topbar
      dashboard/
      brands/                Phase 3
      create/                Phase 6
      projects/              Phase 7
      library/               Phase 8
    api/
      generate/image/        Phase 5
      generate/motion/       Phase 6
    auth/callback/           Supabase OAuth / email confirmation exchange
  components/
    ui/                      Design-system primitives (presentational only)
    layout/                  App shell, sidebar, topbar, user menu
    auth/                    Auth forms
    brand/                   Phase 3
    create/                  Phase 6
    assets/                  Phase 8
  lib/
    supabase/                client / server / proxy factories
    openai/                  Phase 5 — provider implementation
    hyperframes/             Phase 6 — design config + renderer
    generation/              Phase 5+ — prompt + spec builders
    storage/                 Phase 4 — storage abstraction
    validation/              Shared Zod schemas
    env.ts                   Validated public environment access
    env.server.ts            Server-only secrets (marked `server-only`)
    redirects.ts             Same-origin redirect narrowing
    utils.ts                 cn() and small helpers
  services/                  Business logic, ownership enforcement
  types/                     Domain types (brand, asset, generation, project)
  config/                    Static product config — nav, creation types, presets
```

### Route Groups

`(auth)` and `(app)` are Next.js route groups: they scope layouts without appearing in
URLs. `(auth)` renders a centred, chrome-free layout; `(app)` renders the full application
shell and requires a session.

---

## Layering Rules

Dependencies flow in one direction. A violation of this order is an architectural bug:

```
app/ (routes)  →  services/  →  lib/  →  types/
components/    →  lib/, types/
```

- **Routes** handle HTTP concerns: auth, parsing, status codes, redirects. No business logic.
- **Services** own business rules and are the *only* layer permitted to assert ownership.
- **lib** holds provider adapters and pure helpers. It never imports from `services/`.
- **components/ui** is presentational. No data fetching, no Supabase imports.

Services are plain modules with exported functions, not classes or DI containers. The
boundary is what matters; the ceremony is not.

Planned services: `BrandService`, `AssetService`, `ImageGenerationService`,
`MotionGenerationService`, `RenderService`, `StorageService`, `UsageService`.

---

## Authentication

Supabase Auth via `@supabase/ssr`, which stores the session in cookies so both server
components and route handlers can read it.

Three client factories, each for one context — they are not interchangeable:

| Factory | Context | Cookie behaviour |
| --- | --- | --- |
| `createBrowserSupabaseClient()` | Client components | Reads/writes `document.cookie` |
| `createServerSupabaseClient()` | Server components, route handlers, actions | Reads Next.js cookies; writes are no-ops in RSC |
| `createProxySupabaseClient()` | `proxy.ts` only | Reads request cookies, writes to the response |

**Route protection is layered, deliberately.** `src/proxy.ts` — Next.js 16's rename of the
`middleware` convention — refreshes the session and redirects unauthenticated users away
from `(app)` routes. This is UX, not security. The authoritative checks are (a)
`requireUser()` in every protected server component and route handler, and (b) Row Level
Security in the database. The proxy alone is never treated as an authorisation boundary.

Redirect targets from `?next=` are narrowed by `safeRelativePath()` to same-origin relative
paths before use, so the sign-in flow cannot be turned into an open redirect.

`getUser()` calls `supabase.auth.getUser()`, which validates the JWT against the auth
server. `getSession()` is not trusted server-side, because its cookie payload is not
re-verified.

---

## Data Model

All tables use UUID primary keys and carry `created_at` / `updated_at`.

| Table | Purpose | Owner column |
| --- | --- | --- |
| `profiles` | Public user profile, created by trigger on signup | `user_id` |
| `brands` | Brand root record; holds compiled `brand_dna` JSONB | `user_id` |
| `brand_colors` | Palette entries with `role` (primary/secondary/accent/background/text) | via `brand_id` |
| `brand_fonts` | Typography by `role` (heading/body/accent) | via `brand_id` |
| `brand_socials` | Platform handles and URLs | via `brand_id` |
| `assets` | Every uploaded or generated file, with metadata and status | `user_id` |
| `projects` | A creation job and its `generation_spec` | `user_id` |
| `generations` | One row per provider call: input, output, status, error | `user_id` |
| `renders` | Render outputs per project and format | via `project_id` |
| `usage_events` | Future credit accounting (Phase 9+) | `user_id` |

### Why Brand DNA is both normalised *and* JSONB

`brand_colors` / `brand_fonts` / `brand_socials` are relational so the UI can query, sort,
and edit individual entries. `brands.brand_dna` is a compiled JSONB snapshot of the whole
identity, written whenever the brand changes.

The generation pipeline reads the snapshot in one query instead of joining five tables on
every call, and a stored generation stays reproducible even after the brand is later
edited. The relational tables are the editing surface; the JSONB is the read model.

---

## Security Model

- **Row Level Security on every table.** RLS is the real boundary. Application checks are
  defence in depth, not a substitute.
- **Secrets never reach the browser.** Only `NEXT_PUBLIC_*` is exposed. Secrets live in
  `env.server.ts`, which imports `server-only` — reaching it from a client bundle is a
  *build* error, not a runtime check that fires after the key has already shipped.
- **No open redirects.** Every user-supplied redirect target is narrowed to a same-origin
  relative path.
- **Every server input is Zod-validated** at the route boundary before it reaches a service.
- **Ownership is verified in the service layer**, by ID, on every brand/project/asset access.
- **Uploads are constrained**: MIME allowlist, magic-byte sniffing (not just the declared
  content type), and hard size limits.
- **Private assets are served via signed, expiring URLs.**
- **No arbitrary code execution.** AI output is never `eval`'d or injected as HTML.
  Compositions are produced by a controlled renderer from a validated motion specification.
- **Generation endpoints are rate-limited** and idempotent where practical, because they
  cost real money per call.

---

## Generation Philosophy

The system does **not** ask a model for HTML and render it. It asks for a *structured
specification*, validates that specification against a schema, and renders it with code we
control.

```
Prompt → validated motion spec → controlled renderer → composition
```

This is the difference between a product and a demo. It gives deterministic output,
reviewable diffs, safe execution, and reusable motion primitives. Entrances, text
animations, logo animations, exits, and transitions are registered presets — the registry
is designed for expansion, and only the presets the current phase needs are implemented.

See [docs/generation-pipeline.md](./docs/generation-pipeline.md).

---

## Storage

`StorageService` wraps Supabase Storage behind a provider-neutral interface
(`upload`, `getSignedUrl`, `delete`, `getPublicUrl`). Cloudflare R2 or S3 can be introduced
later by adding a provider — no call site changes. Paths are namespaced
`{user_id}/{brand_id}/{asset_type}/{uuid}.{ext}` so ownership is legible from the path and
RLS storage policies can be expressed simply.

---

## Job Status Model

Generation and render jobs move through an explicit state machine:

```
queued → planning → generating → validating → rendering → completed
                                                        ↘ failed
```

Users see a friendly message per state. Full technical detail — provider errors, stack
traces, raw responses — is stored in `generations.error` and `generations.output` and never
surfaced raw. Failed jobs are safely retryable.

---

## Decisions

| Decision | Rationale |
| --- | --- |
| Next.js server routes over microservices | One deployable until a boundary actually hurts. Splitting early costs more than it saves. |
| Hand-rolled shadcn-style primitives | Same CVA + `tailwind-merge` pattern the shadcn CLI emits, without a generator step or interactive config in CI. Full ownership of the code. |
| Tailwind v4 CSS-first config | v4 configures tokens in `@theme` inside CSS; no `tailwind.config.ts` is needed. |
| `gpt-image-2`, read from env | Verified against official OpenAI docs at implementation time, not from memory. Model name is env-overridable so it is never a stale hardcoded string. |
| Brand DNA as compiled JSONB | One-query brand context for generation, plus reproducibility of past generations. |
| Structured motion specs over generated code | Safety, determinism, and reviewability. |
| Stripe deferred | Billing before a working creation loop optimises the wrong thing. Metadata is captured now so credits can be computed later. |
| Vitest over Jest | Native ESM and TS, no transform config, and it shares Vite resolution with the app. |
| `server-only` marker package | Turns the secret boundary into a compile-time failure instead of a convention reviewers must remember. |

---

## Deliberately Not Built

Full video editor · timeline editor · collaboration · teams · marketplace · mobile apps ·
agency system · large template libraries · complex AI agents · advanced Brand Learning ·
enterprise billing · social publishing.

The architecture leaves room for these. The MVP proves one loop end to end first:
**sign up → create brand → generate or upload logo → animated logo reveal → render →
library → export.**
