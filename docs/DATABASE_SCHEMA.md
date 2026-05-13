# NalarUp — Database Schema v1

> Skema database MVP untuk NalarUp memakai PostgreSQL/Supabase. Fokus: auth user, katalog paket, bank soal, attempt ujian, jawaban, scoring, hasil, rekomendasi latihan, dan admin content workflow.

---

## 1. Prinsip Schema

1. MVP harus mendukung flow penuh:
   `register/login -> katalog -> detail tryout -> create attempt -> jawab soal -> submit -> skor -> hasil -> pembahasan`.
2. Timer selalu dihitung dari server:
   `ends_at = started_at + duration_minutes`.
3. Jawaban harus bisa autosave per soal.
4. TKP harus mendukung skor bertingkat 1–5 per opsi.
5. TWK/TIU memakai single correct.
6. Semua paket fase awal bisa diakses terbuka; tidak perlu paywall enforcement di MVP.
7. Schema tetap menyiapkan field extensible untuk monetisasi nanti, tetapi UI fase awal tidak menonjolkannya.
8. Content harus bisa draft/review/publish.
9. Attempt lama tidak ditimpa saat user mengulang tryout.
10. Semua table utama punya `created_at` dan `updated_at`.

---

## 2. Enum / Domain Values

Rekomendasi enum PostgreSQL:

```sql
create type user_role as enum ('user', 'admin');
create type package_mode as enum ('simulation', 'practice');
create type package_status as enum ('draft', 'review', 'published', 'archived');
create type question_type as enum ('single_choice');
create type question_status as enum ('draft', 'reviewed', 'published', 'archived');
create type subtest_type as enum ('TWK', 'TIU', 'TKP', 'SKB');
create type difficulty_level as enum ('easy', 'medium', 'hard');
create type scoring_type as enum ('single_correct', 'weighted_options');
create type attempt_status as enum ('in_progress', 'submitted', 'expired', 'cancelled');
create type answer_sync_status as enum ('synced', 'pending', 'failed');
create type report_status as enum ('open', 'reviewing', 'resolved', 'rejected');
```

Catatan:
- Jika memakai Drizzle/Prisma, enum bisa dibuat di schema ORM dan dimigrasikan ke PostgreSQL.
- Jika ingin fleksibel untuk Supabase dashboard, enum bisa diganti `text` + check constraint.

---

## 3. Table: profiles

Jika memakai Supabase Auth, user login berada di `auth.users`, lalu profil aplikasi di `public.profiles`.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'user',
  target_exam text,
  onboarding_completed boolean not null default false,
  onboarding_goal text,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Index:

```sql
create index profiles_role_idx on profiles(role);
create index profiles_email_idx on profiles(email);
```

RLS:
- User bisa read/update profil sendiri.
- Admin bisa read semua.

---

## 4. Table: categories

Kategori besar untuk paket dan soal.

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Seed awal:
- SKD
- TWK
- TIU
- TKP
- PPPK
- SKB

---

## 5. Table: tryout_packages

Paket tryout yang muncul di katalog.

```sql
create table tryout_packages (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  mode package_mode not null default 'simulation',
  status package_status not null default 'draft',
  duration_minutes integer not null check (duration_minutes > 0),
  total_questions integer not null check (total_questions > 0),
  difficulty difficulty_level not null default 'easy',
  is_open_access boolean not null default true,
  passing_grade_total integer,
  passing_grade_twk integer,
  passing_grade_tiu integer,
  passing_grade_tkp integer,
  target_safe_score integer,
  show_ranking boolean not null default false,
  published_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Index:

```sql
create index tryout_packages_status_idx on tryout_packages(status);
create index tryout_packages_category_idx on tryout_packages(category_id);
create index tryout_packages_mode_idx on tryout_packages(mode);
create index tryout_packages_open_idx on tryout_packages(is_open_access);
```

Catatan fase awal:
- `is_open_access = true` untuk semua seed awal.
- Tidak perlu field label premium/gratis di UI fase awal.

---

## 6. Table: package_subtests

Komposisi subtes dalam paket. Ini membuat komposisi fleksibel untuk SKD, SKB, PPPK, dan latihan topik.

```sql
create table package_subtests (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references tryout_packages(id) on delete cascade,
  subtest subtest_type not null,
  question_count integer not null check (question_count > 0),
  passing_grade integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(package_id, subtest)
);
```

---

## 7. Table: topics

Topik/subtopik untuk analisis kelemahan dan rekomendasi latihan.

```sql
create table topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  subtest subtest_type,
  name text not null,
  slug text not null unique,
  description text,
  parent_topic_id uuid references topics(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Seed contoh:
- Nasionalisme
- Konstitusi & UUD 1945
- Penalaran Numerik
- Deret Angka
- Pelayanan Publik

---

## 8. Table: questions

Bank soal.

```sql
create table questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  topic_id uuid references topics(id) on delete set null,
  subtest subtest_type not null,
  question_type question_type not null default 'single_choice',
  scoring_type scoring_type not null,
  difficulty difficulty_level not null default 'easy',
  question_text text not null,
  explanation text,
  explanation_short text,
  source_note text,
  status question_status not null default 'draft',
  version integer not null default 1,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (subtest in ('TWK','TIU','SKB') and scoring_type = 'single_correct')
    or (subtest = 'TKP' and scoring_type in ('weighted_options','single_correct'))
  )
);
```

Index:

```sql
create index questions_subtest_idx on questions(subtest);
create index questions_topic_idx on questions(topic_id);
create index questions_status_idx on questions(status);
create index questions_difficulty_idx on questions(difficulty);
```

---

## 9. Table: question_options

Opsi jawaban A–E.

```sql
create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_label text not null check (option_label in ('A','B','C','D','E')),
  option_text text not null,
  is_correct boolean not null default false,
  score_value integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(question_id, option_label)
);
```

Validasi aplikasi/admin:
- TWK/TIU/SKB single correct: tepat 1 opsi `is_correct = true`, score benar biasanya 5.
- TKP weighted: semua opsi punya `score_value` 1–5, `is_correct` opsional false atau opsi terbaik true.

Constraint cross-row seperti “tepat satu jawaban benar” lebih mudah divalidasi di service/admin sebelum publish.

---

## 10. Table: package_questions

Relasi many-to-many antara paket dan soal.

```sql
create table package_questions (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references tryout_packages(id) on delete cascade,
  question_id uuid not null references questions(id) on delete restrict,
  order_number integer not null check (order_number > 0),
  created_at timestamptz not null default now(),
  unique(package_id, question_id),
  unique(package_id, order_number)
);
```

Index:

```sql
create index package_questions_package_idx on package_questions(package_id, order_number);
```

---

## 11. Table: tryout_attempts

Percobaan user mengerjakan paket. Setiap ulangi tryout membuat row baru.

```sql
create table tryout_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  package_id uuid not null references tryout_packages(id) on delete restrict,
  status attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  submitted_at timestamptz,
  duration_seconds integer,
  total_score integer not null default 0,
  twk_score integer not null default 0,
  tiu_score integer not null default 0,
  tkp_score integer not null default 0,
  skb_score integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  empty_count integer not null default 0,
  doubtful_count integer not null default 0,
  is_passed boolean,
  safe_score_gap integer,
  percentile numeric(5,2),
  rank_position integer,
  rank_total integer,
  client_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > started_at)
);
```

Index:

```sql
create index tryout_attempts_user_idx on tryout_attempts(user_id, created_at desc);
create index tryout_attempts_package_idx on tryout_attempts(package_id, created_at desc);
create index tryout_attempts_status_idx on tryout_attempts(status);
create index tryout_attempts_active_idx on tryout_attempts(user_id, status) where status = 'in_progress';
```

Create attempt rule:
- `started_at = now()` dari server.
- `ends_at = now() + duration_minutes * interval '1 minute'`.
- Jika user punya attempt aktif untuk package sama, MVP boleh:
  1. lanjutkan attempt aktif; atau
  2. expire attempt lama lalu buat attempt baru.

Rekomendasi MVP: lanjutkan attempt aktif untuk menghindari attempt ganda.

---

## 12. Table: attempt_answers

Jawaban user per soal. Dipakai autosave.

```sql
create table attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references tryout_attempts(id) on delete cascade,
  question_id uuid not null references questions(id) on delete restrict,
  selected_option_id uuid references question_options(id) on delete restrict,
  is_marked_doubtful boolean not null default false,
  is_correct boolean,
  score_awarded integer not null default 0,
  sync_status answer_sync_status not null default 'synced',
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);
```

Index:

```sql
create index attempt_answers_attempt_idx on attempt_answers(attempt_id);
create index attempt_answers_question_idx on attempt_answers(question_id);
```

Autosave behavior:
- Upsert by `(attempt_id, question_id)`.
- Update `selected_option_id`, `is_marked_doubtful`, `answered_at`, `updated_at`.
- Score boleh dihitung saat submit, bukan tiap save.

---

## 13. Table: attempt_topic_stats

Agregasi kelemahan per attempt dan topik.

```sql
create table attempt_topic_stats (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references tryout_attempts(id) on delete cascade,
  topic_id uuid references topics(id) on delete set null,
  subtest subtest_type not null,
  total_questions integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  empty_count integer not null default 0,
  total_score integer not null default 0,
  priority_rank integer,
  created_at timestamptz not null default now(),
  unique(attempt_id, topic_id, subtest)
);
```

Dipakai untuk:
- Prioritas Belajar Kamu.
- Rekomendasi latihan berikutnya.
- Dashboard user lama.

---

## 14. Table: saved_questions

Soal disimpan user saat review.

```sql
create table saved_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique(user_id, question_id)
);
```

---

## 15. Table: question_reports

Laporan soal dari user.

```sql
create table question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  question_id uuid not null references questions(id) on delete cascade,
  attempt_id uuid references tryout_attempts(id) on delete set null,
  reason text not null,
  description text,
  status report_status not null default 'open',
  admin_note text,
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 16. Table: learning_recommendations

Rekomendasi latihan setelah hasil.

```sql
create table learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source_attempt_id uuid references tryout_attempts(id) on delete cascade,
  recommended_package_id uuid references tryout_packages(id) on delete set null,
  topic_id uuid references topics(id) on delete set null,
  subtest subtest_type,
  title text not null,
  reason text not null,
  priority_rank integer not null default 1,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
```

MVP generation rule:
- Ambil `attempt_topic_stats` dengan wrong_count terbesar.
- Prioritaskan subtest yang belum passing grade.
- Rekomendasikan package mode `practice` dengan topic/subtest yang sama.

---

## 17. Table: user_daily_activity

Untuk streak dan dashboard.

```sql
create table user_daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_date date not null,
  attempts_started integer not null default 0,
  attempts_submitted integer not null default 0,
  questions_answered integer not null default 0,
  minutes_practiced integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, activity_date)
);
```

---

## 18. View: user_dashboard_summary

View untuk dashboard user lama.

```sql
create view user_dashboard_summary as
select
  p.id as user_id,
  p.full_name,
  p.current_streak,
  count(a.id) filter (where a.status = 'submitted') as completed_attempts,
  max(a.created_at) as last_attempt_at,
  avg(a.total_score) filter (where a.status = 'submitted') as average_score,
  (
    select a2.total_score
    from tryout_attempts a2
    where a2.user_id = p.id and a2.status = 'submitted'
    order by a2.submitted_at desc nulls last
    limit 1
  ) as last_score
from profiles p
left join tryout_attempts a on a.user_id = p.id
group by p.id;
```

Catatan:
- Untuk production, materialized view atau query service bisa lebih fleksibel.

---

## 19. Scoring Rules

### TWK/TIU/SKB single correct

- Benar: +5.
- Salah: 0.
- Kosong: 0.
- `is_correct` dari selected option.

### TKP weighted options

- Nilai mengikuti `question_options.score_value`.
- Umumnya 1–5.
- Tidak selalu ada benar/salah absolut.
- Untuk reporting, opsi skor maksimum bisa dianggap optimal.

### Passing grade

Status lulus/aman:
- Jika paket punya passing grade subtes, semua subtes harus memenuhi passing grade.
- `safe_score_gap = target_safe_score - total_score` jika target ada.
- Copy UX memakai “belum aman passing grade” untuk hasil belum lulus.

Pseudo:

```text
for each answer:
  if selected_option is null:
    score = 0
    empty_count++
  else if scoring_type = single_correct:
    score = selected_option.is_correct ? 5 : 0
  else if scoring_type = weighted_options:
    score = selected_option.score_value

sum by subtest
is_passed = all configured subtest passing grades are met
```

---

## 20. RLS Policy Ringkas

### profiles
- User read own profile.
- User update own profile terbatas.
- Admin read all.

### tryout_packages/categories/topics
- Public/authenticated read if `status = published`.
- Admin full CRUD.

### questions/question_options/package_questions
- User read only through published package/attempt.
- Admin full CRUD.

### tryout_attempts
- User read/create own attempts.
- User update own attempt only while `in_progress` for allowed fields.
- Admin read for support/analytics.

### attempt_answers
- User read/upsert answers for own in-progress attempt.
- User read answers for own submitted attempt.
- Admin read for support/analytics.

### reports/saved/recommendations
- User manage own.
- Admin read reports and update report status.

---

## 21. Seed Data MVP

### Categories

```text
SKD, TWK, TIU, TKP, PPPK, SKB
```

### Packages

1. SKD CPNS — Paket Perdana
   - mode: simulation
   - open access: true
   - 30 soal
   - 30 menit
   - TWK 10, TIU 10, TKP 10

2. TWK Nasionalisme Dasar
   - mode: practice
   - open access: true
   - 15 soal
   - 12 menit

3. TIU Logika Dasar
   - mode: practice
   - open access: true
   - 15 soal
   - 15 menit

4. TKP Pelayanan Publik
   - mode: practice
   - open access: true
   - 15 soal
   - 15 menit

5. Simulasi SKD Full 110 Soal
   - mode: simulation
   - open access: true
   - 110 soal
   - 100 menit

---

## 22. Migration Order

1. Enums.
2. profiles.
3. categories.
4. topics.
5. tryout_packages.
6. package_subtests.
7. questions.
8. question_options.
9. package_questions.
10. tryout_attempts.
11. attempt_answers.
12. attempt_topic_stats.
13. saved_questions.
14. question_reports.
15. learning_recommendations.
16. user_daily_activity.
17. views.
18. RLS policies.
19. seed data.

---

## 23. API/Service Functions yang Dibutuhkan

MVP service functions:

1. `getPublishedPackages(filters)`
2. `getPackageDetail(slug)`
3. `createOrResumeAttempt(packageId, userId)`
4. `getAttempt(attemptId, userId)`
5. `saveAttemptAnswer(attemptId, questionId, selectedOptionId, isMarkedDoubtful)`
6. `submitAttempt(attemptId, userId)`
7. `calculateAttemptScore(attemptId)`
8. `getAttemptResult(attemptId, userId)`
9. `getAttemptReview(attemptId, filters)`
10. `generateLearningRecommendations(attemptId)`
11. `getDashboardSummary(userId)`
12. `saveQuestion(userId, questionId)`
13. `reportQuestion(userId, questionId, reason, description)`

---

## 24. Open Questions

1. ORM final: Drizzle atau Prisma?
2. Apakah scoring dihitung di server action, route handler, atau database function?
3. Apakah attempt answers disimpan satu-per-satu via API route atau Supabase client langsung dengan RLS?
4. Apakah ranking anonim dihitung real-time atau batch?
5. Apakah admin import CSV/Excel masuk MVP awal atau setelah flow user selesai?

Rekomendasi awal:
- Next.js + Supabase Auth + PostgreSQL.
- Drizzle untuk type-safe schema/migration jika ingin full control.
- Server-side scoring di route handler/server action agar logic mudah dites.
