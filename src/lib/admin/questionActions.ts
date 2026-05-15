"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { questions, questionOptions, packageQuestions } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { PACKAGE_CONTENT_CACHE_TAG } from "@/lib/exam/packageContent";
import {
  getAdminQuestionById,
  validateQuestionForPublish,
} from "@/lib/admin/questionQueries";

/**
 * Opt #4 — invalidate exam cache untuk semua paket yang memuat question ini.
 * Dipakai setiap kali isi soal/options/status berubah.
 * Pakai updateTag (Next 16) supaya read-your-own-writes dari server action.
 */
async function invalidatePackagesContainingQuestion(questionId: string) {
  const rows = await db
    .select({ packageId: packageQuestions.packageId })
    .from(packageQuestions)
    .where(eq(packageQuestions.questionId, questionId));
  for (const r of rows) updateTag(PACKAGE_CONTENT_CACHE_TAG(r.packageId));
}

export interface QuestionFormInput {
  id?: string;
  questionText: string;
  subtest: "TWK" | "TIU" | "TKP" | "SKB";
  scoringType: "single_correct" | "weighted_options";
  difficulty: "easy" | "medium" | "hard";
  topicId: string | null;
  categoryId: string | null;
  explanation: string | null;
  explanationShort: string | null;
  sourceNote: string | null;
  options: {
    id?: string;
    label: string;
    text: string;
    isCorrect: boolean;
    scoreValue: number;
    sortOrder?: number;
  }[];
}

export async function upsertQuestion(
  input: QuestionFormInput
): Promise<
  | { ok: true; id: string }
  | { ok: false; errors: string[] }
> {
  const errors: string[] = [];
  if (!input.questionText.trim()) errors.push("Teks soal wajib diisi.");
  if (input.options.length < 2) errors.push("Minimal 2 opsi.");
  if (input.scoringType === "single_correct") {
    const corrects = input.options.filter((o) => o.isCorrect).length;
    if (corrects !== 1)
      errors.push(`Single correct harus tepat 1 jawaban benar (saat ini ${corrects}).`);
  } else {
    if (!input.options.some((o) => o.scoreValue === 5))
      errors.push("Weighted options butuh opsi dengan skor 5.");
  }

  const labels = input.options.map((o) => o.label.trim().toUpperCase());
  if (new Set(labels).size !== labels.length) {
    errors.push("Label opsi tidak boleh duplikat.");
  }
  if (labels.some((l) => !l)) errors.push("Label opsi tidak boleh kosong.");

  if (errors.length > 0) return { ok: false, errors };

  const { profile } = await requireAdmin();

  try {
    if (input.id) {
      await db
        .update(questions)
        .set({
          questionText: input.questionText,
          subtest: input.subtest,
          scoringType: input.scoringType,
          difficulty: input.difficulty,
          topicId: input.topicId,
          categoryId: input.categoryId,
          explanation: input.explanation,
          explanationShort: input.explanationShort,
          sourceNote: input.sourceNote,
          updatedBy: profile.id,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, input.id));

      // Replace options wholesale — simpler than diffing labels
      await db.delete(questionOptions).where(eq(questionOptions.questionId, input.id));
      await db.insert(questionOptions).values(
        input.options.map((o, idx) => ({
          questionId: input.id!,
          optionLabel: o.label.toUpperCase(),
          optionText: o.text,
          isCorrect: input.scoringType === "single_correct" ? o.isCorrect : false,
          scoreValue:
            input.scoringType === "weighted_options"
              ? Math.min(5, Math.max(1, o.scoreValue))
              : o.isCorrect
              ? 5
              : 0,
          sortOrder: o.sortOrder ?? idx,
        }))
      );

      revalidatePath("/admin/questions");
      revalidatePath(`/admin/questions/${input.id}/edit`);
      // Opt #4 — bust cache di semua paket yang mengandung soal ini.
      await invalidatePackagesContainingQuestion(input.id);
      return { ok: true, id: input.id };
    }

    const [row] = await db
      .insert(questions)
      .values({
        questionText: input.questionText,
        subtest: input.subtest,
        scoringType: input.scoringType,
        difficulty: input.difficulty,
        topicId: input.topicId,
        categoryId: input.categoryId,
        explanation: input.explanation,
        explanationShort: input.explanationShort,
        sourceNote: input.sourceNote,
        status: "draft",
        createdBy: profile.id,
        updatedBy: profile.id,
      })
      .returning({ id: questions.id });

    await db.insert(questionOptions).values(
      input.options.map((o, idx) => ({
        questionId: row.id,
        optionLabel: o.label.toUpperCase(),
        optionText: o.text,
        isCorrect: input.scoringType === "single_correct" ? o.isCorrect : false,
        scoreValue:
          input.scoringType === "weighted_options"
            ? Math.min(5, Math.max(1, o.scoreValue))
            : o.isCorrect
            ? 5
            : 0,
        sortOrder: o.sortOrder ?? idx,
      }))
    );

    revalidatePath("/admin/questions");
    return { ok: true, id: row.id };
  } catch (e) {
    console.error("upsertQuestion failed:", e);
    return { ok: false, errors: ["unknown"] };
  }
}

export async function deleteQuestion(id: string): Promise<never> {
  await requireAdmin();
  // Opt #4 — invalidate paket sebelum hapus, supaya tag list masih bisa di-resolve.
  await invalidatePackagesContainingQuestion(id);
  await db.delete(questions).where(eq(questions.id, id));
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function setQuestionStatus(
  id: string,
  status: "draft" | "reviewed" | "published" | "archived"
): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  await requireAdmin();

  if (status === "published") {
    const q = await getAdminQuestionById(id);
    if (!q) return { ok: false, errors: ["Soal tidak ditemukan."] };
    const v = validateQuestionForPublish(q);
    if (!v.ok) return { ok: false, errors: v.errors };
  }

  await db
    .update(questions)
    .set({ status, updatedAt: new Date() })
    .where(eq(questions.id, id));

  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${id}/edit`);
  // Opt #4 — status berubah (publish/archive) → bust cache paket.
  await invalidatePackagesContainingQuestion(id);
  return { ok: true };
}
