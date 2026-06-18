# Google OAuth Setup

The "Continue with Google" button in `/login` and `/signup` calls
`supabase.auth.signInWithOAuth({ provider: "google", ... })`. For it to work,
Google + Supabase need a one-time handshake done outside of code.

## 1. Google Cloud Console

1. Open [console.cloud.google.com](https://console.cloud.google.com) and pick
   (or create) a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name, support email, developer contact: fill in.
   - Scopes: `email`, `profile`, `openid`.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
     (Replace `<your-supabase-project-ref>` with the value before
     `.supabase.co` in `NEXT_PUBLIC_SUPABASE_URL`.)
4. Copy the **Client ID** and **Client Secret**.

## 2. Supabase Dashboard

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication → Providers → Google**
   - Toggle **Enabled** on.
   - Paste **Client ID** and **Client Secret** from step 1.
   - Save.
3. **Authentication → URL Configuration**
   - **Site URL:** your production domain (e.g. `https://prepintel.app`).
   - **Redirect URLs (allowlist):** add each environment that needs OAuth:
     ```
     http://localhost:3000/auth/callback
     https://prepintel.app/auth/callback
     https://*-yourteam.vercel.app/auth/callback
     ```
     (Vercel preview URLs use the wildcard pattern; replace `yourteam` with your
     Vercel team slug.)

## 3. Verify

- `npm run dev`, open `/login`, click **Continue with Google**.
- You should bounce through Google's consent screen and land on
  `/auth/callback` → `/onboarding` (first time) or `/dashboard`.
- On first sign-in, a `User` row is created in Prisma with `role = STUDENT`,
  `name`, `email`, and `avatarUrl` (if Google provided one).

## How the code wires up

- Client triggers OAuth: `app/(auth)/login/login-form.tsx` and
  `app/(auth)/signup/signup-form.tsx` call
  `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`.
- Supabase handles the round trip with Google.
- Callback handler: `app/auth/callback/route.ts` exchanges the code for a
  session, upserts the Prisma user row, and decides between `/onboarding` and
  `/dashboard` based on `user.onboardedAt`.

## No new env vars

OAuth secrets live in the Supabase dashboard — they never touch your repo or
Vercel env. You already have `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` from Step 1, which is all the client needs.
