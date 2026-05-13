import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  attemptAnswers,
  packageQuestions,
  questionOptions,
  questions,
  tryoutPackages,
} from "@/lib/db/schema";

export interface ExamAttempt {
  id: string;
  userId: string;
  packageId: string;
  packageTitle: string;
  packageSlug: string;
  packageMode: "simulation" | "practice";
  status: "in_progress" | "submitted" | "expired" | "cancelled";
  startedAt: Date;
  endsAt: Date;
  submittedAt: Date | null;
  totalQuestions: number;
  passingGradeTotal: number | null;
  durationMinutes: number;
}

export interface ExamQuestion {
  id: string;
  orderNumber: number;
  subtest: "TWK" | "TIU" | "TKP" | "SKB";
  questionText: string;
  scoringType: "single_correct" | "weighted_options";
  options: {
    id: string;
    label: string;
    text: string;
  }[];
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isMarkedDoubtful: boolean;
}

/**
 * Load everything needed to render the exam room for a given attempt.
 * Does NOT expose isCorrect/scoreValue/explanation — those are fetched only
 * at submit time for scoring.
 */
export async function loadExam(
  attemptId: string,
  userId: string
): Promise<{
  attempt: ExamAttempt;
  questions: ExamQuestion[];
  answers: ExamAnswer[];
} | null> {
  const [att] = await db
    .select({
      id: attempts.id,
      userId: attempts.userId,
      packageId: attempts.packageId,
      status: attempts.status,
      startedAt: attempts.startedAt,
      endsAt: attempts.endsAt,
      submittedAt: attempts.submittedAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      packageMode: tryoutPackages.mode,
      totalQuestions: tryoutPackages.totalQuestions,
      passingGradeTotal: tryoutPackages.passingGradeTotal,
      durationMinutes: tryoutPackages.durationMinutes,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)))
    .limit(1);

  if (!att) return null;

  const qRows = await db
    .select({
      id: questions.id,
      subtest: questions.subtest,
      questionText: questions.questionText,
      scoringType: questions.scoringType,
      orderNumber: packageQuestions.orderNumber,
    })
    .from(packageQuestions)
    .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, att.packageId))
    .orderBy(asc(packageQuestions.orderNumber));

  const optRows = await db
    .select({
      id: questionOptions.id,
      questionId: questionOptions.questionId,
      optionLabel: questionOptions.optionLabel,
      optionText: questionOptions.optionText,
      sortOrder: questionOptions.sortOrder,
    })
    .from(questionOptions)
    .innerJoin(questions, eq(questionOptions.questionId, questions.id))
    .innerJoin(packageQuestions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, att.packageId))
    .orderBy(asc(questionOptions.sortOrder));

  const optsByQ = new Map<string, ExamQuestion["options"]>();
  for (const o of optRows) {
    const list = optsByQ.get(o.questionId) ?? [];
    list.push({ id: o.id, label: o.optionLabel, text: o.optionText });
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

  return {
    attempt: {
      id: att.id,
      userId: att.userId,
      packageId: att.packageId,
      packageTitle: att.packageTitle,
      packageSlug: att.packageSlug,
      packageMode: att.packageMode,
      status: att.status,
      startedAt: att.startedAt,
      endsAt: att.endsAt,
      submittedAt: att.submittedAt,
      totalQuestions: att.totalQuestions,
      passingGradeTotal: att.passingGradeTotal,
      durationMinutes: att.durationMinutes,
    },
    questions: qRows.map((q) => ({
      id: q.id,
      orderNumber: q.orderNumber,
      subtest: q.subtest,
      questionText: q.questionText,
      scoringType: q.scoringType,
      options: optsByQ.get(q.id) ?? [],
    })),
    answers: ansRows.map((a) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      isMarkedDoubtful: a.isMarkedDoubtful,
    })),
  };
}
