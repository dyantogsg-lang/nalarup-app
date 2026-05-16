import { db } from "@/lib/db";
import {
  tryoutPackages,
  packageSubtests,
  categories,
  attempts,
} from "@/lib/db/schema";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

export type PackageMode = "simulation" | "practice" | "all";
export type PackageDifficulty = "easy" | "medium" | "hard" | "all";

export interface ListPackagesFilter {
  search?: string;
  categorySlug?: string; // "all" | "skd" | "twk" | ...
  mode?: PackageMode;
  difficulty?: PackageDifficulty;
  userId?: string; // needed to enrich with attempt status
}

export interface CatalogPackage {
  id: string;
  title: string;
  slug: string;
  description: string;
  mode: "simulation" | "practice";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  totalQuestions: number;
  categoryName: string | null;
  categorySlug: string | null;
  passingGradeTotal: number | null;
  // User-specific enrichment
  lastAttemptId: string | null;
  lastAttemptStatus: "in_progress" | "submitted" | "expired" | "cancelled" | null;
  lastAttemptScore: number | null;
  lastAttemptIsPassed: boolean | null;
  attemptCount: number;
}

export async function listPackages(
  filter: ListPackagesFilter
): Promise<CatalogPackage[]> {
  const whereParts = [eq(tryoutPackages.status, "published")];

  if (filter.search && filter.search.trim()) {
    const pattern = `%${filter.search.trim()}%`;
    whereParts.push(
      or(
        ilike(tryoutPackages.title, pattern),
        ilike(tryoutPackages.description, pattern)
      )!
    );
  }

  if (filter.mode && filter.mode !== "all") {
    whereParts.push(eq(tryoutPackages.mode, filter.mode));
  }

  if (filter.difficulty && filter.difficulty !== "all") {
    whereParts.push(eq(tryoutPackages.difficulty, filter.difficulty));
  }

  if (filter.categorySlug && filter.categorySlug !== "all") {
    whereParts.push(eq(categories.slug, filter.categorySlug));
  }

  const rows = await db
    .select({
      id: tryoutPackages.id,
      title: tryoutPackages.title,
      slug: tryoutPackages.slug,
      description: tryoutPackages.description,
      mode: tryoutPackages.mode,
      difficulty: tryoutPackages.difficulty,
      durationMinutes: tryoutPackages.durationMinutes,
      totalQuestions: tryoutPackages.totalQuestions,
      passingGradeTotal: tryoutPackages.passingGradeTotal,
      categoryName: categories.name,
      categorySlug: categories.slug,
      publishedAt: tryoutPackages.publishedAt,
    })
    .from(tryoutPackages)
    .leftJoin(categories, eq(tryoutPackages.categoryId, categories.id))
    .where(and(...whereParts))
    .orderBy(desc(tryoutPackages.publishedAt), asc(tryoutPackages.title));

  if (rows.length === 0) return [];

  // Enrich with user's attempts (latest per package)
  const attemptMap = new Map<
    string,
    {
      latestId: string;
      latestStatus: "in_progress" | "submitted" | "expired" | "cancelled";
      latestScore: number | null;
      latestIsPassed: boolean | null;
      count: number;
    }
  >();

  if (filter.userId) {
    const ids = rows.map((r) => r.id);
    const atts = await db
      .select({
        id: attempts.id,
        packageId: attempts.packageId,
        status: attempts.status,
        totalScore: attempts.totalScore,
        isPassed: attempts.isPassed,
        startedAt: attempts.startedAt,
        submittedAt: attempts.submittedAt,
      })
      .from(attempts)
      .where(
        and(
          eq(attempts.userId, filter.userId),
          inArray(attempts.packageId, ids)
        )
      )
      .orderBy(desc(attempts.startedAt));

    for (const a of atts) {
      const existing = attemptMap.get(a.packageId);
      if (!existing) {
        attemptMap.set(a.packageId, {
          latestId: a.id,
          latestStatus: a.status,
          latestScore: a.totalScore,
          latestIsPassed: a.isPassed,
          count: 1,
        });
      } else {
        existing.count++;
      }
    }
  }

  return rows.map((r) => {
    const att = attemptMap.get(r.id);
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      mode: r.mode,
      difficulty: r.difficulty,
      durationMinutes: r.durationMinutes,
      totalQuestions: r.totalQuestions,
      categoryName: r.categoryName,
      categorySlug: r.categorySlug,
      passingGradeTotal: r.passingGradeTotal,
      lastAttemptId: att?.latestId ?? null,
      lastAttemptStatus: att?.latestStatus ?? null,
      lastAttemptScore: att?.latestScore ?? null,
      lastAttemptIsPassed: att?.latestIsPassed ?? null,
      attemptCount: att?.count ?? 0,
    };
  });
}

export interface PackageDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  mode: "simulation" | "practice";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  totalQuestions: number;
  categoryName: string | null;
  categorySlug: string | null;
  passingGradeTotal: number | null;
  passingGradeTwk: number | null;
  passingGradeTiu: number | null;
  passingGradeTkp: number | null;
  targetSafeScore: number | null;
  subtests: {
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    questionCount: number;
    passingGrade: number | null;
  }[];
  history: {
    id: string;
    status: "in_progress" | "submitted" | "expired" | "cancelled";
    totalScore: number | null;
    isPassed: boolean | null;
    startedAt: Date;
    submittedAt: Date | null;
  }[];
  activeAttempt: { id: string; endsAt: Date } | null;
}

export async function getPackageBySlug(
  slug: string,
  userId?: string
): Promise<PackageDetail | null> {
  const [pkg] = await db
    .select({
      id: tryoutPackages.id,
      title: tryoutPackages.title,
      slug: tryoutPackages.slug,
      description: tryoutPackages.description,
      mode: tryoutPackages.mode,
      difficulty: tryoutPackages.difficulty,
      durationMinutes: tryoutPackages.durationMinutes,
      totalQuestions: tryoutPackages.totalQuestions,
      passingGradeTotal: tryoutPackages.passingGradeTotal,
      passingGradeTwk: tryoutPackages.passingGradeTwk,
      passingGradeTiu: tryoutPackages.passingGradeTiu,
      passingGradeTkp: tryoutPackages.passingGradeTkp,
      targetSafeScore: tryoutPackages.targetSafeScore,
      categoryName: categories.name,
      categorySlug: categories.slug,
      status: tryoutPackages.status,
    })
    .from(tryoutPackages)
    .leftJoin(categories, eq(tryoutPackages.categoryId, categories.id))
    .where(
      and(
        eq(tryoutPackages.slug, slug),
        eq(tryoutPackages.status, "published")
      )
    )
    .limit(1);

  if (!pkg) return null;

  const subs = await db
    .select({
      subtest: packageSubtests.subtest,
      questionCount: packageSubtests.questionCount,
      passingGrade: packageSubtests.passingGrade,
      sortOrder: packageSubtests.sortOrder,
    })
    .from(packageSubtests)
    .where(eq(packageSubtests.packageId, pkg.id))
    .orderBy(asc(packageSubtests.sortOrder));

  let history: PackageDetail["history"] = [];
  let activeAttempt: PackageDetail["activeAttempt"] = null;

  if (userId) {
    const atts = await db
      .select({
        id: attempts.id,
        status: attempts.status,
        totalScore: attempts.totalScore,
        isPassed: attempts.isPassed,
        startedAt: attempts.startedAt,
        submittedAt: attempts.submittedAt,
        endsAt: attempts.endsAt,
      })
      .from(attempts)
      .where(
        and(eq(attempts.userId, userId), eq(attempts.packageId, pkg.id))
      )
      .orderBy(desc(attempts.startedAt))
      .limit(10);

    history = atts.map((a) => ({
      id: a.id,
      status: a.status,
      totalScore: a.totalScore,
      isPassed: a.isPassed,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));

    const running = atts.find(
      (a) => a.status === "in_progress" && a.endsAt > new Date()
    );
    if (running) {
      activeAttempt = { id: running.id, endsAt: running.endsAt };
    }
  }

  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    description: pkg.description,
    mode: pkg.mode,
    difficulty: pkg.difficulty,
    durationMinutes: pkg.durationMinutes,
    totalQuestions: pkg.totalQuestions,
    categoryName: pkg.categoryName,
    categorySlug: pkg.categorySlug,
    passingGradeTotal: pkg.passingGradeTotal,
    passingGradeTwk: pkg.passingGradeTwk,
    passingGradeTiu: pkg.passingGradeTiu,
    passingGradeTkp: pkg.passingGradeTkp,
    targetSafeScore: pkg.targetSafeScore,
    subtests: subs.map((s) => ({
      subtest: s.subtest,
      questionCount: s.questionCount,
      passingGrade: s.passingGrade,
    })),
    history,
    activeAttempt,
  };
}

import { unstable_cache } from "next/cache";

export async function listCategories() {
  return cachedListCategories();
}

const cachedListCategories = unstable_cache(
  () => db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder)),
  ["list-categories"],
  { revalidate: 300 } // 5 minutes — categories rarely change
);

// Keep for potential future pagination; currently unused.
export const COUNT_PACKAGES_SQL = sql<number>`count(*)::int`;
