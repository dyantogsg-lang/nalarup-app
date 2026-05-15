"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  attempts,
  attemptAnswers,
  attemptTopicStats,
  packageQuestions,
  profiles,
  questions,
  questionOptions,
  tryoutPackages,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";
import {
  calculateAttemptScore,
  type AnswerForScoring,
  type OptionForScoring,
  type QuestionForScoring,
} from "@/lib/scoring/calculateAttemptScore";

/**
 * Save or unset an answer for one question in an active attempt.
 *
 * SINGLE-QUERY OPTIMIZATION (Opt #3a):
 * Tadinya 4 query roundtrip (validate attempt → validate question →
 * validate option → upsert). Sekarang 1 raw SQL CTE yang menggabungkan
 * semua validasi + upsert/delete dalam satu transaksi PostgreSQL.
 *
 * Reduksi: 4× query → 1× query. Pada beban 3.000 user concurrent
 * dengan ±70 save/user/sesi, ini drop ~75% load DB & connection pool.
 *
 * Validasi yang tetap di-enforce server-side:
 *  - Attempt milik user, status='in_progress', endsAt > now()
 *  - Question harus ada di package tersebut
 *  - Option (jika non-null) harus milik question itu
 *
 * Idempotent — duplikat panggilan dengan payload sama tidak menambah row.
 */
export async function saveAnswer(input: {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  isMarkedDoubtful: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { profile } = await requireUser();

    const attemptId = input.attemptId;
    const questionId = input.questionId;
    const optionId = input.selectedOptionId;
    const doubt = input.isMarkedDoubtful;
    const userId = profile.id;

    // True empty answer → delete row, but only if validation passes.
    if (optionId === null && !doubt) {
      const result = await db.execute(sql`
        WITH valid AS (
          SELECT a.id
          FROM attempts a
          JOIN package_questions pq
            ON pq.package_id = a.package_id
           AND pq.question_id = ${questionId}::uuid
          WHERE a.id = ${attemptId}::uuid
            AND a.user_id = ${userId}::uuid
            AND a.status = 'in_progress'
            AND a.ends_at > now()
        )
        DELETE FROM attempt_answers
        USING valid
        WHERE attempt_answers.attempt_id = valid.id
          AND attempt_answers.question_id = ${questionId}::uuid
        RETURNING attempt_answers.id
      `);
      // We don't fail if the row didn't exist — that's still a valid no-op.
      // But if `valid` was empty (validation failed), no DELETE ran *and*
      // we want the caller to know. Detect by re-checking attempt state cheap.
      // To keep it strictly 1-query, we accept that genuine empty-state
      // unsets always return ok:true. Validation enforcement still happens
      // when user picks an option (the upsert path below).
      void result;
      return { ok: true };
    }

    // Upsert path — validates attempt + question + option in one CTE.
    const upsert = await db.execute(sql`
      WITH valid AS (
        SELECT a.id AS attempt_id
        FROM attempts a
        JOIN package_questions pq
          ON pq.package_id = a.package_id
         AND pq.question_id = ${questionId}::uuid
        ${optionId
          ? sql`JOIN question_options qo
                  ON qo.id = ${optionId}::uuid
                 AND qo.question_id = ${questionId}::uuid`
          : sql``}
        WHERE a.id = ${attemptId}::uuid
          AND a.user_id = ${userId}::uuid
          AND a.status = 'in_progress'
          AND a.ends_at > now()
      )
      INSERT INTO attempt_answers
        (attempt_id, question_id, selected_option_id, is_marked_doubtful, sync_status, answered_at, updated_at)
      SELECT
        valid.attempt_id,
        ${questionId}::uuid,
        ${optionId}::uuid,
        ${doubt},
        'synced',
        now(),
        now()
      FROM valid
      ON CONFLICT (attempt_id, question_id) DO UPDATE
      SET selected_option_id = EXCLUDED.selected_option_id,
          is_marked_doubtful = EXCLUDED.is_marked_doubtful,
          sync_status = 'synced',
          answered_at = EXCLUDED.answered_at,
          updated_at = EXCLUDED.updated_at
      RETURNING attempt_answers.id
    `);

    // If 0 rows inserted, validation chain failed (attempt invalid/expired,
    // question not in package, or option mismatch). Return generic error —
    // don't leak which constraint failed.
    if (upsert.length === 0) {
      return { ok: false, error: "validation_failed" };
    }

    return { ok: true };
  } catch (e) {
    console.error("saveAnswer failed:", e);
    return { ok: false, error: "unknown" };
  }
}

/**
 * Finalize an attempt: compute total/subtest/topic stats, flag pass/fail,
 * persist everything, then redirect to the result page.
 *
 * Accepts both a submit-by-user flow and a submit-by-timer flow
 * (`reason = 'timeout'`). The DB is the source of truth for expiry.
 */
export async function submitAttempt(
  attemptId: string,
  reason: "user" | "timeout" = "user"
): Promise<never> {
  const { profile } = await requireUser();

  const [att] = await db
    .select({
      id: attempts.id,
      userId: attempts.userId,
      packageId: attempts.packageId,
      status: attempts.status,
      endsAt: attempts.endsAt,
      startedAt: attempts.startedAt,
      slug: tryoutPackages.slug,
      passingGradeTotal: tryoutPackages.passingGradeTotal,
      passingGradeTwk: tryoutPackages.passingGradeTwk,
      passingGradeTiu: tryoutPackages.passingGradeTiu,
      passingGradeTkp: tryoutPackages.passingGradeTkp,
      targetSafeScore: tryoutPackages.targetSafeScore,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, profile.id)))
    .limit(1);

  if (!att) redirect(ROUTES.tryouts);

  // Already submitted → idempotent, just redirect.
  if (att.status === "submitted") {
    redirect(ROUTES.result(att.id));
  }

  // Questions with scoring metadata.
  const qRows = await db
    .select({
      id: questions.id,
      subtest: questions.subtest,
      scoringType: questions.scoringType,
      topicId: questions.topicId,
    })
    .from(questions)
    .innerJoin(packageQuestions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, att.packageId));

  const optRows = await db
    .select({
      id: questionOptions.id,
      questionId: questionOptions.questionId,
      isCorrect: questionOptions.isCorrect,
      scoreValue: questionOptions.scoreValue,
    })
    .from(questionOptions)
    .innerJoin(questions, eq(questionOptions.questionId, questions.id))
    .innerJoin(packageQuestions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, att.packageId));

  const ansRows = await db
    .select({
      questionId: attemptAnswers.questionId,
      selectedOptionId: attemptAnswers.selectedOptionId,
      isMarkedDoubtful: attemptAnswers.isMarkedDoubtful,
    })
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, att.id));

  const qList: QuestionForScoring[] = qRows.map((q) => ({
    id: q.id,
    subtest: q.subtest,
    scoringType: q.scoringType,
    topicId: q.topicId,
  }));

  const optMap = new Map<string, OptionForScoring[]>();
  for (const o of optRows) {
    const list = optMap.get(o.questionId) ?? [];
    list.push({
      id: o.id,
      questionId: o.questionId,
      isCorrect: o.isCorrect,
      scoreValue: o.scoreValue,
    });
    optMap.set(o.questionId, list);
  }

  const ansList: AnswerForScoring[] = ansRows.map((a) => ({
    questionId: a.questionId,
    selectedOptionId: a.selectedOptionId,
    isMarkedDoubtful: a.isMarkedDoubtful,
  }));

  const score = calculateAttemptScore(
    qList,
    optMap,
    ansList,
    {
      total: att.passingGradeTotal,
      twk: att.passingGradeTwk,
      tiu: att.passingGradeTiu,
      tkp: att.passingGradeTkp,
    },
    att.targetSafeScore
  );

  const submittedAt = new Date();
  const finalStatus =
    reason === "timeout" || att.endsAt <= submittedAt ? "expired" : "submitted";

  // Persist attempt result
  await db
    .update(attempts)
    .set({
      status: finalStatus === "expired" ? "submitted" : "submitted", // both expired-by-time and user submit still show as submitted in results list
      submittedAt,
      totalScore: score.totalScore,
      twkScore: score.subtestScores.TWK ?? null,
      tiuScore: score.subtestScores.TIU ?? null,
      tkpScore: score.subtestScores.TKP ?? null,
      skbScore: score.subtestScores.SKB ?? null,
      correctCount: score.correctCount,
      wrongCount: score.wrongCount,
      emptyCount: score.emptyCount,
      doubtfulCount: score.doubtfulCount,
      isPassed: score.isPassed,
      updatedAt: submittedAt,
    })
    .where(eq(attempts.id, att.id));

  // Replace topic stats for this attempt (idempotent on re-submit — though
  // submit is guarded above).
  await db.delete(attemptTopicStats).where(eq(attemptTopicStats.attemptId, att.id));
  if (score.topicStats.length > 0) {
    await db.insert(attemptTopicStats).values(
      score.topicStats.map((s) => ({
        attemptId: att.id,
        topicId: s.topicId,
        subtest: s.subtest,
        totalQuestions: s.totalQuestions,
        correctCount: s.correctCount,
        wrongCount: s.wrongCount,
        emptyCount: s.emptyCount,
      }))
    );
  }

  // Update streak (very lightweight)
  await maybeBumpStreak(profile.id);

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.tryoutDetail(att.slug));
  revalidatePath(ROUTES.history);
  redirect(ROUTES.result(att.id));
}

async function maybeBumpStreak(userId: string) {
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  const [p] = await db
    .select({
      lastActivityDate: profiles.lastActivityDate,
      currentStreak: profiles.currentStreak,
      longestStreak: profiles.longestStreak,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (!p) return;

  let nextStreak = p.currentStreak;
  if (p.lastActivityDate === todayDate) {
    // Already counted today
    return;
  } else if (p.lastActivityDate === yesterdayDate) {
    nextStreak = p.currentStreak + 1;
  } else {
    nextStreak = 1;
  }

  await db
    .update(profiles)
    .set({
      currentStreak: nextStreak,
      longestStreak: Math.max(p.longestStreak, nextStreak),
      lastActivityDate: todayDate,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));
}

/**
 * User-initiated cancel. Marks the attempt as cancelled and sends user back
 * to the tryouts catalog. Only works while in_progress.
 */
export async function cancelAttempt(attemptId: string): Promise<never> {
  const { profile } = await requireUser();

  const [att] = await db
    .select({
      id: attempts.id,
      status: attempts.status,
      slug: tryoutPackages.slug,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, profile.id)))
    .limit(1);

  if (!att) redirect(ROUTES.tryouts);
  if (att.status === "in_progress") {
    await db
      .update(attempts)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(attempts.id, att.id));
  }

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.tryoutDetail(att.slug));
  redirect(ROUTES.tryoutDetail(att.slug));
}
