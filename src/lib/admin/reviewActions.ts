"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { questions, questionOptions } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/requireAdmin";

/**
 * Approve a question — mark as verified.
 */
export async function approveQuestion(
  id: string,
  notes?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { profile } = await requireAdmin();

  try {
    await db
      .update(questions)
      .set({
        verified: true,
        reviewedBy: profile.id,
        reviewedAt: new Date(),
        reviewNotes: notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id));

    revalidatePath("/admin/review-queue");
    return { ok: true };
  } catch (e) {
    console.error("approveQuestion failed:", e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Reject a question — set status archived & note reason.
 */
export async function rejectQuestion(
  id: string,
  notes: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { profile } = await requireAdmin();

  try {
    await db
      .update(questions)
      .set({
        status: "archived",
        verified: false,
        reviewedBy: profile.id,
        reviewedAt: new Date(),
        reviewNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id));

    revalidatePath("/admin/review-queue");
    return { ok: true };
  } catch (e) {
    console.error("rejectQuestion failed:", e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Edit and approve — update text/options/explanation, mark verified.
 */
export async function editAndApprove(input: {
  id: string;
  questionText?: string;
  explanation?: string;
  explanationShort?: string | null;
  notes?: string;
  options?: { id?: string; text: string; isCorrect?: boolean; scoreValue?: number }[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { profile } = await requireAdmin();

  try {
    const updateFields: Record<string, unknown> = {
      verified: true,
      reviewedBy: profile.id,
      reviewedAt: new Date(),
      reviewNotes: input.notes ?? null,
      updatedBy: profile.id,
      updatedAt: new Date(),
    };
    if (input.questionText !== undefined) updateFields.questionText = input.questionText;
    if (input.explanation !== undefined) updateFields.explanation = input.explanation;
    if (input.explanationShort !== undefined) updateFields.explanationShort = input.explanationShort;

    await db.update(questions).set(updateFields).where(eq(questions.id, input.id));

    if (input.options) {
      // For each option, only update by id if provided
      for (const opt of input.options) {
        if (opt.id) {
          await db
            .update(questionOptions)
            .set({
              optionText: opt.text,
              isCorrect: opt.isCorrect ?? false,
              scoreValue: opt.scoreValue ?? 0,
              updatedAt: new Date(),
            })
            .where(eq(questionOptions.id, opt.id));
        }
      }
    }

    revalidatePath("/admin/review-queue");
    return { ok: true };
  } catch (e) {
    console.error("editAndApprove failed:", e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Bulk approve — useful for batch reviewing TKP soal yang sudah dibaca cepat.
 */
export async function bulkApprove(
  ids: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const { profile } = await requireAdmin();
  if (ids.length === 0) return { ok: true, count: 0 };

  try {
    let count = 0;
    for (const id of ids) {
      await db
        .update(questions)
        .set({
          verified: true,
          reviewedBy: profile.id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(questions.id, id));
      count++;
    }
    revalidatePath("/admin/review-queue");
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
