# Interview Experience Intelligence Platform

EdTech platform that catalogs interview experiences from companies (Adobe, Google, Samsung, …), presents them to students as visually rich infographic pages, and provides an internal team with analytics dashboards.

This repository currently contains **Step 1: the foundation and pipeline proof** — Next.js + Prisma + Supabase wired end-to-end with email/password auth, a protected `/admin` route, and a `/healthcheck` page that proves the full Next.js → Prisma → Supabase Postgres roundtrip. Product features (submission wizard, infographic pages, dashboards, taxonomy, etc.) are intentionally not built yet.

## Tech stack

- **Next.js 15** (App Router) + TypeScript strict mode
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 6** ORM
- **Supabase** — Postgres, Auth (email/password), Storage
- Deploys to **Vercel**

## Prerequisites

- **Node.js 20+** (tested on Node 22)
- A **Supabase project** (free tier is fine). Create one at <https://supabase.com>.

## Local setup

```bash
# 1. Clone and install
git clone <this-repo>
cd Interview_experience
npm install

# 2. Configure environment
cp .env.example .env.local
# Then open .env.local and fill in the five values described below.

# 3. Apply the schema to your Supabase Postgres
npx prisma migrate dev

# 4. Seed the HealthCheck row that the /healthcheck page expects
npx prisma db seed

# 5. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

All five are required. The `.env.example` file contains commented placeholders.

| Variable                          | Where to find it                                                                  | Notes                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase dashboard → **Project Settings → API** → *Project URL*                   | Public, safe to expose to the browser.                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Same screen → *anon / public* key                                                 | Public, safe to expose to the browser. RLS enforces access.                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`       | Same screen → *service\_role* key                                                 | **Server-only.** Bypasses RLS. Never expose to the browser, never commit.                                      |
| `DATABASE_URL`                    | **Project Settings → Database → Connection string → Transaction pooler** (`6543`) | Pooled connection used by the app at runtime in serverless environments.                                       |
| `DIRECT_URL`                      | Same screen → **Direct connection** (`5432`)                                      | Direct connection used by `prisma migrate` to manage schema state. Migrations require a non-pooled connection. |

`.env.local` is gitignored — never commit real values.

## Verification

Confirm the pipeline works end-to-end:

1. **DB roundtrip** — visit <http://localhost:3000/healthcheck>. You should see a card with `label: pipeline-ok` and the row's `createdAt` timestamp.
2. **Signup** — visit <http://localhost:3000/signup>, create an account with any email + password ≥ 6 chars. You should be redirected to `/admin` (or `/login` if your Supabase project has email-confirmation enabled — confirm and log in).
3. **Profile sync** — in the Supabase dashboard → **Table editor → User**, you should see a new row with your email and `role = STUDENT`.
4. **Protected route** — visit `/admin` while logged out; you should be redirected to `/login`. After login you should land back on `/admin` and see your email in the top bar.
5. **Logout** — clicking *Logout* should return you to `/` and clear the session.

## Available scripts

| Script               | What it does                                                  |
| -------------------- | ------------------------------------------------------------- |
| `npm run dev`        | Start the dev server (Turbopack)                              |
| `npm run build`      | Production build                                              |
| `npm run start`      | Run the production build                                      |
| `npm run lint`       | ESLint                                                        |
| `npm run typecheck`  | `tsc --noEmit` (strict mode)                                  |
| `npm run db:migrate` | `prisma migrate dev` — apply schema changes & generate client |
| `npm run db:seed`    | `prisma db seed` — insert the `pipeline-ok` HealthCheck row   |
| `npm run db:studio`  | `prisma studio` — visual DB browser                           |

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo. The framework preset is auto-detected as Next.js.
3. Under **Environment Variables**, add all five variables from `.env.local`.
4. Deploy. Vercel runs `npm install` (which triggers `prisma generate` via the `postinstall` hook) and `npm run build`.
5. Visit the deployed `/healthcheck` URL to confirm the production roundtrip works.

If you add migrations later, run `npx prisma migrate deploy` against your production DB. For the initial setup the local `npx prisma migrate dev` already pushed the schema, since both `DATABASE_URL` and `DIRECT_URL` point at the same Supabase project.

## Project layout

```
app/
├── (auth)/
│   ├── login/      # /login — email/password form (Suspense-wrapped for useSearchParams)
│   └── signup/     # /signup — creates Supabase user + Prisma profile
├── admin/          # /admin — protected route, server-component layout
├── healthcheck/    # /healthcheck — Prisma → Supabase roundtrip proof
├── _actions/       # Server actions (createUserProfile, signOut)
├── layout.tsx
└── page.tsx        # Landing
components/ui/      # shadcn/ui primitives (button, card, input, label, form, sonner)
lib/
├── db.ts           # Prisma client singleton
├── utils.ts        # cn() helper
└── supabase/       # @supabase/ssr helpers (client / server / middleware)
prisma/
├── schema.prisma   # User + HealthCheck models + UserRole enum
└── seed.ts         # Inserts the pipeline-ok HealthCheck row
middleware.ts       # Refreshes session, guards /admin/*
```

## Roadmap

This is Step 1. Future steps will add the full data model (`Interview`, `Round`, `Question`, `Topic`, `Company`, `Asset`, `Bookmark`, `FeatureFlag`), the submission wizard, infographic pages, analytics dashboards, taxonomy management, and integrations (Cloudflare CDN, Sentry, PostHog, Resend, Google OAuth).
