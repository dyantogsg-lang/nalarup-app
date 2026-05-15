import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  attemptAnswers,
  tryoutPackages,
} from "@/lib/db/schema";
import { getPackageContent } from "@/lib/exam/packageContent";

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

  // Opt #4 — questions + options dari cache (revalidate per package).
  // Loaded paralel dengan answers user supaya tidak nambah waktu.
  const [examQuestions, ansRows] = await Promise.all([
    getPackageContent(att.packageId),
    db
      .select({
        questionId: attemptAnswers.questionId,
        selectedOptionId: attemptAnswers.selectedOptionId,
        isMarkedDoubtful: attemptAnswers.isMarkedDoubtful,
      })
      .from(attemptAnswers)
      .where(eq(attemptAnswers.attemptId, att.id)),
  ]);

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
    questions: examQuestions,
    answers: ansRows.map((a) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      isMarkedDoubtful: a.isMarkedDoubtful,
    })),
  };
}
