import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  attemptAnswers,
  attemptTopicStats,
  packageQuestions,
  questionOptions,
  questions,
  tryoutPackages,
  topics,
  savedQuestions,
} from "@/lib/db/schema";

export interface ResultSummary {
  attempt: {
    id: string;
    status: "in_progress" | "submitted" | "expired" | "cancelled";
    totalScore: number | null;
    twkScore: number | null;
    tiuScore: number | null;
    tkpScore: number | null;
    skbScore: number | null;
    correctCount: number | null;
    wrongCount: number | null;
    emptyCount: number | null;
    doubtfulCount: number | null;
    isPassed: boolean | null;
    startedAt: Date;
    submittedAt: Date | null;
    endsAt: Date;
    durationSeconds: number | null;
  };
  pkg: {
    id: string;
    title: string;
    slug: string;
    mode: "simulation" | "practice";
    totalQuestions: number;
    durationMinutes: number;
    passingGradeTotal: number | null;
    passingGradeTwk: number | null;
    passingGradeTiu: number | null;
    passingGradeTkp: number | null;
    targetSafeScore: number | null;
  };
  subtestBreakdown: {
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    questionCount: number;
    score: number;
    passingGrade: number | null;
    isPassed: boolean | null;
  }[];
  topicWeakness: {
    topicId: string | null;
    topicName: string | null;
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
  }[];
}

export async function getAttemptResult(
  attemptId: string,
  userId: string
): Promise<ResultSummary | null> {
  const [row] = await db
    .select({
      id: attempts.id,
      status: attempts.status,
      totalScore: attempts.totalScore,
      twkScore: attempts.twkScore,
      tiuScore: attempts.tiuScore,
      tkpScore: attempts.tkpScore,
      skbScore: attempts.skbScore,
      correctCount: attempts.correctCount,
      wrongCount: attempts.wrongCount,
      emptyCount: attempts.emptyCount,
      doubtfulCount: attempts.doubtfulCount,
      isPassed: attempts.isPassed,
      startedAt: attempts.startedAt,
      submittedAt: attempts.submittedAt,
      endsAt: attempts.endsAt,
      packageId: tryoutPackages.id,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      packageMode: tryoutPackages.mode,
      packageTotalQuestions: tryoutPackages.totalQuestions,
      packageDurationMinutes: tryoutPackages.durationMinutes,
      packagePassingGradeTotal: tryoutPackages.passingGradeTotal,
      packagePassingGradeTwk: tryoutPackages.passingGradeTwk,
      packagePassingGradeTiu: tryoutPackages.passingGradeTiu,
      packagePassingGradeTkp: tryoutPackages.passingGradeTkp,
      packageTargetSafeScore: tryoutPackages.targetSafeScore,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)))
    .limit(1);

  if (!row) return null;

  // subtest composition (question counts per subtest from questions ∈ package)
  const compRows = await db
    .select({
      subtest: questions.subtest,
      cnt: questions.id,
    })
    .from(packageQuestions)
    .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, row.packageId));
  const compMap = new Map<string, number>();
  for (const c of compRows) {
    compMap.set(c.subtest, (compMap.get(c.subtest) ?? 0) + 1);
  }

  const makeSubtest = (
    s: "TWK" | "TIU" | "TKP" | "SKB",
    score: number | null,
    passing: number | null
  ) => ({
    subtest: s,
    questionCount: compMap.get(s) ?? 0,
    score: score ?? 0,
    passingGrade: passing,
    isPassed:
      passing == null || score == null ? null : score >= passing,
  });

  const subtestBreakdown = (
    ["TWK", "TIU", "TKP", "SKB"] as const
  )
    .map((s) =>
      makeSubtest(
        s,
        s === "TWK"
          ? row.twkScore
          : s === "TIU"
          ? row.tiuScore
          : s === "TKP"
          ? row.tkpScore
          : row.skbScore,
        s === "TWK"
          ? row.packagePassingGradeTwk
          : s === "TIU"
          ? row.packagePassingGradeTiu
          : s === "TKP"
          ? row.packagePassingGradeTkp
          : null
      )
    )
    .filter((s) => s.questionCount > 0);

  // topic weakness (joined to topic name where known)
  const topicRows = await db
    .select({
      topicId: attemptTopicStats.topicId,
      topicName: topics.name,
      subtest: attemptTopicStats.subtest,
      totalQuestions: attemptTopicStats.totalQuestions,
      correctCount: attemptTopicStats.correctCount,
      wrongCount: attemptTopicStats.wrongCount,
      emptyCount: attemptTopicStats.emptyCount,
    })
    .from(attemptTopicStats)
    .leftJoin(topics, eq(attemptTopicStats.topicId, topics.id))
    .where(eq(attemptTopicStats.attemptId, attemptId))
    .orderBy(desc(attemptTopicStats.wrongCount));

  const durationSeconds =
    row.submittedAt && row.startedAt
      ? Math.max(
          0,
          Math.floor(
            (new Date(row.submittedAt).getTime() -
              new Date(row.startedAt).getTime()) /
              1000
          )
        )
      : null;

  return {
    attempt: {
      id: row.id,
      status: row.status,
      totalScore: row.totalScore,
      twkScore: row.twkScore,
      tiuScore: row.tiuScore,
      tkpScore: row.tkpScore,
      skbScore: row.skbScore,
      correctCount: row.correctCount,
      wrongCount: row.wrongCount,
      emptyCount: row.emptyCount,
      doubtfulCount: row.doubtfulCount,
      isPassed: row.isPassed,
      startedAt: row.startedAt,
      submittedAt: row.submittedAt,
      endsAt: row.endsAt,
      durationSeconds,
    },
    pkg: {
      id: row.packageId,
      title: row.packageTitle,
      slug: row.packageSlug,
      mode: row.packageMode,
      totalQuestions: row.packageTotalQuestions,
      durationMinutes: row.packageDurationMinutes,
      passingGradeTotal: row.packagePassingGradeTotal,
      passingGradeTwk: row.packagePassingGradeTwk,
      passingGradeTiu: row.packagePassingGradeTiu,
      passingGradeTkp: row.packagePassingGradeTkp,
      targetSafeScore: row.packageTargetSafeScore,
    },
    subtestBreakdown,
    topicWeakness: topicRows,
  };
}

// ─── Review page ────────────────────────────────────────────────────────────

export interface ReviewQuestion {
  orderNumber: number;
  questionId: string;
  subtest: "TWK" | "TIU" | "TKP" | "SKB";
  questionText: string;
  explanation: string | null;
  explanationShort: string | null;
  scoringType: "single_correct" | "weighted_options";
  topicName: string | null;
  userSelectedOptionId: string | null;
  isMarkedDoubtful: boolean;
  isSaved: boolean;
  options: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
    scoreValue: number;
  }[];
  status: "correct" | "wrong" | "empty";
}

export async function getAttemptReview(
  attemptId: string,
  userId: string
): Promise<{
  attempt: { id: string; packageTitle: string; packageSlug: string };
  questions: ReviewQuestion[];
} | null> {
  const [att] = await db
    .select({
      id: attempts.id,
      packageId: attempts.packageId,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)))
    .limit(1);

  if (!att) return null;

  const qRows = await db
    .select({
      orderNumber: packageQuestions.orderNumber,
      questionId: questions.id,
      subtest: questions.subtest,
      questionText: questions.questionText,
      explanation: questions.explanation,
      explanationShort: questions.explanationShort,
      scoringType: questions.scoringType,
      topicName: topics.name,
    })
    .from(packageQuestions)
    .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
    .leftJoin(topics, eq(questions.topicId, topics.id))
    .where(eq(packageQuestions.packageId, att.packageId))
    .orderBy(asc(packageQuestions.orderNumber));

  const optRows = await db
    .select({
      id: questionOptions.id,
      questionId: questionOptions.questionId,
      label: questionOptions.optionLabel,
      text: questionOptions.optionText,
      isCorrect: questionOptions.isCorrect,
      scoreValue: questionOptions.scoreValue,
      sortOrder: questionOptions.sortOrder,
    })
    .from(questionOptions)
    .innerJoin(packageQuestions, eq(packageQuestions.questionId, questionOptions.questionId))
    .where(eq(packageQuestions.packageId, att.packageId))
    .orderBy(asc(questionOptions.sortOrder));

  const optsByQ = new Map<string, ReviewQuestion["options"]>();
  for (const o of optRows) {
    const list = optsByQ.get(o.questionId) ?? [];
    list.push({
      id: o.id,
      label: o.label,
      text: o.text,
      isCorrect: o.isCorrect,
      scoreValue: o.scoreValue,
    });
    optsByQ.set(o.questionId, list);
  }

  const ansRows = await db
    .select({
      questionId: attemptAnswers.questionId,
      selectedOptionId: attemptAnswers.selectedOptionId,
      isMarkedDoubtful: attemptAnswers.isMarkedDoubtful,
    })
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, att.id));
  const ansByQ = new Map<string, (typeof ansRows)[number]>();
  for (const a of ansRows) ansByQ.set(a.questionId, a);

  // saved questions
  const savedRows = await db
    .select({ questionId: savedQuestions.questionId })
    .from(savedQuestions)
    .where(eq(savedQuestions.userId, userId));
  const savedSet = new Set(savedRows.map((s) => s.questionId));

  const out: ReviewQuestion[] = qRows.map((q) => {
    const ans = ansByQ.get(q.questionId);
    const opts = optsByQ.get(q.questionId) ?? [];
    const sel = ans?.selectedOptionId ?? null;
    const correctOpt = opts.find((o) => o.isCorrect);
    const selectedOpt = opts.find((o) => o.id === sel);

    let status: "correct" | "wrong" | "empty" = "empty";
    if (sel && selectedOpt) {
      // single_correct: correct if isCorrect=true; weighted_options: "correct" = top score (5)
      if (q.scoringType === "single_correct") {
        status = selectedOpt.isCorrect ? "correct" : "wrong";
      } else {
        status = selectedOpt.scoreValue === 5 ? "correct" : "wrong";
      }
    }

    // Mark answer option with isCorrect=true for UX; for weighted_options,
    // highlight the top-score option(s).
    if (q.scoringType === "weighted_options") {
      const maxScore = Math.max(...opts.map((o) => o.scoreValue));
      opts.forEach((o) => (o.isCorrect = o.scoreValue === maxScore));
    }

    return {
      orderNumber: q.orderNumber,
      questionId: q.questionId,
      subtest: q.subtest,
      questionText: q.questionText,
      explanation: q.explanation,
      explanationShort: q.explanationShort,
      scoringType: q.scoringType,
      topicName: q.topicName,
      userSelectedOptionId: sel,
      isMarkedDoubtful: ans?.isMarkedDoubtful ?? false,
      isSaved: savedSet.has(q.questionId),
      options: opts,
      status,
    };
    // Suppress unused `correctOpt` warning by referencing it
    void correctOpt;
  });

  return {
    attempt: { id: att.id, packageTitle: att.packageTitle, packageSlug: att.packageSlug },
    questions: out,
  };
}
