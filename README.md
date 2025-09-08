# GHXSTSHIP Monorepo (ATLVS + OPENDECK + GHXSTSHIP)

This monorepo contains:

- apps/web: Next.js App Router app (ATLVS product, OPENDECK marketplace, GHXSTSHIP marketing)
- packages/*: shared libraries (UI, config, utils, auth, analytics, data-view)
- supabase/: SQL migrations and seeds

## Quick Start

1. Install pnpm and Supabase CLI

```bash
npm i -g pnpm @supabase/cli
```

2. Install deps

```bash
pnpm install
```

3. Setup env

Copy `.env.example` to `apps/web/.env.local` and set Supabase URL/keys and PostHog key.

4. Dev

```bash
pnpm dev
```

Visit http://localhost:3000

5. Supabase (local)

```bash
supabase start
supabase db reset --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

Apply migrations from `supabase/migrations` and seed data from `supabase/seed/seed.sql`.

## Packages

- `@ghxstship/ui`: design system and components built on Tailwind and shadcn patterns.
- `@ghxstship/config`: tailwind preset and shared configs.
- `@ghxstship/utils`: helpers for date/currency/i18n.
- `@ghxstship/auth`: Supabase auth client and hooks.
- `@ghxstship/analytics`: PostHog wrappers.
- `@ghxstship/data-view`: DataView engines (grid first).

## CI

GitHub Actions workflow in `.github/workflows/ci.yml` lints and builds on PRs.
