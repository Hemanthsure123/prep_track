# Interview Experience Intelligence Platform

EdTech platform that catalogs interview experiences from companies (Adobe, Google, Samsung, …), presents them to students as visually rich infographic pages, and provides an internal team with analytics dashboards.

**Status:** Steps 1 & 2 complete. The foundation is wired (Next.js + Prisma + Supabase + email/password auth) and the full data layer is in place — every model migrated, taxonomy seeded, storage bucket provisioned, Zod schemas mirror every Prisma model, and a diagnostic page at `/admin/db-check` proves it all works. The submission wizard and student-facing UI land in Step 3.

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
# Also create a .env file with DATABASE_URL and DIRECT_URL — Prisma CLI
# only reads .env (not .env.local). Both files are gitignored.

# 3. Apply the Prisma schema to your Supabase Postgres
npx prisma migrate dev

# 4. Seed taxonomy (topics, companies, feature flags)
npx prisma db seed

# 5. Apply the Supabase Storage bucket + RLS policies
npx prisma db execute --file supabase/migrations/0001_storage.sql --schema prisma/schema.prisma

# 6. Run the dev server
npm run dev
```

Open <http://localhost:3000>. Sign up, then visit `/admin/db-check` to confirm the data layer is wired.

## Environment variables

All five are required. The `.env.example` file contains commented placeholders.

| Variable                          | Where to find it                                                                       | Notes                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase dashboard → **Project Settings → API** → *Project URL*                        | Public, safe to expose to the browser.                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Same screen → *anon / public* key                                                      | Public, safe to expose to the browser. RLS enforces access.                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`       | Same screen → *service\_role* key                                                      | **Server-only.** Bypasses RLS. Never expose to the browser, never commit.                                      |
| `DATABASE_URL`                    | **Project Settings → Database → Connection string → Transaction pooler** (`6543`)      | Pooled connection used by the app at runtime in serverless environments. Append `?pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL`                      | **Project Settings → Database → Session pooler** (port `5432`, pooler hostname)        | Used by `prisma migrate` for schema changes. The literal "Direct connection" (`db.<ref>.supabase.co:5432`) is IPv6-only on Supabase free tier — prefer the session pooler. |

`.env.local` and `.env` are both gitignored — never commit real values.

## Database & Storage

The full schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma): three core entities (`Interview → Round → Question`), a controlled-vocabulary `Topic` table joined to questions via `QuestionTopic`, `Company`, `Asset`, `User`, `Bookmark`, `FeatureFlag`, and all related enums.

| Task                            | Command                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Apply schema changes            | `npx prisma migrate dev`                                                                               |
| Reseed taxonomy (idempotent)    | `npx prisma db seed`                                                                                   |
| Apply storage bucket & policies | `npx prisma db execute --file supabase/migrations/0001_storage.sql --schema prisma/schema.prisma`      |
| Inspect tables (GUI)            | `npx prisma studio`                                                                                    |
| Validate schema                 | `npx prisma validate`                                                                                  |
| Deploy migrations to prod       | `npx prisma migrate deploy`                                                                            |

**Storage migration apply options:** the storage SQL lives in `supabase/migrations/0001_storage.sql` and creates the `assets` bucket plus four RLS policies (public read, authenticated insert/update/delete). Apply it either via the `prisma db execute` command above (recommended — uses your existing `DIRECT_URL`) or by pasting the file's contents into **Supabase dashboard → SQL Editor → Run**. The script is idempotent (drops policies before recreating, `on conflict do nothing` on the bucket insert).

**Storage helper:** [`lib/storage.ts`](lib/storage.ts) exposes `uploadAsset(file, "interviews" | "rounds", ownerId)`, `getPublicUrl(path)`, and `deleteAsset(path)`. Object keys are namespaced as `{prefix}/{ownerId}/{uuid}-{sanitized-name}` for collision-proof, traceable storage.

**Zod validations:** [`lib/validations/`](lib/validations/) mirrors every Prisma model — one schema per model plus a composite `interviewFullCreateSchema` that matches the wizard payload landing in Step 3. Enums use `z.nativeEnum(...)` against the generated Prisma enums, so renames/additions in the schema break the schemas at compile time.

**Diagnostic page:** [`/admin/db-check`](app/admin/db-check/page.tsx) is the canonical "is everything wired?" page. Auth-required. Reads from every model, lists topics-by-category with sample names, dumps companies and feature flags, prints the logged-in user's Prisma row, shows zeroes for the still-empty fact tables, and calls Supabase Storage `listBuckets()` to confirm `assets` exists.

## Verification (local)

1. **DB diagnostic** — sign up, log in, visit <http://localhost:3000/admin/db-check>. Topics ≈ 144, Companies = 10, Feature flags = 3, `assets` bucket status: OK.
2. **Signup** — visit <http://localhost:3000/signup>, create an account. You should be redirected to `/admin` (or `/login` if your Supabase project has email-confirmation enabled — confirm and log in).
3. **Profile sync** — in Supabase dashboard → **Table editor → User**, see a new row with your email and `role = STUDENT`.
4. **Protected route** — visit `/admin` while logged out; you should be redirected to `/login`.
5. **Logout** — clicking *Logout* should return you to `/` and clear the session.

## Available scripts

| Script               | What it does                                                                       |
| -------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`        | Start the dev server (Turbopack)                                                   |
| `npm run build`      | Production build                                                                   |
| `npm run start`      | Run the production build                                                           |
| `npm run lint`       | ESLint                                                                             |
| `npm run typecheck`  | `tsc --noEmit` (strict mode)                                                       |
| `npm run db:migrate` | `prisma migrate dev` — apply schema changes & generate client                      |
| `npm run db:seed`    | `prisma db seed` — idempotent seed of topics, companies, and feature flags         |
| `npm run db:studio`  | `prisma studio` — visual DB browser                                                |

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo. The framework preset is auto-detected as Next.js.
3. Under **Environment Variables**, add all five variables from `.env.local`.
4. Deploy. Vercel runs `npm install` (which triggers `prisma generate` via the `postinstall` hook) and `npm run build`.
5. Visit the deployed `/admin/db-check` URL after logging in to confirm the production data layer is wired.

If you add migrations later, run `npx prisma migrate deploy` against your production DB. The storage SQL only needs to run once per Supabase project — re-running it is safe (idempotent).

## Project layout

```
app/
├── (auth)/
│   ├── login/         # /login — email/password form (Suspense-wrapped for useSearchParams)
│   └── signup/        # /signup — creates Supabase user + Prisma profile
├── admin/             # /admin — protected route, server-component layout
│   └── db-check/      # /admin/db-check — diagnostic page reading every model
├── _actions/          # Server actions (createUserProfile, signOut)
├── layout.tsx
└── page.tsx           # Landing
components/ui/         # shadcn/ui primitives (button, card, input, label, form, sonner)
lib/
├── db.ts              # Prisma client singleton
├── slug.ts            # slugify() helper
├── storage.ts         # uploadAsset / getPublicUrl / deleteAsset (Supabase Storage)
├── utils.ts           # cn() helper
├── supabase/          # @supabase/ssr helpers (client / server / middleware)
└── validations/       # Zod schemas mirroring every Prisma model + composite wizard schema
prisma/
├── schema.prisma      # Full data model: enums + Company / Interview / Round / Question / Topic / QuestionTopic / Asset / User / Bookmark / FeatureFlag
├── migrations/        # Prisma migration history
└── seed.ts            # Idempotent seed: 144 topics, 10 companies, 3 feature flags
supabase/
└── migrations/
    └── 0001_storage.sql   # assets bucket + RLS policies
middleware.ts          # Refreshes session, guards /admin/*
```

## Roadmap

Steps 1 & 2 are done. Step 3 builds the admin submission wizard (the biggest feature build). Future work: infographic pages, student catalog, analytics dashboards, taxonomy management UI, Google OAuth, Cloudflare CDN, Sentry/PostHog/Resend integrations.
