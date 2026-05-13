# NalarUp

Platform tryout dan simulasi CAT untuk persiapan seleksi CASN (CPNS / PPPK) Indonesia. Fokus utama: menyediakan paket tryout yang banyak dan mudah diakses, plus pengalaman simulasi ujian yang mirip aslinya sebelum menambah fitur AI lanjutan.

## Stack

- Next.js 16.2.6 (App Router, Turbopack, React 19.2)
- Tailwind CSS v4
- Supabase (Auth + Postgres) via `@supabase/ssr`
- Drizzle ORM + `postgres-js` driver
- Zod + React Hook Form
- Vitest (unit) + Playwright (E2E)
- Deploy: Vercel (region `sin1`) + Supabase Cloud

## Local development

Prasyarat: Node 20+, Docker (buat Supabase lokal), `supabase` CLI opsional.

```bash
npm install
cp .env.local.example .env.local   # isi URL + anon key Supabase lokal / cloud
npm run db:migrate
npm run db:seed
npm run dev
```

App jalan di `http://localhost:3000`.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm test` — unit test (Vitest)
- `npm run e2e` — E2E test (Playwright)
- `npm run db:generate` / `db:migrate` / `db:studio` — Drizzle schema tooling
- `npm run db:seed` — seed data tryout

## Struktur

```
src/
  app/
    (public)/      # login, register
    (app)/         # dashboard, tryouts (auth-required via proxy)
    admin/         # admin MVP (questions, packages, reports)
    exam/          # ruang ujian
    api/           # route handlers
  components/      # UI blocks
  lib/
    supabase/      # server + browser clients
    db/            # drizzle schema & queries
    scoring/       # scoring engine (unit-tested)
    admin/         # publish validators
  proxy.ts         # auth proxy (ex-middleware, Next.js 16)
supabase/
  migrations/      # initial schema, profile trigger, RLS policies
tests/
  e2e/             # Playwright specs
```

## Deploy

Lihat `docs/DEPLOY.md` untuk langkah lengkap Supabase Cloud + Vercel.

## Status

Phase A–G selesai. Phase H (prod-ready): RLS, unit tests, deploy config — done. E2E Playwright dan deploy Vercel sedang diselesaikan.
