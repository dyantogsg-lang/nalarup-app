# NalarUp — Next.js Implementation Plan v1

> Rencana implementasi aplikasi produksi NalarUp berdasarkan dokumen produk, UX, schema database, UX states, dan prototype HTML fase 1.

---

## 1. Tujuan Implementasi

Target MVP teknis:

User bisa:
1. Register/login.
2. Melihat dashboard.
3. Membuka katalog tryout.
4. Membuka detail tryout.
5. Mulai atau lanjutkan attempt.
6. Mengerjakan soal dengan timer dan autosave.
7. Submit attempt.
8. Melihat hasil skor dan passing grade.
9. Membuka pembahasan soal.
10. Mendapat rekomendasi latihan berikutnya.

Admin bisa:
1. Membuat paket tryout.
2. Membuat soal dan opsi jawaban.
3. Assign soal ke paket.
4. Publish/unpublish paket.

Fase awal:
- Semua paket dibuat open access.
- Tidak ada paywall atau badge akses berbayar di UI inti.
- Fokus pada loop peningkatan skor.

---

## 2. Stack Final yang Direkomendasikan

Stack utama:

- Framework: Next.js App Router.
- Language: TypeScript.
- Styling: Tailwind CSS.
- UI primitive: custom components dulu, bisa tambah Radix UI untuk Dialog/Popover/Toast.
- Database: PostgreSQL via Supabase.
- Auth: Supabase Auth.
- ORM/migration: Drizzle ORM.
- Validation: Zod.
- Forms: React Hook Form + Zod resolver.
- Testing unit: Vitest.
- E2E: Playwright.
- Hosting: Vercel.

Kenapa:
- Cepat untuk MVP.
- Supabase Auth mengurangi pekerjaan auth.
- Drizzle memberi kontrol schema dan SQL.
- App Router cocok untuk server components + route handlers.
- Vercel cocok untuk Next.js.

---

## 3. Struktur Folder

```txt
nalarup-app/
  app/
    (public)/
      page.tsx
      login/page.tsx
      register/page.tsx
    (app)/
      dashboard/page.tsx
      tryouts/page.tsx
      tryouts/[slug]/page.tsx
      exam/[attemptId]/page.tsx
      results/[attemptId]/page.tsx
      results/[attemptId]/review/page.tsx
      history/page.tsx
      saved/page.tsx
      profile/page.tsx
    admin/
      page.tsx
      packages/page.tsx
      packages/new/page.tsx
      packages/[id]/edit/page.tsx
      questions/page.tsx
      questions/new/page.tsx
      questions/[id]/edit/page.tsx
    api/
      attempts/route.ts
      attempts/[attemptId]/route.ts
      attempts/[attemptId]/answers/route.ts
      attempts/[attemptId]/submit/route.ts
      questions/[questionId]/report/route.ts
    layout.tsx
    globals.css
  components/
    layout/
      AppShell.tsx
      Sidebar.tsx
      Topbar.tsx
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      Dialog.tsx
      Toast.tsx
      Skeleton.tsx
      EmptyState.tsx
      Banner.tsx
    tryout/
      PackageCard.tsx
      PackageFilters.tsx
      PackageHero.tsx
      BeforeExamModal.tsx
    exam/
      ExamShell.tsx
      ExamTopbar.tsx
      ExamTimer.tsx
      QuestionCard.tsx
      AnswerOption.tsx
      QuestionPalette.tsx
      AutoSaveStatus.tsx
      SubmitConfirmDialog.tsx
      OfflineBanner.tsx
    results/
      ResultHero.tsx
      SubtestScoreCard.tsx
      SafeScoreMeter.tsx
      LearningPriorityList.tsx
      NextActionCards.tsx
    review/
      ReviewFilter.tsx
      ReviewQuestionCard.tsx
      ExplanationBlock.tsx
      QuestionReportDialog.tsx
    dashboard/
      DashboardHero.tsx
      StatCards.tsx
      ProgressBySubtest.tsx
      RecentAttempts.tsx
      RecommendedPackages.tsx
      NewUserEmptyState.tsx
    admin/
      PackageForm.tsx
      QuestionForm.tsx
      OptionEditor.tsx
      AssignQuestions.tsx
  lib/
    supabase/
      browser.ts
      server.ts
      middleware.ts
    db/
      index.ts
      schema.ts
      queries/
        packages.ts
        attempts.ts
        results.ts
        dashboard.ts
        admin.ts
    auth/
      requireUser.ts
      requireAdmin.ts
    scoring/
      calculateAttemptScore.ts
      scoring.test.ts
    attempts/
      createOrResumeAttempt.ts
      saveAnswer.ts
      submitAttempt.ts
      attemptTime.ts
    recommendations/
      generateLearningRecommendations.ts
    validation/
      packageSchemas.ts
      questionSchemas.ts
      attemptSchemas.ts
    constants/
      routes.ts
      copy.ts
  db/
    migrations/
    seed.ts
  docs/
    PROJECT_PLAN.md
    UX_SPEC.md
    UX_STATES.md
    DATABASE_SCHEMA.md
    NEXTJS_IMPLEMENTATION_PLAN.md
    ADMIN_IMPORT_SPEC.md
  tests/
    e2e/
      tryout-flow.spec.ts
```

---

## 4. Route Mapping dari Prototype HTML

| Prototype | Next.js Route | Komponen utama |
|---|---|---|
| `01-landing-page.html` | `/` | Landing page |
| `07-dashboard.html` | `/dashboard` | Dashboard user baru/lama |
| `06-tryout-catalog.html` | `/tryouts` | Katalog + filters |
| `03-tryout-detail.html` | `/tryouts/[slug]` | Before exam flow |
| `02-exam-room.html` | `/exam/[attemptId]` | Exam room |
| `04-result.html` | `/results/[attemptId]` | Result page |
| `05-review.html` | `/results/[attemptId]/review` | Review/pembahasan |

---

## 5. Data Fetching Strategy

### Server Components

Gunakan server components untuk:
- Landing page static/dynamic lightweight.
- Dashboard summary initial render.
- Katalog package list.
- Detail package.
- Result page.
- Review page initial data.

### Client Components

Gunakan client components untuk:
- Exam room interactivity.
- Timer countdown.
- Answer selection.
- Autosave status.
- Question palette.
- Dialog submit.
- Offline handling.
- Filters/search katalog jika ingin instant client-side.

### Route Handlers / Server Actions

Gunakan route handlers untuk operasi stateful:
- Create/resume attempt.
- Save answer.
- Submit attempt.
- Report question.
- Save question.

Alasan:
- Lebih mudah mengontrol validasi auth.
- Scoring tidak bocor ke client.
- Bisa dites sebagai service function.

---

## 6. Core Flow Implementation

### 6.1 Register/Login

Implementasi:
- Supabase Auth email/password.
- Setelah register, insert profile.
- Redirect ke onboarding/dashboard.

MVP onboarding:
- Target persiapan: CPNS, PPPK, SKB, belum tahu.
- Mulai dari: SKD, TWK, TIU, TKP.

Route:
- `/register`
- `/login`
- `/dashboard`

### 6.2 Dashboard

Data:
- `user_dashboard_summary` atau query service.
- last attempts.
- active attempt.
- learning recommendations.
- recommended packages.

State:
- User baru: tampilkan CTA mulai tryout.
- User lama: tampilkan skor, progress, rekomendasi.
- Active attempt: tampilkan CTA lanjutkan.

### 6.3 Katalog Tryout

Data:
- Published packages.
- Recommended packages if logged in.
- Filters: semua, SKD, TWK, TIU, TKP.

MVP filter:
- Server query via search params atau client filter dari payload awal.

No paywall:
- Semua CTA mengarah ke detail/mulai.
- Jangan tampilkan lock/unlock.

### 6.4 Detail Tryout / Before Exam

Data:
- Package by slug.
- Package subtests.
- User attempt history.
- Active attempt if exists.

CTA logic:
- Jika active attempt: `Lanjutkan Tryout`.
- Jika pernah submitted: `Ulangi Tryout`.
- Jika baru: `Mulai Tryout`.

Create attempt:
- POST `/api/attempts` with packageId.
- Server checks package published/open access.
- Server creates or resumes active attempt.
- Redirect `/exam/[attemptId]`.

### 6.5 Exam Room

Client-heavy page.

Initial server fetch:
- Attempt metadata.
- Package info.
- Questions + options.
- Existing answers.
- Server time or attempt timestamps.

Client state:
- currentQuestionIndex.
- selected answers map.
- doubtful flags map.
- autosave status.
- offline queue.
- submit dialog.

Timer:
- `ends_at - now`.
- Prefer server-provided `serverNow` to calculate offset.
- Warning thresholds: <15m, <5m, <1m.
- On zero: auto-submit.

Autosave:
- On answer select: optimistic update local state.
- POST answer route.
- Retry on failure.
- Maintain local queue in memory + localStorage.

Submit:
- Confirmation dialog.
- POST submit route.
- Server calculates score.
- Redirect result.

### 6.6 Result Page

Data:
- Attempt result.
- Subtest scores.
- Topic stats.
- Recommendations.
- Benchmark optional.

CTA:
- `Bahas soal salah`.
- `Latihan [topik] sekarang`.
- `Ulangi tryout`.

### 6.7 Review Page

Data:
- Attempt questions.
- User answers.
- Correct answers.
- Explanation.
- Topic.

Default filter:
- Salah first.
- If no wrong answer: all.

Actions:
- Save question.
- Report question.
- Mark “Saya paham” optional local/MVP later.

---

## 7. API Contract MVP

### POST `/api/attempts`

Request:

```json
{ "packageId": "uuid" }
```

Response:

```json
{ "attemptId": "uuid", "status": "in_progress", "resumed": true }
```

### GET `/api/attempts/[attemptId]`

Response:

```json
{
  "attempt": {},
  "package": {},
  "questions": [],
  "answers": [],
  "serverNow": "2026-05-13T00:00:00.000Z"
}
```

### POST `/api/attempts/[attemptId]/answers`

Request:

```json
{
  "questionId": "uuid",
  "selectedOptionId": "uuid",
  "isMarkedDoubtful": false
}
```

Response:

```json
{ "ok": true, "savedAt": "2026-05-13T00:00:00.000Z" }
```

### POST `/api/attempts/[attemptId]/submit`

Request:

```json
{ "force": false }
```

Response:

```json
{ "ok": true, "resultUrl": "/results/uuid" }
```

### POST `/api/questions/[questionId]/report`

Request:

```json
{ "attemptId": "uuid", "reason": "Pembahasan kurang jelas", "description": "..." }
```

Response:

```json
{ "ok": true }
```

---

## 8. Scoring Implementation

File:
- `lib/scoring/calculateAttemptScore.ts`

Input:
- attempt.
- package passing grades.
- questions.
- options.
- answers.

Output:

```ts
type AttemptScore = {
  totalScore: number
  subtestScores: Record<'TWK' | 'TIU' | 'TKP' | 'SKB', number>
  correctCount: number
  wrongCount: number
  emptyCount: number
  doubtfulCount: number
  isPassed: boolean
  safeScoreGap: number | null
  topicStats: TopicStat[]
}
```

Rules:
- TWK/TIU/SKB: selected correct = +5, else 0.
- TKP: selected option score_value.
- Empty: 0.
- Passing: all configured subtest passing grades met.

Unit tests wajib:
- TWK correct/wrong/empty.
- TIU correct/wrong/empty.
- TKP weighted scores.
- Passing grade all met.
- Passing grade one subtest failed.
- Topic stats order by wrong count.

---

## 9. UX States Implementation

Gunakan `UX_STATES.md` sebagai checklist.

Komponen reusable:
- `Skeleton`.
- `EmptyState`.
- `Banner`.
- `Toast`.
- `OfflineBanner`.
- `AutoSaveStatus`.
- `SubmitConfirmDialog`.

MVP wajib:
- Dashboard empty state.
- Katalog empty/filter empty.
- Detail loading/error.
- Exam autosave.
- Exam offline banner.
- Submit failed.
- Result calculating.
- Review no wrong answers.

---

## 10. Styling Implementation

Konversi design tokens ke Tailwind.

Tailwind colors:

```ts
colors: {
  navy: '#0A0F1E',
  navy2: '#111827',
  navy3: '#1C2333',
  blue: '#2563EB',
  violet: '#7C3AED',
  green: '#10B981',
  amber: '#F59E0B',
  teal: '#14B8A6'
}
```

Reusable classes:
- `glass-card`: bg-white/[0.03] border-white/[0.08] rounded-2xl.
- `top-highlight`: before gradient top line.
- `blue-glow`: radial glow.
- `btn-primary`.
- `btn-ghost`.
- `badge`.

Icons:
- Gunakan `@tabler/icons-react`.

---

## 11. Admin MVP Plan

### Admin package management

Fields:
- title.
- slug.
- description.
- category.
- mode.
- duration.
- total questions.
- difficulty.
- passing grades.
- target safe score.
- status.

Actions:
- Create draft.
- Edit draft.
- Publish.
- Archive.

### Admin question management

Fields:
- subtest.
- topic.
- difficulty.
- scoring type.
- question text.
- options A–E.
- correct answer / score value.
- explanation.
- explanation short.
- status.

Validation:
- TWK/TIU: one correct option.
- TKP: all options score 1–5.
- Explanation required before publish.

### Assign questions

MVP:
- Manual select questions into package.
- Drag/order later.
- Validate package question count before publish.

Import CSV/Excel:
- Ditunda setelah user flow MVP stabil.
- Detail spec: `ADMIN_IMPORT_SPEC.md`.

---

## 12. Implementation Phases

### Phase A — Project bootstrap

Output:
- Next.js app initialized.
- Tailwind configured.
- Supabase env configured.
- Drizzle configured.
- Base layout and design system components.

Tasks:
1. `create-next-app nalarup-app --ts --tailwind --eslint --app`.
2. Install dependencies.
3. Setup Supabase client server/browser.
4. Setup Drizzle schema from `DATABASE_SCHEMA.md`.
5. Setup env example.
6. Create base route groups.

### Phase B — Database & seed

Output:
- Migrations run.
- Seed categories/packages/questions.

Tasks:
1. Implement schema.
2. Create migrations.
3. Seed MVP packages.
4. Seed 30 SKD dummy questions.
5. Seed practice packages.
6. Verify query package detail.

### Phase C — Auth & app shell

Output:
- Register/login working.
- Dashboard protected.
- App shell.

Tasks:
1. Supabase Auth pages.
2. Profile creation hook/handler.
3. Middleware session refresh.
4. AppShell sidebar/topbar.
5. Dashboard new/old state.

### Phase D — Katalog & detail tryout

Output:
- `/tryouts` and `/tryouts/[slug]` working.
- Create/resume attempt.

Tasks:
1. Package queries.
2. Filter/search.
3. Package cards.
4. Detail page.
5. Before exam modal.
6. POST create/resume attempt.

### Phase E — Exam room

Output:
- User can answer and autosave.
- Timer works.
- Submit works.

Tasks:
1. Attempt fetch.
2. ExamShell UI.
3. Timer from `ends_at`.
4. Answer selection.
5. Autosave API.
6. Offline banner/local queue basic.
7. Submit dialog.
8. Submit API + scoring.

### Phase F — Result & review

Output:
- User sees score/result.
- User reviews wrong answers.
- Recommendation generated.

Tasks:
1. Result query.
2. Safe score meter.
3. Subtest score cards.
4. Topic stats.
5. Recommendation cards.
6. Review filters.
7. Save/report question.

### Phase G — Admin MVP

Output:
- Admin can manage package/question.

Tasks:
1. Admin auth guard.
2. Package CRUD.
3. Question CRUD.
4. Options editor.
5. Assign questions.
6. Publish validation.

### Phase H — QA & deploy

Output:
- MVP deployable.

Tasks:
1. Unit tests scoring.
2. E2E tryout flow.
3. Mobile exam QA.
4. Loading/error/offline state smoke test.
5. Vercel deploy.
6. Supabase production project.

---

## 13. Test Plan

### Unit tests

- scoring.
- attempt time calculation.
- create/resume attempt.
- recommendation generation.
- package publish validation.

### Integration tests

- create attempt from package.
- save answers.
- submit attempt.
- calculate result.
- review data assembly.

### E2E tests

1. User register/login.
2. Open catalog.
3. Open package detail.
4. Start tryout.
5. Answer 3 questions.
6. Mark one doubtful.
7. Submit.
8. See result.
9. Open review.

### Manual QA focus

- Mobile exam layout.
- Timer warning colors.
- Refresh during attempt.
- Slow network autosave.
- Dashboard user baru/lama.

---

## 14. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Rules:
- `SUPABASE_SERVICE_ROLE_KEY` only server-side.
- Never expose service role key to client.
- Client uses anon key + RLS.

---

## 15. Security & RLS Checklist

- [ ] All user routes require session.
- [ ] Admin routes require role admin.
- [ ] User can only access own attempts.
- [ ] User can only save answers to own in-progress attempt.
- [ ] User cannot modify submitted attempt.
- [ ] Published packages readable by users.
- [ ] Draft packages admin only.
- [ ] Questions readable only through published package/attempt context.
- [ ] Service role only in server route handlers if needed.

---

## 16. Performance Notes

- Avoid sending correct answer/explanation to exam page before submit.
- Exam page should receive options but not `is_correct` if possible.
- Review page can receive correct answer and explanation.
- Use pagination for katalog when packages grow.
- Use indexed queries for attempts and package questions.
- Consider materialized dashboard summary later.

---

## 17. Content Seed Plan

MVP dummy content:

- 30 questions for SKD Paket Perdana:
  - 10 TWK.
  - 10 TIU.
  - 10 TKP.
- 15 TWK Nasionalisme.
- 15 TIU Logika Dasar.
- 15 TKP Pelayanan Publik.

Each question must include:
- question_text.
- options A–E.
- correct answer or score value.
- explanation.
- explanation_short.
- topic.
- difficulty.

---

## 18. Definition of Done App MVP

MVP selesai jika:

1. Auth works.
2. Dashboard user baru/lama works.
3. Katalog shows published packages.
4. Detail tryout shows rules, composition, and start modal.
5. Attempt creation/resume works.
6. Exam timer uses server timestamps.
7. Autosave works per answer.
8. Refresh restores attempt.
9. Submit calculates score correctly.
10. Result shows safe score meter, passing grade, topic weakness.
11. Review defaults to wrong answers.
12. Recommendation generated after result.
13. Admin can create package/question and publish.
14. All packages in fase awal are open access.
15. Core flow passes E2E test on desktop and mobile.

---

## 19. Immediate Next Commands

Saat siap mulai coding:

```bash
cd /mnt/c/Users/User/Desktop/NalarUp
npx create-next-app@latest nalarup-app --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
cd nalarup-app
npm install @supabase/ssr @supabase/supabase-js drizzle-orm postgres zod react-hook-form @hookform/resolvers @tabler/icons-react
npm install -D drizzle-kit vitest @vitejs/plugin-react playwright
```

Setelah itu:
1. Copy docs ke `nalarup-app/docs/`.
2. Implement Tailwind tokens.
3. Implement `lib/db/schema.ts`.
4. Setup Supabase Auth.
5. Build pages in route order.

---

## 20. Risiko Implementasi

1. Exam room terlalu kompleks.
   - Mitigasi: buat service attempt dan autosave dulu sebelum polish UI.

2. Scoring TKP salah.
   - Mitigasi: unit test weighted scoring.

3. Correct answer bocor ke client saat exam.
   - Mitigasi: query exam tidak select `is_correct` dan `score_value` jika tidak diperlukan untuk tampilan.

4. RLS menghambat route handler.
   - Mitigasi: tentukan jelas kapan pakai anon client vs service role server-side.

5. Dashboard terlalu berat.
   - Mitigasi: MVP query sederhana dulu, materialized view nanti.

6. Admin/import melebar.
   - Mitigasi: admin CRUD manual dulu, import CSV/Excel setelah user flow stabil.
