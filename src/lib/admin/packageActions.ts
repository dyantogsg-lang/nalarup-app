"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  tryoutPackages,
  packageSubtests,
  packageQuestions,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  getAdminPackageById,
  validatePackageForPublish,
} from "@/lib/admin/packageQueries";
import { ROUTES } from "@/lib/constants/routes";

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(
  desired: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(desired) || "paket";
  let slug = base;
  for (let i = 2; i <= 50; i++) {
    const [row] = await db
      .select({ id: tryoutPackages.id })
      .from(tryoutPackages)
      .where(
        excludeId
          ? and(eq(tryoutPackages.slug, slug), ne(tryoutPackages.id, excludeId))
          : eq(tryoutPackages.slug, slug)
      )
      .limit(1);
    if (!row) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

// ─── Create / update / delete ───────────────────────────────────────────────

export interface PackageFormInput {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  categoryId: string | null;
  mode: "simulation" | "practice";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  totalQuestions: number;
  isOpenAccess: boolean;
  passingGradeTotal: number | null;
  passingGradeTwk: number | null;
  passingGradeTiu: number | null;
  passingGradeTkp: number | null;
  targetSafeScore: number | null;
  showRanking: boolean;
  subtests: {
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    questionCount: number;
    passingGrade: number | null;
    sortOrder?: number;
  }[];
}

export async function upsertPackage(
  input: PackageFormInput
): Promise<{ ok: true; id: string; slug: string } | { ok: false; error: string }> {
  try {
    const { profile } = await requireAdmin();

    if (!input.title.trim()) return { ok: false, error: "title_required" };
    if (input.durationMinutes <= 0) return { ok: false, error: "duration_invalid" };
    if (input.totalQuestions <= 0) return { ok: false, error: "total_questions_invalid" };

    const slug = await ensureUniqueSlug(input.slug || input.title, input.id);

    if (input.id) {
      await db
        .update(tryoutPackages)
        .set({
          title: input.title,
          slug,
          description: input.description,
          categoryId: input.categoryId,
          mode: input.mode,
          difficulty: input.difficulty,
          durationMinutes: input.durationMinutes,
          totalQuestions: input.totalQuestions,
          isOpenAccess: input.isOpenAccess,
          passingGradeTotal: input.passingGradeTotal,
          passingGradeTwk: input.passingGradeTwk,
          passingGradeTiu: input.passingGradeTiu,
          passingGradeTkp: input.passingGradeTkp,
          targetSafeScore: input.targetSafeScore,
          showRanking: input.showRanking,
          updatedBy: profile.id,
          updatedAt: new Date(),
        })
        .where(eq(tryoutPackages.id, input.id));

      // Replace subtests
      await db.delete(packageSubtests).where(eq(packageSubtests.packageId, input.id));
      if (input.subtests.length > 0) {
        await db.insert(packageSubtests).values(
          input.subtests.map((s, idx) => ({
            packageId: input.id!,
            subtest: s.subtest,
            questionCount: s.questionCount,
            passingGrade: s.passingGrade,
            sortOrder: s.sortOrder ?? idx,
          }))
        );
      }

      revalidatePath("/admin/packages");
      revalidatePath(`/admin/packages/${input.id}/edit`);
      revalidatePath(ROUTES.tryouts);
      revalidatePath(ROUTES.tryoutDetail(slug));
      return { ok: true, id: input.id, slug };
    }

    // Create new
    const [row] = await db
      .insert(tryoutPackages)
      .values({
        title: input.title,
        slug,
        description: input.description,
        categoryId: input.categoryId,
        mode: input.mode,
        status: "draft",
        difficulty: input.difficulty,
        durationMinutes: input.durationMinutes,
        totalQuestions: input.totalQuestions,
        isOpenAccess: input.isOpenAccess,
        passingGradeTotal: input.passingGradeTotal,
        passingGradeTwk: input.passingGradeTwk,
        passingGradeTiu: input.passingGradeTiu,
        passingGradeTkp: input.passingGradeTkp,
        targetSafeScore: input.targetSafeScore,
        showRanking: input.showRanking,
        createdBy: profile.id,
        updatedBy: profile.id,
      })
      .returning({ id: tryoutPackages.id });

    if (input.subtests.length > 0) {
      await db.insert(packageSubtests).values(
        input.subtests.map((s, idx) => ({
          packageId: row.id,
          subtest: s.subtest,
          questionCount: s.questionCount,
          passingGrade: s.passingGrade,
          sortOrder: s.sortOrder ?? idx,
        }))
      );
    }

    revalidatePath("/admin/packages");
    return { ok: true, id: row.id, slug };
  } catch (e) {
    console.error("upsertPackage failed:", e);
    return { ok: false, error: "unknown" };
  }
}

export async function deletePackage(id: string): Promise<never> {
  await requireAdmin();
  await db.delete(tryoutPackages).where(eq(tryoutPackages.id, id));
  revalidatePath("/admin/packages");
  redirect("/admin/packages");
}

export async function setPackageStatus(
  id: string,
  status: "draft" | "review" | "published" | "archived"
): Promise<{ ok: true; status: typeof status } | { ok: false; errors: string[] }> {
  await requireAdmin();

  if (status === "published") {
    const detail = await getAdminPackageById(id);
    if (!detail) return { ok: false, errors: ["Paket tidak ditemukan."] };
    const v = await validatePackageForPublish(detail);
    if (!v.ok) return { ok: false, errors: v.errors };
  }

  await db
    .update(tryoutPackages)
    .set({
      status,
      publishedAt: status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tryoutPackages.id, id));

  revalidatePath("/admin/packages");
  revalidatePath(`/admin/packages/${id}/edit`);
  revalidatePath(ROUTES.tryouts);
  return { ok: true, status };
}

// ─── Assign questions ───────────────────────────────────────────────────────

export async function assignQuestionToPackage(
  packageId: string,
  questionId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  // Determine next order_number
  const existing = await db
    .select({ orderNumber: packageQuestions.orderNumber })
    .from(packageQuestions)
    .where(eq(packageQuestions.packageId, packageId));
  const nextOrder = existing.reduce((m, r) => Math.max(m, r.orderNumber), 0) + 1;

  try {
    await db
      .insert(packageQuestions)
      .values({
        packageId,
        questionId,
        orderNumber: nextOrder,
      })
      .onConflictDoNothing();
    revalidatePath(`/admin/packages/${packageId}/edit`);
    return { ok: true };
  } catch (e) {
    console.error("assignQuestionToPackage failed:", e);
    return { ok: false, error: "unknown" };
  }
}

export async function removeQuestionFromPackage(
  packageId: string,
  questionId: string
): Promise<void> {
  await requireAdmin();
  await db
    .delete(packageQuestions)
    .where(
      and(
        eq(packageQuestions.packageId, packageId),
        eq(packageQuestions.questionId, questionId)
      )
    );
  // Recompact order numbers
  const remaining = await db
    .select({ id: packageQuestions.id, orderNumber: packageQuestions.orderNumber })
    .from(packageQuestions)
    .where(eq(packageQuestions.packageId, packageId));
  remaining.sort((a, b) => a.orderNumber - b.orderNumber);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].orderNumber !== i + 1) {
      await db
        .update(packageQuestions)
        .set({ orderNumber: i + 1 })
        .where(eq(packageQuestions.id, remaining[i].id));
    }
  }
  revalidatePath(`/admin/packages/${packageId}/edit`);
}
