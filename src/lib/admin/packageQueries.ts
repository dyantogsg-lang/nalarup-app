import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  tryoutPackages,
  packageSubtests,
  packageQuestions,
  categories,
  questions,
  questionOptions,
} from "@/lib/db/schema";

// ─── List ────────────────────────────────────────────────────────────────────

export interface AdminPackageListItem {
  id: string;
  title: string;
  slug: string;
  mode: "simulation" | "practice";
  status: "draft" | "review" | "published" | "archived";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  totalQuestions: number;
  categoryName: string | null;
  assignedQuestionCount: number;
  updatedAt: Date;
}

export async function listAdminPackages(filter: {
  search?: string;
  status?: string;
  mode?: string;
}): Promise<AdminPackageListItem[]> {
  const whereParts = [];
  if (filter.search) {
    const pattern = `%${filter.search}%`;
    whereParts.push(
      or(ilike(tryoutPackages.title, pattern), ilike(tryoutPackages.slug, pattern))!
    );
  }
  if (filter.status && filter.status !== "all") {
    whereParts.push(eq(tryoutPackages.status, filter.status as "draft"));
  }
  if (filter.mode && filter.mode !== "all") {
    whereParts.push(eq(tryoutPackages.mode, filter.mode as "simulation"));
  }

  const rows = await db
    .select({
      id: tryoutPackages.id,
      title: tryoutPackages.title,
      slug: tryoutPackages.slug,
      mode: tryoutPackages.mode,
      status: tryoutPackages.status,
      difficulty: tryoutPackages.difficulty,
      durationMinutes: tryoutPackages.durationMinutes,
      totalQuestions: tryoutPackages.totalQuestions,
      categoryName: categories.name,
      updatedAt: tryoutPackages.updatedAt,
      assignedQuestionCount: sql<number>`(
        SELECT count(*)::int FROM ${packageQuestions}
        WHERE ${packageQuestions.packageId} = ${tryoutPackages.id}
      )`,
    })
    .from(tryoutPackages)
    .leftJoin(categories, eq(tryoutPackages.categoryId, categories.id))
    .where(whereParts.length ? and(...whereParts) : undefined)
    .orderBy(desc(tryoutPackages.updatedAt));

  return rows;
}

// ─── Detail ──────────────────────────────────────────────────────────────────

export interface AdminPackageDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string | null;
  mode: "simulation" | "practice";
  status: "draft" | "review" | "published" | "archived";
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
    id: string;
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    questionCount: number;
    passingGrade: number | null;
    sortOrder: number;
  }[];
  assignedQuestions: {
    id: string;
    orderNumber: number;
    questionId: string;
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    questionText: string;
    status: string;
  }[];
}

export async function getAdminPackageById(
  id: string
): Promise<AdminPackageDetail | null> {
  const [pkg] = await db.select().from(tryoutPackages).where(eq(tryoutPackages.id, id)).limit(1);
  if (!pkg) return null;
  const subs = await db
    .select()
    .from(packageSubtests)
    .where(eq(packageSubtests.packageId, id))
    .orderBy(asc(packageSubtests.sortOrder));

  const assigned = await db
    .select({
      id: packageQuestions.id,
      orderNumber: packageQuestions.orderNumber,
      questionId: questions.id,
      subtest: questions.subtest,
      questionText: questions.questionText,
      status: questions.status,
    })
    .from(packageQuestions)
    .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, id))
    .orderBy(asc(packageQuestions.orderNumber));

  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    description: pkg.description,
    categoryId: pkg.categoryId,
    mode: pkg.mode,
    status: pkg.status,
    difficulty: pkg.difficulty,
    durationMinutes: pkg.durationMinutes,
    totalQuestions: pkg.totalQuestions,
    isOpenAccess: pkg.isOpenAccess,
    passingGradeTotal: pkg.passingGradeTotal,
    passingGradeTwk: pkg.passingGradeTwk,
    passingGradeTiu: pkg.passingGradeTiu,
    passingGradeTkp: pkg.passingGradeTkp,
    targetSafeScore: pkg.targetSafeScore,
    showRanking: pkg.showRanking,
    subtests: subs.map((s) => ({
      id: s.id,
      subtest: s.subtest,
      questionCount: s.questionCount,
      passingGrade: s.passingGrade,
      sortOrder: s.sortOrder,
    })),
    assignedQuestions: assigned,
  };
}

export async function listAllCategories() {
  return db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
}

// ─── Publish validation ──────────────────────────────────────────────────────

export async function validatePackageForPublish(
  pkg: AdminPackageDetail
): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!pkg.title.trim()) errors.push("Judul wajib diisi.");
  if (!pkg.description.trim()) errors.push("Deskripsi wajib diisi.");
  if (pkg.durationMinutes <= 0) errors.push("Durasi harus lebih dari 0.");
  if (pkg.totalQuestions <= 0) errors.push("Total soal harus lebih dari 0.");

  if (pkg.subtests.length === 0) {
    errors.push("Komposisi subtes belum diisi.");
  } else {
    const sum = pkg.subtests.reduce((s, x) => s + x.questionCount, 0);
    if (sum !== pkg.totalQuestions) {
      errors.push(
        `Total soal komposisi subtes (${sum}) tidak sama dengan total_questions (${pkg.totalQuestions}).`
      );
    }
  }

  if (pkg.assignedQuestions.length !== pkg.totalQuestions) {
    errors.push(
      `Jumlah soal ter-assign (${pkg.assignedQuestions.length}) belum sesuai total_questions (${pkg.totalQuestions}).`
    );
  }

  const unpub = pkg.assignedQuestions.filter((q) => q.status !== "published");
  if (unpub.length > 0) {
    errors.push(`${unpub.length} soal belum published.`);
  }

  // Check that every question has ≥2 options and for single_correct exactly one isCorrect
  if (pkg.assignedQuestions.length > 0) {
    const qids = pkg.assignedQuestions.map((q) => q.questionId);
    const opts = await db
      .select({
        questionId: questionOptions.questionId,
        isCorrect: questionOptions.isCorrect,
        scoreValue: questionOptions.scoreValue,
        scoringType: questions.scoringType,
      })
      .from(questionOptions)
      .innerJoin(questions, eq(questions.id, questionOptions.questionId));
    const byQ = new Map<string, typeof opts>();
    for (const o of opts) {
      if (!qids.includes(o.questionId)) continue;
      const list = byQ.get(o.questionId) ?? [];
      list.push(o);
      byQ.set(o.questionId, list);
    }
    for (const qid of qids) {
      const list = byQ.get(qid) ?? [];
      if (list.length < 2) {
        errors.push(`Soal ${qid.slice(0, 8)}… memiliki < 2 opsi.`);
        continue;
      }
      const stype = list[0]?.scoringType;
      if (stype === "single_correct") {
        const corrects = list.filter((o) => o.isCorrect).length;
        if (corrects !== 1) {
          errors.push(`Soal ${qid.slice(0, 8)}… (single_correct) harus tepat 1 jawaban benar, saat ini ${corrects}.`);
        }
      } else if (stype === "weighted_options") {
        const hasTop = list.some((o) => o.scoreValue === 5);
        if (!hasTop) {
          errors.push(`Soal ${qid.slice(0, 8)}… (weighted_options) harus punya 1 opsi dengan score_value 5.`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
