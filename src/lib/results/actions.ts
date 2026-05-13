"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { savedQuestions, questionReports, questions } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";

export async function toggleSavedQuestion(
  questionId: string
): Promise<{ ok: true; saved: boolean } | { ok: false; error: string }> {
  try {
    const { profile } = await requireUser();

    // Validate question exists
    const [q] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);
    if (!q) return { ok: false, error: "question_not_found" };

    const [existing] = await db
      .select({ id: savedQuestions.id })
      .from(savedQuestions)
      .where(
        and(
          eq(savedQuestions.userId, profile.id),
          eq(savedQuestions.questionId, questionId)
        )
      )
      .limit(1);

    if (existing) {
      await db.delete(savedQuestions).where(eq(savedQuestions.id, existing.id));
      revalidatePath(ROUTES.saved);
      return { ok: true, saved: false };
    }

    await db
      .insert(savedQuestions)
      .values({ userId: profile.id, questionId })
      .onConflictDoNothing();
    revalidatePath(ROUTES.saved);
    return { ok: true, saved: true };
  } catch (e) {
    console.error("toggleSavedQuestion failed:", e);
    return { ok: false, error: "unknown" };
  }
}

export async function reportQuestion(input: {
  questionId: string;
  attemptId?: string;
  reason: string;
  description?: string;
}): Promise<{ ok: true; reportId: string } | { ok: false; error: string }> {
  try {
    const { profile } = await requireUser();

    if (!input.reason.trim()) {
      return { ok: false, error: "reason_required" };
    }

    const [q] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, input.questionId))
      .limit(1);
    if (!q) return { ok: false, error: "question_not_found" };

    const [row] = await db
      .insert(questionReports)
      .values({
        questionId: input.questionId,
        userId: profile.id,
        attemptId: input.attemptId ?? null,
        reason: input.reason.trim(),
        description: input.description?.trim() || null,
        status: "open",
      })
      .returning({ id: questionReports.id });

    return { ok: true, reportId: row.id };
  } catch (e) {
    console.error("reportQuestion failed:", e);
    return { ok: false, error: "unknown" };
  }
}
