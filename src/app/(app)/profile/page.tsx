import { requireUser } from "@/lib/auth/requireUser";
import { db } from "@/lib/db";
import { attempts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const { profile } = await requireUser();

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      submitted: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      passed: sql<number>`count(*) filter (where ${attempts.isPassed} = true)::int`,
      avgScore: sql<number | null>`round(avg(${attempts.totalScore}) filter (where ${attempts.status} = 'submitted'))::int`,
      bestScore: sql<number | null>`max(${attempts.totalScore}) filter (where ${attempts.status} = 'submitted')`,
    })
    .from(attempts)
    .where(eq(attempts.userId, profile.id));

  return (
    <ProfileClient
      profile={{
        fullName: profile.fullName,
        email: profile.email,
        targetExam: profile.targetExam ?? null,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        createdAt: profile.createdAt.toISOString(),
      }}
      stats={{
        total: stats?.total ?? 0,
        submitted: stats?.submitted ?? 0,
        passed: stats?.passed ?? 0,
        avgScore: stats?.avgScore ?? null,
        bestScore: stats?.bestScore ?? null,
      }}
    />
  );
}
