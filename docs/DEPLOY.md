# NalarUp — Production Deploy Guide (Vercel + Supabase Cloud)

End-to-end checklist for taking NalarUp from local dev to production.

## 1. Supabase Cloud project

1. Create a new project at https://supabase.com/dashboard. Pick a region close
   to Indonesia (e.g. `ap-southeast-1` Singapore).
2. Wait for the project to provision, then go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` *(keep server-side only)*
3. Go to **Settings → Database → Connection string → URI** and take the
   **Supavisor Transaction (port 6543)** URL. Append `?pgbouncer=true` so
   prepared statements are disabled (Drizzle/postgres-js require this).
   Example:
   ```
   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Go to **Authentication → URL Configuration** and add
   `https://<your-domain>/**` to the allowed redirect URLs.
5. Go to **Authentication → Providers → Email** and:
   - Disable "Confirm email" for faster MVP onboarding, OR
   - Keep it enabled and make sure the sender domain works.

## 2. Apply migrations + trigger + RLS to prod

Run once against the prod project. Two paths:

### Option A — Supabase CLI (recommended)

```bash
cd nalarup-app
npx supabase link --project-ref <ref>
npx supabase db push   # applies everything in supabase/migrations/
```

### Option B — Drizzle + manual SQL

```bash
# 1. Let Drizzle create schema tables
DATABASE_URL='<prod connection string>' npm run db:migrate

# 2. Apply the profile-on-signup trigger
psql '<prod connection string>' -f supabase/migrations/20260513000001_profile_on_signup.sql

# 3. Apply RLS policies
psql '<prod connection string>' -f supabase/migrations/20260513000002_rls_policies.sql
```

## 3. Seed baseline content (optional)

The seed script is idempotent (TRUNCATE content tables + reinsert) — safe
only on empty prod. Edit `scripts/seed.ts` if you want to skip MVP dummies.

```bash
DATABASE_URL='<prod>' \
NEXT_PUBLIC_SUPABASE_URL='<prod>' \
NEXT_PUBLIC_SUPABASE_ANON_KEY='<prod>' \
npm run db:seed
```

After seeding, promote a user to admin:

```sql
-- Run in Supabase SQL editor after that user has signed up
UPDATE public.profiles SET role='admin' WHERE email='you@domain.com';
```

## 4. Vercel project

1. Push the repo to GitHub (private).
2. https://vercel.com/new → Import → select the repo.
3. **Framework:** Next.js (auto-detected).
4. **Root directory:** `.` (project root).
5. **Environment variables** — paste all keys from
   `.env.production.example`, filled with prod values.
6. **Build command / Install command** — leave default (they're pinned in
   `vercel.json`).
7. **Region** — `sin1` (Singapore) matches Supabase `ap-southeast-1` for
   lowest latency.
8. Deploy. First build takes ~2 min.

## 5. Post-deploy checks

- Visit `https://<project>.vercel.app` → landing page loads.
- Register a new test user → profile created by trigger (verify in Supabase
  **Table Editor → profiles**).
- Open `/tryouts` → catalog shows seeded packages.
- Start a tryout → answer → submit → result page with scores.
- Check Vercel logs: no `DATABASE_URL` errors, no RLS denials in server
  actions (server uses service role, so RLS shouldn't block).

## 6. Custom domain

1. Vercel → Project → Settings → Domains → add `nalarup.id`.
2. Cloudflare (or registrar) → point A/CNAME to Vercel's target.
3. In Supabase → Authentication → URL Configuration, add the new domain to
   allowed redirect URLs.
4. Update `NEXT_PUBLIC_APP_URL` env on Vercel and redeploy.

## 7. Operational notes

- **DB pooling:** postgres-js caches a connection via the `globalForDb`
  singleton in `src/lib/db/index.ts`. Supavisor transaction mode reuses
  connections between cold starts, so no extra work needed.
- **Cron / background jobs:** not used in MVP. If added later, use Vercel
  Cron or Supabase Scheduled Functions.
- **Backups:** Supabase Cloud does daily backups on paid plans. Free tier
  has 7-day PITR — enable manually.
- **Environment sync:** keep `.env.production.example` up to date when
  adding new env vars. `vercel env pull .env.local` works for mirror-downs
  to local dev.

## 8. Rolling back

- Revert the git commit and push → Vercel deploys the previous state.
- Database schema: revert via new migration SQL — Drizzle does not support
  automatic down-migrations.

## Files worth knowing about

- `supabase/migrations/0000_chemical_crystal.sql` — base Drizzle schema
- `supabase/migrations/20260513000001_profile_on_signup.sql` — auth trigger
- `supabase/migrations/20260513000002_rls_policies.sql` — RLS policies
- `scripts/seed.ts` — content seed (non-destructive to profiles/attempts)
- `.env.production.example` — env template
- `vercel.json` — deploy config (region, build command)
