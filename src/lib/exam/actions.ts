"use server";

import { and, eq } from "drizzle-orm";
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
 * - Validates attempt belongs to user, is in_progress, and not expired.
 * - If selectedOptionId is null, the row is removed (empty answer).
 * - Uses ON CONFLICT so rapid autosaves never race on unique (attempt,question).
 */
export async function saveAnswer(input: {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  isMarkedDoubtful: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { profile } = await requireUser();

    const [att] = await db
      .select({
        id: attempts.id,
        userId: attempts.userId,
        status: attempts.status,
        endsAt: attempts.endsAt,
        packageId: attempts.packageId,
      })
      .from(attempts)
      .where(and(eq(attempts.id, input.attemptId), eq(attempts.userId, profile.id)))
      .limit(1);

    if (!att) return { ok: false, error: "attempt_not_found" };
    if (att.status !== "in_progress") return { ok: false, error: "attempt_closed" };
    if (att.endsAt <= new Date()) return { ok: false, error: "attempt_expired" };

    // Validate the selected option (if any) actually belongs to that question,
    // and the question is part of the package.
    const [q] = await db
      .select({ id: questions.id })
      .from(questions)
      .innerJoin(packageQuestions, eq(packageQuestions.questionId, questions.id))
      .where(
        and(
          eq(questions.id, input.questionId),
          eq(packageQuestions.packageId, att.packageId)
        )
      )
      .limit(1);
    if (!q) return { ok: false, error: "question_not_in_package" };

    if (input.selectedOptionId) {
      const [opt] = await db
        .select({ id: questionOptions.id })
        .from(questionOptions)
        .where(
          and(
            eq(questionOptions.id, input.selectedOptionId),
            eq(questionOptions.questionId, input.questionId)
          )
        )
        .limit(1);
      if (!opt) return { ok: false, error: "option_mismatch" };
    }

    if (input.selectedOptionId === null && !input.isMarkedDoubtful) {
      // Truly empty — remove any existing row.
      await db
        .delete(attemptAnswers)
        .where(
          and(
            eq(attemptAnswers.attemptId, att.id),
            eq(attemptAnswers.questionId, input.questionId)
          )
        );
    } else {
      await db
        .insert(attemptAnswers)
        .values({
          attemptId: att.id,
          questionId: input.questionId,
          selectedOptionId: input.selectedOptionId,
          isMarkedDoubtful: input.isMarkedDoubtful,
          syncStatus: "synced",
          answeredAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [attemptAnswers.attemptId, attemptAnswers.questionId],
          set: {
            selectedOptionId: input.selectedOptionId,
            isMarkedDoubtful: input.isMarkedDoubtful,
            syncStatus: "synced",
            answeredAt: new Date(),
            updatedAt: new Date(),
          },
        });
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
