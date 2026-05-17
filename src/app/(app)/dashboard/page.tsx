import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { XPBar } from "@/components/ui/XPBar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  DashboardGrid,
  DashboardItem,
  HUDTopBar,
} from "@/components/dashboard/DashboardGrid";

/* ===== CONSTANTS ===== */
const PASSING_GRADE = { twk: 65, tiu: 80, tkp: 166, total: 311 };
const MAX_SCORE = 500;

/* ===== XP / LEVEL SYSTEM ===== */
const XP_PER_TRYOUT = 100;
const XP_PER_PASS = 50; // bonus for passing
const XP_PER_LEVEL = 300;

function calculateLevel(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  return { level, currentXp: currentLevelXp, maxXp: XP_PER_LEVEL };
}

/* ===== DATA FETCHING ===== */
async function getDashboardData(userId: string) {
  const [stats] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
      submitted: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      inProgress: sql<number>`count(*) filter (where ${attempts.status} = 'in_progress')::int`,
      lastScore: sql<number | null>`(array_agg(${attempts.totalScore} order by ${attempts.submittedAt} desc nulls last))[1]`,
      totalPassed: sql<number>`count(*) filter (where ${attempts.isPassed} = true)::int`,
      avgScore: sql<number | null>`round(avg(${attempts.totalScore}) filter (where ${attempts.status} = 'submitted'))::int`,
    })
    .from(attempts)
    .where(eq(attempts.userId, userId));

  const lastSubmitted = await db
    .select({
      id: attempts.id,
      totalScore: attempts.totalScore,
      isPassed: attempts.isPassed,
      submittedAt: attempts.submittedAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      twkScore: attempts.twkScore,
      tiuScore: attempts.tiuScore,
      tkpScore: attempts.tkpScore,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.userId, userId), eq(attempts.status, "submitted")))
    .orderBy(desc(attempts.submittedAt))
    .limit(5);

  const activeAttempt = await db
    .select({
      id: attempts.id,
      endsAt: attempts.endsAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.userId, userId), eq(attempts.status, "in_progress")))
    .orderBy(desc(attempts.startedAt))
    .limit(1);

  // Recommended next tryout (one the user hasn't attempted)
  const recommended = await db
    .select({
      slug: tryoutPackages.slug,
      title: tryoutPackages.title,
    })
    .from(tryoutPackages)
    .where(eq(tryoutPackages.status, "published"))
    .limit(1);

  return {
    stats,
    lastSubmitted,
    activeAttempt: activeAttempt[0] ?? null,
    recommended: recommended[0] ?? null,
  };
}

/* ===== PAGE COMPONENT ===== */
export default async function DashboardPage() {
  const { profile } = await requireUser();
  const firstName = profile.fullName.split(" ")[0];
  const { stats, lastSubmitted, activeAttempt, recommended } =
    await getDashboardData(profile.id);

  const submitted = stats?.submitted ?? 0;
  const totalPassed = stats?.totalPassed ?? 0;
  const lastScore = stats?.lastScore ?? null;
  const avgScore = stats?.avgScore ?? null;
  const gap = lastScore != null ? PASSING_GRADE.total - lastScore : null;

  // XP calculation: each submitted tryout = 100 XP, each pass = +50 XP bonus
  const totalXp = submitted * XP_PER_TRYOUT + totalPassed * XP_PER_PASS;
  const { level, currentXp, maxXp } = calculateLevel(totalXp);

  // Streak status
  const streakStatus: "active" | "at-risk" | "broken" =
    profile.currentStreak >= 3
      ? "active"
      : profile.currentStreak > 0
        ? "at-risk"
        : "broken";

  // Ring color based on gap
  const ringColor =
    gap == null
      ? "var(--border-focus)"
      : gap <= 0
        ? "var(--green)"
        : gap <= 30
          ? "var(--amber)"
          : "var(--danger)";

  // Pass rate
  const passRate =
    lastSubmitted.length > 0
      ? Math.round((totalPassed / submitted) * 100)
      : null;

  return (
    <div className="mx-auto max-w-[var(--container-lg)] px-4 sm:px-6 pb-8">
      {/* ═══ HUD TOP BAR ═══ */}
      <HUDTopBar>
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgba(52,211,153,0.05) 0%, transparent 50%, rgba(124,58,237,0.05) 100%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Level + Username */}
            <div className="flex items-center gap-3">
              <LevelBadge level={level} />
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {firstName}
                </div>
                <div
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-dim)" }}
                >
                  Total XP: {totalXp}
                </div>
              </div>
            </div>

            {/* XP Bar — grows to fill */}
            <div className="flex-1 min-w-0">
              <XPBar current={currentXp} max={maxXp} level={level} />
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-2">
              <StreakBadge count={profile.currentStreak} status={streakStatus} />
            </div>
          </div>
        </div>
      </HUDTopBar>

      {/* ═══ ACTIVE ATTEMPT BANNER ═══ */}
      {activeAttempt && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] backdrop-blur-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                🎮 {activeAttempt.packageTitle}
              </span>
              <span
                className="block text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Ujian sedang berlangsung — lanjutkan sebelum waktu habis!
              </span>
            </div>
            <Link
              href={ROUTES.exam(activeAttempt.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg no-underline bg-amber-500 text-black hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              Lanjutkan →
            </Link>
          </div>
        </div>
      )}

      {/* ═══ BENTO GRID — GAME HUD ═══ */}
      <DashboardGrid>
        {/* ── LARGE CARD: Score Ring ── */}
        <DashboardItem className="sm:col-span-2 row-span-2">
          <GlassCard
            glow={gap != null && gap <= 0 ? "green" : "purple"}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <span
              className="text-[10px] font-bold uppercase tracking-wider mb-4"
              style={{ color: "var(--text-dim)", letterSpacing: "0.08em" }}
            >
              Skor Terakhir
            </span>

            {/* Neon glow ring */}
            <div
              className="relative"
              style={{
                filter:
                  lastScore != null
                    ? `drop-shadow(0 0 12px ${ringColor})`
                    : "none",
              }}
            >
              <ProgressRing
                value={lastScore}
                max={MAX_SCORE}
                size={160}
                strokeWidth={12}
                color={ringColor}
                passingGrade={PASSING_GRADE.total}
                subLabel={`/ ${MAX_SCORE}`}
              />
            </div>

            {/* Pass/Fail status */}
            {lastScore != null && (
              <div className="mt-4">
                {gap != null && gap <= 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    ✓ LULUS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                    ✗ Kurang {gap} poin
                  </span>
                )}
              </div>
            )}

            {lastScore == null && (
              <p
                className="mt-4 text-xs"
                style={{ color: "var(--text-dim)" }}
              >
                Belum ada skor — mulai tryout pertamamu!
              </p>
            )}
          </GlassCard>
        </DashboardItem>

        {/* ── CARD: Daily Challenge / Quick Action ── */}
        <DashboardItem className="sm:col-span-2 lg:col-span-2">
          <GlassCard glow="blue" hoverable className="h-full">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400"
                      aria-hidden="true"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Tantangan Harian
                  </span>
                </div>

                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activeAttempt
                    ? "Selesaikan ujianmu!"
                    : "Kerjakan 1 tryout hari ini"}
                </h3>
                <p
                  className="text-xs mb-4"
                  style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
                >
                  {activeAttempt
                    ? "Kamu punya ujian yang belum selesai. Ayo lanjutkan!"
                    : "Konsistensi adalah kunci. Selesaikan 1 tryout untuk menjaga streak-mu."}
                </p>
              </div>

              <Link
                href={
                  activeAttempt
                    ? ROUTES.exam(activeAttempt.id)
                    : ROUTES.tryouts
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl no-underline bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 w-fit"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {activeAttempt ? "Lanjutkan" : "Mulai Tryout"}
              </Link>
            </div>
          </GlassCard>
        </DashboardItem>

        {/* ── CARD: Streak + Mini Calendar ── */}
        <DashboardItem className="col-span-1">
          <GlassCard glow="orange" className="h-full">
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-dim)" }}
              >
                Streak
              </div>

              {/* Big streak number */}
              <div className="relative mb-2">
                <span
                  className="text-4xl font-black tabular-nums"
                  style={{
                    color: "var(--text-primary)",
                    textShadow:
                      profile.currentStreak > 0
                        ? "0 0 20px rgba(245,158,11,0.3)"
                        : "none",
                  }}
                >
                  {profile.currentStreak}
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                hari berturut-turut
              </span>

              {/* Mini streak dots (last 7 days visual) */}
              <div className="flex gap-1 mt-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background:
                        i < profile.currentStreak
                          ? "rgba(245,158,11,0.7)"
                          : "rgba(255,255,255,0.06)",
                      border:
                        i < profile.currentStreak
                          ? "1px solid rgba(245,158,11,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {profile.longestStreak > 0 && (
                <div
                  className="text-[10px] mt-3"
                  style={{ color: "var(--text-dim)" }}
                >
                  Rekor: {profile.longestStreak} hari
                </div>
              )}
            </div>
          </GlassCard>
        </DashboardItem>

        {/* ── CARD: Quick Stats ── */}
        <DashboardItem className="col-span-1">
          <GlassCard glow="green" className="h-full">
            <div
              className="text-[10px] font-bold uppercase tracking-wider mb-4"
              style={{ color: "var(--text-dim)" }}
            >
              Statistik
            </div>

            <div className="space-y-4">
              {/* Total soal */}
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Total Tryout
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  <AnimatedCounter value={submitted} />
                </div>
              </div>

              {/* Akurasi */}
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Tingkat Lulus
                </div>
                <div className="text-2xl font-bold text-violet-400">
                  <AnimatedCounter
                    value={passRate ?? 0}
                    suffix="%"
                  />
                </div>
              </div>

              {/* Rata-rata skor */}
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Rata-rata Skor
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  <AnimatedCounter value={avgScore ?? 0} />
                </div>
              </div>
            </div>
          </GlassCard>
        </DashboardItem>

        {/* ── CARD: Recent History ── */}
        <DashboardItem className="sm:col-span-2">
          <GlassCard className="h-full">
            <div className="flex justify-between items-center mb-4">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-dim)" }}
              >
                Riwayat Terakhir
              </span>
              <Link
                href={ROUTES.history}
                className="text-[10px] font-semibold no-underline text-blue-400 hover:text-blue-300 transition-colors"
              >
                Lihat semua →
              </Link>
            </div>

            {lastSubmitted.length === 0 ? (
              <div
                className="text-center py-6 text-xs"
                style={{ color: "var(--text-dim)" }}
              >
                Belum ada riwayat. Mulai tryout pertamamu!
              </div>
            ) : (
              <div className="space-y-2">
                {lastSubmitted.slice(0, 3).map((h) => (
                  <Link
                    key={h.id}
                    href={ROUTES.result(h.id)}
                    className="flex items-center justify-between p-3 rounded-xl no-underline transition-all hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pass/fail indicator */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: h.isPassed
                            ? "var(--green)"
                            : "var(--danger)",
                          boxShadow: h.isPassed
                            ? "0 0 8px rgba(34,197,94,0.4)"
                            : "0 0 8px rgba(239,68,68,0.4)",
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {h.packageTitle}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {h.submittedAt
                            ? new Date(h.submittedAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{
                          color: h.isPassed
                            ? "var(--green)"
                            : "var(--text-primary)",
                        }}
                      >
                        {h.totalScore ?? "—"}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-dim)" }}
                      >
                        /{MAX_SCORE}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </DashboardItem>

        {/* ── CARD: Recommended Next Tryout ── */}
        <DashboardItem className="sm:col-span-2">
          <GlassCard glow="purple" hoverable className="h-full">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-violet-400"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Rekomendasi
                  </span>
                </div>

                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {recommended?.title ?? "Jelajahi Tryout"}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
                >
                  {submitted === 0
                    ? "Mulai tryout pertamamu untuk mengukur kemampuan dasar."
                    : "Terus latihan untuk meningkatkan skor dan menjaga konsistensi."}
                </p>
              </div>

              <Link
                href={
                  recommended
                    ? ROUTES.tryoutDetail(recommended.slug)
                    : ROUTES.tryouts
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl no-underline bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 transition-all shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 w-fit mt-4"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Lihat Detail
              </Link>
            </div>
          </GlassCard>
        </DashboardItem>
      </DashboardGrid>
    </div>
  );
}
