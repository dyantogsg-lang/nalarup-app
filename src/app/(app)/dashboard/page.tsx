import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { COPY } from "@/lib/constants/copy";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { PageHeader, StatCard, SectionCard, AlertBox } from "@/components/ui";
import { ProgressRing } from "@/components/ui";
import DailyMotivationBanner from "@/components/motivation/DailyMotivationBanner";
import MotivationCarousel from "@/components/landing/MotivationCarousel";

/* ===== CONSTANTS ===== */
const PASSING_GRADE = { twk: 65, tiu: 80, tkp: 166, total: 311 };
const MAX_SCORE = 500;

/* ===== DATA FETCHING ===== */
async function getDashboardData(userId: string) {
  const [stats] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
      submitted: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      inProgress: sql<number>`count(*) filter (where ${attempts.status} = 'in_progress')::int`,
      lastScore: sql<number | null>`(array_agg(${attempts.totalScore} order by ${attempts.submittedAt} desc nulls last))[1]`,
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

  return { stats, lastSubmitted, activeAttempt: activeAttempt[0] ?? null };
}

/* ===== PAGE COMPONENT ===== */
export default async function DashboardPage() {
  const { profile } = await requireUser();
  const firstName = profile.fullName.split(" ")[0];
  const { stats, lastSubmitted, activeAttempt } = await getDashboardData(profile.id);

  const isNewUser = (stats?.totalAttempts ?? 0) === 0;
  const lastScore = stats?.lastScore ?? null;
  const gap = lastScore != null ? PASSING_GRADE.total - lastScore : null;

  const subtitle = isNewUser
    ? "Mulai tryout pertama dan lihat posisimu vs passing grade SKD."
    : gap != null && gap > 0
    ? `Kamu butuh ${gap} poin lagi untuk aman passing grade SKD.`
    : "Skor kamu sudah aman passing grade. Pertahankan!";

  return (
    <div className="mx-auto max-w-[var(--container-lg)] px-4 sm:px-6 pb-8">
      {/* Header with single primary CTA */}
      <PageHeader
        title={`Halo, ${firstName}! 👋`}
        subtitle={subtitle}
        gradient={false}
        action={
          <Link
            href={ROUTES.tryouts}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Mulai Tryout
          </Link>
        }
      />

      {/* Active attempt banner */}
      {activeAttempt && (
        <AlertBox variant="warning" className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div>
              <span className="font-bold text-sm">{activeAttempt.packageTitle}</span>
              <span className="block text-xs opacity-80 mt-0.5">
                {COPY.activeAttempt.banner}
              </span>
            </div>
            <Link
              href={ROUTES.exam(activeAttempt.id)}
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg no-underline whitespace-nowrap"
            >
              Lanjutkan →
            </Link>
          </div>
        </AlertBox>
      )}

      {isNewUser ? (
        <NewUserDashboard />
      ) : (
        <ReturningUserDashboard
          totalAttempts={stats?.totalAttempts ?? 0}
          lastScore={lastScore}
          history={lastSubmitted}
          currentStreak={profile.currentStreak}
          gap={gap}
        />
      )}

      {/* Daily motivation */}
      <div className="mt-6">
        <Suspense fallback={<div className="h-16 rounded-xl bg-[var(--border)] animate-pulse" />}>
          <DailyMotivationBanner compact />
        </Suspense>
      </div>
    </div>
  );
}

/* ===== NEW USER — Onboarding empty state ===== */
function NewUserDashboard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Big onboarding CTA */}
      <SectionCard padding="lg" className="text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(37,99,235,0.06), transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))",
              border: "1px solid rgba(37,99,235,0.15)",
              color: "var(--blue)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>

          <h2
            className="text-xl sm:text-2xl font-bold mb-3"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.025em" }}
          >
            Mulai SKD dasar untuk baca baseline kamu
          </h2>
          <p
            className="text-sm max-w-md mx-auto mb-6"
            style={{ color: "var(--text-muted)", lineHeight: 1.75 }}
          >
            Selesai dalam 100 menit — langsung tahu skor total, gap passing grade,
            dan subtes yang harus kamu fokuskan.
          </p>

          <Link
            href={ROUTES.tryouts}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl no-underline"
          >
            {COPY.cta.startFirstTryout}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </SectionCard>

      {/* Feature info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            ),
            title: "100 menit",
            desc: "Durasi simulasi SKD penuh — identik dengan ujian asli",
            accent: "var(--blue)",
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
            ),
            title: "Analisis langsung",
            desc: "Breakdown skor per subtes setelah selesai",
            accent: "var(--violet)",
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
            ),
            title: "Ulang bebas",
            desc: "Semua paket bisa diulang tanpa batas",
            accent: "var(--green)",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="glass-card p-4 flex gap-3 items-start"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: item.accent }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-bold mb-0.5" style={{ color: item.accent }}>
                {item.title}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== RETURNING USER ===== */
function ReturningUserDashboard({
  totalAttempts,
  lastScore,
  history,
  currentStreak,
  gap,
}: {
  totalAttempts: number;
  lastScore: number | null;
  history: {
    id: string;
    totalScore: number | null;
    isPassed: boolean | null;
    submittedAt: Date | null;
    packageTitle: string;
    packageSlug: string;
    twkScore: number | null;
    tiuScore: number | null;
    tkpScore: number | null;
  }[];
  currentStreak: number;
  gap: number | null;
}) {
  const passedCount = history.filter((h) => h.isPassed).length;
  const passRate = history.length > 0 ? Math.round((passedCount / history.length) * 100) : null;

  // Determine ring color based on gap
  const ringColor =
    gap == null ? "var(--border-focus)" :
    gap <= 0    ? "var(--green)" :
    gap <= 30   ? "var(--amber)" :
                  "var(--danger)";

  // Get real subtest scores from the most recent attempt
  const latestAttempt = history[0] ?? null;
  const subtestScores = latestAttempt
    ? {
        twk: latestAttempt.twkScore,
        tiu: latestAttempt.tiuScore,
        tkp: latestAttempt.tkpScore,
      }
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main grid: Score ring dominant + Stats secondary */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
        {/* Score ring card — dominant visual */}
        <SectionCard padding="lg" className="flex flex-col items-center text-center min-w-[240px]">
          <span
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}
          >
            Skor Terakhir
          </span>

          <ProgressRing
            value={lastScore}
            max={MAX_SCORE}
            size={140}
            strokeWidth={10}
            color={ringColor}
            passingGrade={PASSING_GRADE.total}
            subLabel={`/ ${MAX_SCORE}`}
            className="mb-4"
          />

          {/* Gap indicator */}
          {gap != null ? (
            <div
              className="w-full rounded-xl px-4 py-3 mb-3"
              style={{
                background: gap <= 0 ? "rgba(34,197,94,0.08)" : gap <= 30 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${gap <= 0 ? "rgba(34,197,94,0.15)" : gap <= 30 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`,
              }}
            >
              <div
                className="text-sm font-bold mb-0.5"
                style={{ color: gap <= 0 ? "var(--green)" : gap <= 30 ? "var(--amber)" : "var(--danger)" }}
              >
                {gap <= 0 ? "✓ Aman passing grade" : `+${gap} poin lagi`}
              </div>
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                {gap <= 0 ? "Pertahankan konsistensimu" : gap <= 30 ? "Hampir sampai!" : "Fokus subtes terlemah"}
              </div>
            </div>
          ) : (
            <div
              className="w-full rounded-xl px-4 py-3 mb-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>Belum ada skor</div>
            </div>
          )}

          <div className="text-xs" style={{ color: "var(--text-dim)", lineHeight: 1.6 }}>
            PG SKD: <span className="font-semibold" style={{ color: "var(--text-muted)" }}>{PASSING_GRADE.total}</span>
            <br />
            TWK {PASSING_GRADE.twk} · TIU {PASSING_GRADE.tiu} · TKP {PASSING_GRADE.tkp}
          </div>
        </SectionCard>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 content-start">
          <StatCard
            label="Tryout Selesai"
            value={String(totalAttempts)}
            sub="total sesi"
            accent="blue"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
            }
          />
          <StatCard
            label="Skor Terakhir"
            value={lastScore != null ? String(lastScore) : "—"}
            sub={`PG: ${PASSING_GRADE.total}`}
            accent="violet"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
            }
          />
          <StatCard
            label="Streak"
            value={currentStreak > 0 ? `${currentStreak}h` : "0h"}
            sub="hari berturut"
            accent="green"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
            }
          />
          <StatCard
            label="Tingkat Lulus"
            value={passRate != null ? `${passRate}%` : "—"}
            sub={`${passedCount} dari ${history.length}`}
            accent="amber"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            }
          />
        </div>
      </div>

      {/* Motivasi Harian */}
      <MotivationCarousel />

      {/* Subtest performance — only show if real data available */}
      {subtestScores && (subtestScores.twk != null || subtestScores.tiu != null || subtestScores.tkp != null) && (
        <SectionCard title="Performa Subtes" padding="md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "TWK", score: subtestScores.twk, target: PASSING_GRADE.twk, color: "var(--blue)" },
              { label: "TIU", score: subtestScores.tiu, target: PASSING_GRADE.tiu, color: "var(--violet)" },
              { label: "TKP", score: subtestScores.tkp, target: PASSING_GRADE.tkp, color: "var(--green)" },
            ].map((subtest) => {
              const score = subtest.score ?? 0;
              const safe = score >= subtest.target;
              const pct = Math.min(100, Math.round((score / subtest.target) * 100));
              return (
                <div
                  key={subtest.label}
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-card2)", border: "1px solid var(--border)" }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {subtest.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: subtest.color }}>
                      {score}{" "}
                      <span className="text-xs font-medium" style={{ color: "var(--text-dim)" }}>
                        / {subtest.target}
                      </span>
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden mb-2"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: subtest.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: safe ? "var(--green)" : "var(--amber)" }}>
                    {safe ? "✓ Aman" : `Kurang ${subtest.target - score}`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Fokus perbaiki subtes dengan gap terbesar.
          </p>
        </SectionCard>
      )}

      {/* History list */}
      <SectionCard title="Riwayat Tryout" padding="md">
        <div className="flex justify-between items-center -mt-2 mb-3">
          <span />
          <Link
            href={ROUTES.history}
            className="text-xs font-semibold no-underline"
            style={{ color: "var(--blue)" }}
          >
            Lihat semua →
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)", color: "var(--blue)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
            </div>
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
              Belum ada riwayat
            </div>
            <div className="text-xs" style={{ color: "var(--text-dim)", lineHeight: 1.6 }}>
              Selesaikan tryout pertama untuk melihat analisis.
            </div>
          </div>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            {history.map((h, idx) => {
              const scoreGap = h.totalScore != null ? PASSING_GRADE.total - h.totalScore : null;
              return (
                <li key={h.id}>
                  <Link
                    href={ROUTES.result(h.id)}
                    className="flex justify-between items-center p-3 sm:px-4 rounded-xl no-underline transition-colors"
                    style={{
                      background: "var(--bg-card2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold truncate mb-0.5"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {h.packageTitle}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                          {h.submittedAt
                            ? new Date(h.submittedAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      <span className={`badge ${h.isPassed ? "badge-green" : "badge-red"}`}>
                        {h.totalScore ?? "—"}
                        {h.isPassed ? " ✓" : " ✗"}
                      </span>
                      {scoreGap != null && !h.isPassed && (
                        <span className="text-[0.62rem]" style={{ color: "var(--text-dim)" }}>
                          -{scoreGap} dari PG
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
