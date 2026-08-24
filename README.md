# AI Brand Builder

**Build your brand once. Create everything from it.**

A brand-building and branded-content platform for creators, streamers, influencers,
podcasters, and small businesses. Users define a complete brand identity once — the
**Brand DNA** — and every asset the platform generates inherits from it: logos, social
graphics, streaming overlays, animated alerts, intros, outros, lower thirds, and promos.

This is not an animation generator with a brand field bolted on. **The brand is the
source of truth**, and generation is downstream of it.

---

## Status

**Phase 1 — Application Foundation.** See [Implementation Checklist](#implementation-checklist).

The app currently ships authentication, protected routing, the design system, and the
dashboard shell. Brand Builder, generation, and rendering are not implemented yet and are
tracked below rather than stubbed with fake behaviour.

---

## Tech Stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, Turbopack) | 16.3.2 |
| UI runtime | React | 19.2.8 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | Hand-rolled shadcn/ui-style primitives (CVA + tailwind-merge) | — |
| Database | Supabase PostgreSQL | — |
| Auth | Supabase Auth (`@supabase/ssr`) | 0.12.x |
| Storage | Supabase Storage (behind a `StorageService` abstraction) | — |
| Validation | Zod | 4.x |
| Images | OpenAI Image API (`gpt-image-2`) | — |
| Motion | HyperFrames CLI + GSAP | 0.8.x |
| Tests | Vitest | 4.x |
| Payments | Stripe (deliberately deferred) | — |

Version choices were resolved against the npm registry at scaffold time, not from memory.

---

## Getting Started

### Prerequisites

- **Node.js 20.9+** (developed on 22.22.2)
- **npm** (developed on 10.9.7)
- **FFmpeg** — required only for HyperFrames rendering (Phase 6+). Not needed for Phases 1–5.
- **HyperFrames toolchain** — see [docs/hyperframes.md](./docs/hyperframes.md#installing-the-toolchain).
  Installs to the machine, not the repo, so ephemeral environments need it reinstalled.

### Install

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The app runs at http://localhost:3000.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch) |

---

## Environment Variables

Copy `.env.example` to `.env.local`. Values are validated by Zod at startup
(`src/lib/env.ts`) — the app fails fast with a readable error rather than crashing
mid-request on an undefined value.

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Phase 1 | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Phase 1 | Supabase anon/publishable key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Phase 4 | Admin operations that bypass RLS |
| `OPENAI_API_KEY` | **server only** | Phase 5 | OpenAI image generation |
| `OPENAI_IMAGE_MODEL` | server | no | Defaults to `gpt-image-2` |
| `NEXT_PUBLIC_APP_URL` | client | no | Absolute URLs for auth redirects |

**Only `NEXT_PUBLIC_*` variables ever reach the browser.** Server-only secrets live in
`src/lib/env.server.ts`, which imports the `server-only` marker package — importing it from
a client component is a build error, not a runtime surprise.

Variables required in a later phase are optional today, so the app boots with only the two
Supabase values set.

---

## Documentation

| Document | Contents |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, module boundaries, data model, security model |
| [docs/brand-dna.md](./docs/brand-dna.md) | The Brand DNA object — shape, fields, and how it propagates |
| [docs/generation-pipeline.md](./docs/generation-pipeline.md) | Request → brand context → planning → generation → asset |
| [docs/hyperframes.md](./docs/hyperframes.md) | HyperFrames integration, workflow, and design rules |

---

## Implementation Checklist

### Phase 0 — Environment ✅
- [x] Node.js 22.22.2, npm 10.9.7 verified
- [x] Git repository on `claude/ai-brand-builder-saas-cq8gs0`
- [x] Package versions resolved from the live registry
- [x] OpenAI image model verified against official docs (`gpt-image-2`)
- [x] HyperFrames CLI confirmed (`hyperframes@0.8.12`)
- [x] HyperFrames skills installed via `npx hyperframes skills` (20, verified current)
- [x] FFmpeg / FFprobe 6.1.1 installed
- [x] Chrome Headless Shell installed for local rendering
- [x] `npx hyperframes doctor` — all required checks pass

### Phase 1 — Application Foundation ✅
- [x] Next.js + TypeScript (strict) + Tailwind v4
- [x] Zod-validated environment configuration
- [x] Design tokens and dark-first theme
- [x] UI primitives (Button, Input, Label, Card, Badge, Alert)
- [x] Supabase browser / server / proxy clients
- [x] Sign in, sign up, sign out, auth callback
- [x] Session-refreshing proxy and protected routes, with open-redirect protection
- [x] Dashboard shell with sidebar navigation and empty states
- [x] Validation: typecheck, lint, tests, production build

### Phase 2 — Database
- [ ] Migrations for `profiles`, `brands`, `brand_colors`, `brand_fonts`, `brand_socials`
- [ ] Migrations for `assets`, `projects`, `generations`, `renders`
- [ ] UUID primary keys, `updated_at` triggers
- [ ] Row Level Security on every table
- [ ] `profiles` auto-created on signup via trigger
- [ ] Generated TypeScript database types
- [ ] Verify cross-user isolation with tests

### Phase 3 — Brand Builder
- [ ] Multi-step wizard: basics → personality → colors → typography → logo → visual style → motion style → review
- [ ] Zod schema per step with resumable draft state
- [ ] Brand DNA compiled and persisted to `brands.brand_dna`
- [ ] Brand detail page (Overview / Identity / Assets / Projects)
- [ ] Full edit-after-creation support
- [ ] `BrandService` with ownership checks

### Phase 4 — Logo Upload
- [ ] `StorageService` abstraction over Supabase Storage
- [ ] Upload with MIME allowlist, magic-byte sniffing, and size limits
- [ ] `assets` records with dimensions and metadata
- [ ] Primary logo selection
- [ ] Signed URLs for private assets
- [ ] Logo renders correctly across the app

### Phase 5 — OpenAI Logo Generation
- [ ] `ImageGenerationService` provider interface
- [ ] OpenAI provider (`gpt-image-2`, base64 → storage)
- [ ] Controlled prompt builder from Brand DNA (never raw user passthrough)
- [ ] `POST /api/generate/image` — authenticate, authorise brand, rate-limit, generate, persist
- [ ] `generations` rows for every call, success or failure
- [ ] Multiple logo variations; user approves the primary
- [ ] Prompt-builder unit tests

### Phase 6 — HyperFrames Proof of Concept
- [ ] Brand DNA → HyperFrames design config (auto-generated `DESIGN.md`)
- [ ] Motion specification schema + validator
- [ ] Controlled renderer: motion spec → composition (no arbitrary generated code executed)
- [ ] One asset type only: **Animated Logo Reveal**
- [ ] Workflow: lint → inspect → preview → fix → render
- [ ] MP4 output; WebM with alpha where appropriate

### Phase 7 — Project System
- [ ] `projects` persistence with generation spec
- [ ] Job status machine: queued → planning → generating → validating → rendering → completed / failed
- [ ] User-facing errors; technical detail stored server-side
- [ ] Safe retry of failed jobs
- [ ] Project view: prompt, brand, preview, statuses, export

### Phase 8 — Brand Library
- [ ] Asset grid with type filters
- [ ] Asset preview (image and video)
- [ ] Favourite / approve / archive
- [ ] Export and download
- [ ] Approved assets prioritised in later generations

### Deferred (deliberately)
Stripe billing · credits enforcement · Brand Learning · full stream packs · additional
creation types · teams · marketplace · timeline editor.

---

## License

Private and proprietary.
