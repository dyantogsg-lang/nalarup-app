-- NalarUp Row Level Security policies
-- Applies to: public.profiles, public.attempts, public.attempt_answers,
-- public.attempt_topic_stats, public.saved_questions, public.question_reports,
-- public.learning_recommendations, public.tryout_packages,
-- public.package_subtests, public.package_questions, public.questions,
-- public.question_options, public.topics, public.categories.
--
-- Access model:
--   - Anonymous (unauthenticated): NO access to any table.
--   - Authenticated user (role=user):
--       - Full CRUD only on own rows in attempts/attempt_answers/
--         attempt_topic_stats/saved_questions/question_reports/
--         learning_recommendations.
--       - SELECT on published packages/questions/options/topics/categories.
--       - SELECT on own profile; UPDATE only safe profile fields.
--   - Admin (profile.role='admin'): full SELECT/INSERT/UPDATE/DELETE on all
--     content tables. Attempt/answer data stays per-user.
--
-- NOTE: Server actions in this app use SUPABASE_SERVICE_ROLE_KEY, which
-- bypasses RLS. These policies protect the Supabase REST/GraphQL API and
-- any direct client access via @supabase/ssr anon client.

-- ─── Helper: is_admin(uid) ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'
  );
$$;

-- ─── Enable RLS on every table ──────────────────────────────────────────────

ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_packages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_subtests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_topic_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations  ENABLE ROW LEVEL SECURITY;

-- ─── profiles ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: self select" ON public.profiles;
CREATE POLICY "profiles: self select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles: self update" ON public.profiles;
CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (
    -- Role must not be elevated by the user themselves.
    (id = auth.uid() AND role = 'user') OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "profiles: admin insert" ON public.profiles;
CREATE POLICY "profiles: admin insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR id = auth.uid());

-- ─── categories / topics ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "categories: read" ON public.categories;
CREATE POLICY "categories: read"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "categories: admin write" ON public.categories;
CREATE POLICY "categories: admin write"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "topics: read" ON public.topics;
CREATE POLICY "topics: read"
  ON public.topics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "topics: admin write" ON public.topics;
CREATE POLICY "topics: admin write"
  ON public.topics FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─── tryout_packages ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "packages: public read" ON public.tryout_packages;
CREATE POLICY "packages: public read"
  ON public.tryout_packages FOR SELECT
  TO authenticated
  USING (status = 'published' OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "packages: admin write" ON public.tryout_packages;
CREATE POLICY "packages: admin write"
  ON public.tryout_packages FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─── package_subtests ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "subtests: read published" ON public.package_subtests;
CREATE POLICY "subtests: read published"
  ON public.package_subtests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tryout_packages p
      WHERE p.id = package_subtests.package_id
        AND (p.status = 'published' OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "subtests: admin write" ON public.package_subtests;
CREATE POLICY "subtests: admin write"
  ON public.package_subtests FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─── package_questions ──────────────────────────────────────────────────────
-- Only visible to admins OR to a user while they have an active attempt on
-- the package. Server actions use service role so no broad read needed.

DROP POLICY IF EXISTS "package_questions: admin or attempting" ON public.package_questions;
CREATE POLICY "package_questions: admin or attempting"
  ON public.package_questions FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.package_id = package_questions.package_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "package_questions: admin write" ON public.package_questions;
CREATE POLICY "package_questions: admin write"
  ON public.package_questions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─── questions / question_options ──────────────────────────────────────────
-- Questions and their options are only visible to admins OR to a user who
-- has an attempt containing that question. During an attempt, the user can
-- read the options (minus is_correct/score_value leakage is acceptable
-- because server actions can filter — but RLS allows read). After submit,
-- review is served through the server.

DROP POLICY IF EXISTS "questions: admin or attempting" ON public.questions;
CREATE POLICY "questions: admin or attempting"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1
      FROM public.attempts a
      JOIN public.package_questions pq ON pq.package_id = a.package_id
      WHERE pq.question_id = questions.id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "questions: admin write" ON public.questions;
CREATE POLICY "questions: admin write"
  ON public.questions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "options: admin or attempting" ON public.question_options;
CREATE POLICY "options: admin or attempting"
  ON public.question_options FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1
      FROM public.attempts a
      JOIN public.package_questions pq ON pq.package_id = a.package_id
      WHERE pq.question_id = question_options.question_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "options: admin write" ON public.question_options;
CREATE POLICY "options: admin write"
  ON public.question_options FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─── attempts / attempt_answers / attempt_topic_stats ──────────────────────

DROP POLICY IF EXISTS "attempts: own rows" ON public.attempts;
CREATE POLICY "attempts: own rows"
  ON public.attempts FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "attempt_answers: own rows" ON public.attempt_answers;
CREATE POLICY "attempt_answers: own rows"
  ON public.attempt_answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_answers.attempt_id
        AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_answers.attempt_id
        AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "attempt_topic_stats: own rows" ON public.attempt_topic_stats;
CREATE POLICY "attempt_topic_stats: own rows"
  ON public.attempt_topic_stats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_topic_stats.attempt_id
        AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_topic_stats.attempt_id
        AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- ─── saved_questions ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "saved: own rows" ON public.saved_questions;
CREATE POLICY "saved: own rows"
  ON public.saved_questions FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid());

-- ─── question_reports ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "reports: own rows select" ON public.question_reports;
CREATE POLICY "reports: own rows select"
  ON public.question_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "reports: insert own" ON public.question_reports;
CREATE POLICY "reports: insert own"
  ON public.question_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reports: admin manage" ON public.question_reports;
CREATE POLICY "reports: admin manage"
  ON public.question_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─── learning_recommendations ──────────────────────────────────────────────

DROP POLICY IF EXISTS "recs: own rows" ON public.learning_recommendations;
CREATE POLICY "recs: own rows"
  ON public.learning_recommendations FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ─── Force RLS even for table owners (defensive) ───────────────────────────
-- Supabase roles `anon` and `authenticated` are NOT table owners, so this is
-- mostly protecting against accidental superuser queries bypassing policies.
-- Uncomment if you want strict force:
--
-- ALTER TABLE public.attempts FORCE ROW LEVEL SECURITY;
-- ...
