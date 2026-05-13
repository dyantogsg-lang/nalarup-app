"use server";

import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  attempts,
  tryoutPackages,
  packageQuestions,
  questions,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Start a new attempt, or resume the current in-progress attempt, for a
 * given package slug.
 *
 * Rules:
 * - If user has an in_progress attempt that is not yet expired, redirect to it.
 * - If user has an in_progress attempt that IS expired, mark it expired
 *   then fall through to create a new one.
 * - Otherwise, create a fresh attempt with endsAt = now + package.duration_minutes.
 * - Package must be published.
 */
export async function createOrResumeAttempt(slug: string): Promise<never> {
  const { profile } = await requireUser();

  const [pkg] = await db
    .select({
      id: tryoutPackages.id,
      durationMinutes: tryoutPackages.durationMinutes,
      totalQuestions: tryoutPackages.totalQuestions,
      status: tryoutPackages.status,
    })
    .from(tryoutPackages)
    .where(eq(tryoutPackages.slug, slug))
    .limit(1);

  if (!pkg || pkg.status !== "published") {
    redirect(ROUTES.tryouts);
  }

  // Safety: ensure this package actually has questions wired in
  const [pkgQCount] = await db
    .select({ c: packageQuestions.id })
    .from(packageQuestions)
    .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
    .where(
      and(
        eq(packageQuestions.packageId, pkg.id),
        eq(questions.status, "published")
      )
    )
    .limit(1);
  if (!pkgQCount) {
    redirect(ROUTES.tryouts);
  }

  // Look for latest in_progress attempt for this user × package
  const [running] = await db
    .select({
      id: attempts.id,
      endsAt: attempts.endsAt,
      status: attempts.status,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, profile.id),
        eq(attempts.packageId, pkg.id),
        eq(attempts.status, "in_progress")
      )
    )
    .orderBy(desc(attempts.startedAt))
    .limit(1);

  const now = new Date();

  if (running) {
    if (running.endsAt > now) {
      redirect(ROUTES.exam(running.id));
    }
    // Expired — flip status; do not lose the row.
    await db
      .update(attempts)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(attempts.id, running.id));
  }

  const endsAt = new Date(now.getTime() + pkg.durationMinutes * 60_000);

  const [inserted] = await db
    .insert(attempts)
    .values({
      userId: profile.id,
      packageId: pkg.id,
      status: "in_progress",
      startedAt: now,
      endsAt,
    })
    .returning({ id: attempts.id });

  revalidatePath(ROUTES.tryoutDetail(slug));
  revalidatePath(ROUTES.dashboard);

  redirect(ROUTES.exam(inserted.id));
}
