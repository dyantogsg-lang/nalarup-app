import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { HistoryClient } from "@/components/history/HistoryClient";
import { GlassCard, StatCard, Button3D } from "@/components/ui";

export default async function HistoryPage() {
  const { profile } = await requireUser();

  const history = await db
    .select({
      id: attempts.id,
      totalScore: attempts.totalScore,
      isPassed: attempts.isPassed,
      status: attempts.status,
      submittedAt: attempts.submittedAt,
      startedAt: attempts.startedAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      packageDuration: tryoutPackages.durationMinutes,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.userId, profile.id)))
    .orderBy(desc(attempts.startedAt))
    .limit(50);

  const submitted = history.filter((h) => h.status === "submitted");
  const passedCount = submitted.filter((h) => h.isPassed).length;
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((s, h) => s + (h.totalScore ?? 0), 0) / submitted.length)
      : null;
  const bestScore = submitted.length > 0
    ? Math.max(...submitted.map((h) => h.totalScore ?? 0))
    : null;

  // Calculate current streak (consecutive days with submitted attempts)
  const streakDays = (() => {
    if (submitted.length === 0) return 0;
    const dates = [...new Set(submitted.map((h) => h.submittedAt?.toISOString().slice(0, 10)).filter(Boolean))].sort().reverse();
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]!);
      const curr = new Date(dates[i]!);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  })();

  return (
    <HistoryClient
      history={history.map((h) => ({
        ...h,
        submittedAt: h.submittedAt?.toISOString() ?? null,
        startedAt: h.startedAt.toISOString(),
      }))}
      stats={{
        totalSubmitted: submitted.length,
        avgScore,
        passedCount,
        bestScore,
        streakDays,
      }}
    />
  );
}
