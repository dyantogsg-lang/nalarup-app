import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { COPY } from "@/lib/constants/copy";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import DailyMotivationBanner from "@/components/motivation/DailyMotivationBanner";

/* ===== SVG ICON COMPONENTS ===== */
const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
);
const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconFlame = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);
const IconCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const IconRocket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
);
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

// Passing grade SKD CASN default
const PASSING_GRADE = { twk: 65, tiu: 80, tkp: 166, total: 311 };

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const firstName = profile.fullName.split(" ")[0];

  const [stats] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
      submitted: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      inProgress: sql<number>`count(*) filter (where ${attempts.status} = 'in_progress')::int`,
      lastScore: sql<number | null>`(array_agg(${attempts.totalScore} order by ${attempts.submittedAt} desc nulls last))[1]`,
    })
    .from(attempts)
    .where(eq(attempts.userId, profile.id));

  const lastSubmitted = await db
    .select({
      id: attempts.id,
      totalScore: attempts.totalScore,
      isPassed: attempts.isPassed,
      submittedAt: attempts.submittedAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      packageDuration: tryoutPackages.durationMinutes,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.userId, profile.id), eq(attempts.status, "submitted")))
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
    .where(and(eq(attempts.userId, profile.id), eq(attempts.status, "in_progress")))
    .orderBy(desc(attempts.startedAt))
    .limit(1);

  const isNewUser = (stats?.totalAttempts ?? 0) === 0;
  const active = activeAttempt[0];
  const lastScore = stats?.lastScore ?? null;
  const gap = lastScore != null ? PASSING_GRADE.total - lastScore : null;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 1rem" }}>

      {/* ===== HEADER ===== */}
      <div style={{
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.4rem",
            letterSpacing: "-0.03em",
          }}>
            Welcome, {firstName}! <span aria-hidden="true">👋</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
            {isNewUser
              ? "Mulai tryout pertama dan lihat posisimu vs passing grade SKD."
              : gap != null && gap > 0
              ? `Kamu butuh ${gap} poin lagi untuk aman passing grade SKD.`
              : "Skor kamu sudah aman passing grade. Pertahankan!"}
          </p>
        </div>
        <Link href={ROUTES.tryouts}>
          <button className="btn-primary" style={{
            padding: "0.7rem 1.5rem",
            fontSize: "0.88rem",
            cursor: "pointer",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Mulai Tryout
          </button>
        </Link>
      </div>

      {/* ===== ACTIVE ATTEMPT BANNER ===== */}
      {active && (
        <div style={{
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "0.75rem",
            background: "rgba(245,158,11,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--amber)",
            flexShrink: 0,
          }}>
            <IconPlay />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: "var(--text-primary)", fontSize: "0.92rem", fontWeight: 700 }}>
              {active.packageTitle}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.15rem" }}>
              {COPY.activeAttempt.banner}
            </div>
          </div>
          <Link href={ROUTES.exam(active.id)}>
            <button className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem", cursor: "pointer", borderRadius: "0.625rem" }}>
              Lanjutkan →
            </button>
          </Link>
        </div>
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
      <div style={{ marginTop: "1.5rem" }}>
        <DailyMotivationBanner />
      </div>
    </div>
  );
}

/* ===== NEW USER — Onboarding empty state ===== */
function NewUserDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Big onboarding CTA */}
      <div style={{
        padding: "3.5rem 2rem",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.04))",
        border: "1px solid rgba(37,99,235,0.12)",
        borderRadius: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 360,
          height: 240,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.08), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: 72,
            height: 72,
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
            borderRadius: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.75rem",
            border: "1px solid rgba(37,99,235,0.15)",
            color: "var(--blue)",
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>

          <h2 style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
            letterSpacing: "-0.025em",
            lineHeight: 1.3,
          }}>
            Mulai SKD dasar untuk baca baseline kamu
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "0.92rem",
            maxWidth: 440,
            margin: "0 auto 2rem",
            lineHeight: 1.75,
          }}>
            Selesai dalam 100 menit — langsung tahu skor total, gap passing grade, dan subtes yang harus kamu fokuskan.
          </p>

          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.85rem 2.25rem", cursor: "pointer", borderRadius: "0.75rem" }}>
              Mulai SKD Dasar
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Info cards — 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {[
          {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            title: "100 menit",
            desc: "Durasi simulasi SKD penuh — identik dengan ujian asli",
            accent: "var(--blue)",
            bg: "rgba(37,99,235,0.06)",
          },
          {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
            title: "Analisis langsung",
            desc: "Breakdown skor per subtes setelah selesai",
            accent: "var(--violet)",
            bg: "rgba(124,58,237,0.06)",
          },
          {
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
            title: "Ulang bebas",
            desc: "Semua paket bisa diulang tanpa batas",
            accent: "var(--green)",
            bg: "rgba(34,197,94,0.06)",
          },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "1.5rem",
            background: item.bg,
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "0.75rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: item.accent,
              flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: item.accent, marginBottom: "0.35rem" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
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
  }[];
  currentStreak: number;
  gap: number | null;
}) {
  const passedCount = history.filter((h) => h.isPassed).length;
  const passRate = history.length > 0 ? Math.round((passedCount / history.length) * 100) : null;

  // Progress ring calc
  const MAX_SCORE = 500;
  const scorePercent = lastScore != null ? Math.min((lastScore / MAX_SCORE) * 100, 100) : 0;
  const RADIUS = 42;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (scorePercent / 100) * CIRCUMFERENCE;

  const ringColor =
    gap == null ? "var(--border-focus)" :
    gap <= 0    ? "var(--green)" :
    gap <= 30   ? "var(--amber)" :
                  "var(--danger)";

  const pgPercent = Math.min((PASSING_GRADE.total / MAX_SCORE) * 100, 100);
  const pgDashOffset = CIRCUMFERENCE - (pgPercent / 100) * CIRCUMFERENCE;

  // Mini sparkline bars (fake trend from history scores)
  const sparkData = history.slice(0, 5).reverse().map(h => h.totalScore ?? 0);

  const statCards = [
    { label: "Tryout Selesai", value: String(totalAttempts), accent: "var(--blue)", bg: "rgba(37,99,235,0.06)", icon: <IconClipboard />, sub: "total sesi" },
    { label: "Skor Terakhir", value: lastScore != null ? String(lastScore) : "—", accent: "var(--violet)", bg: "rgba(124,58,237,0.06)", icon: <IconTarget />, sub: `PG: ${PASSING_GRADE.total}` },
    { label: "Streak", value: currentStreak > 0 ? `${currentStreak}h` : "0h", accent: "var(--green)", bg: "rgba(34,197,94,0.06)", icon: <IconFlame />, sub: "hari berturut" },
    { label: "Pass Rate", value: passRate != null ? `${passRate}%` : "—", accent: "var(--amber)", bg: "rgba(245,158,11,0.06)", icon: <IconCheckCircle />, sub: `${passedCount} dari ${history.length}` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ===== STAT CARDS with mini sparkline ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            padding: "1.5rem",
            background: s.bg,
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "0.75rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.accent,
              }}>
                {s.icon}
              </div>
              <span style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}>
                {s.label}
              </span>
            </div>
            <div className="num" style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: "0.4rem",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 500 }}>
              {s.sub}
            </div>
            {/* Mini sparkline bars */}
            <div style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              height: 28,
              opacity: 0.4,
            }}>
              {[35, 55, 45, 70, 60].map((h, i) => (
                <div key={i} style={{
                  width: 4,
                  height: `${h}%`,
                  borderRadius: 2,
                  background: s.accent,
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <Link href={ROUTES.tryouts} style={{ textDecoration: "none" }}>
          <div style={{
            padding: "1.25rem 1.5rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            cursor: "pointer",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "0.75rem",
              background: "rgba(37,99,235,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--blue)",
            }}>
              <IconPlay />
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>Lanjut Tryout</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.15rem" }}>Pilih paket baru</div>
            </div>
          </div>
        </Link>
        <Link href={history.length > 0 ? ROUTES.result(history[0].id) : ROUTES.history} style={{ textDecoration: "none" }}>
          <div style={{
            padding: "1.25rem 1.5rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            cursor: "pointer",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "0.75rem",
              background: "rgba(124,58,237,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--violet)",
            }}>
              <IconFileText />
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>Review Soal</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.15rem" }}>Lihat pembahasan</div>
            </div>
          </div>
        </Link>
        <Link href={ROUTES.history} style={{ textDecoration: "none" }}>
          <div style={{
            padding: "1.25rem 1.5rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            cursor: "pointer",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "0.75rem",
              background: "rgba(34,197,94,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--green)",
            }}>
              <IconBarChart />
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>Lihat Analisis</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.15rem" }}>Trend skor kamu</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ===== MAIN GRID: Score ring + Subtes + History ===== */}
      <div className="dash-main-grid" style={{
        display: "grid",
        gridTemplateColumns: "280px 280px 1fr",
        gap: "1.25rem",
      }}>

        {/* Progress ring card */}
        <div style={{
          padding: "2rem 1.5rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            Skor Terakhir
          </div>

          {/* SVG Ring */}
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: "1.5rem" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
              <circle
                cx="60" cy="60" r={RADIUS}
                fill="none"
                strokeWidth="9"
                stroke="var(--border)"
              />
              <circle
                cx="60" cy="60" r={RADIUS}
                fill="none"
                strokeWidth="2"
                stroke="rgba(34,197,94,0.2)"
                strokeDasharray={`2 ${(CIRCUMFERENCE - 2)}`}
                strokeDashoffset={pgDashOffset}
                strokeLinecap="round"
              />
              <circle
                cx="60" cy="60" r={RADIUS}
                fill="none"
                strokeWidth="9"
                stroke={ringColor}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={lastScore != null ? dashOffset : CIRCUMFERENCE}
                strokeLinecap="round"
              />
            </svg>
            <div className="num" style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.1rem",
            }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                {lastScore ?? "—"}
              </span>
              {lastScore != null && (
                <span style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontWeight: 500 }}>
                  / {MAX_SCORE}
                </span>
              )}
            </div>
          </div>

          {/* Gap label */}
          {gap != null ? (
            <div style={{
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              background: gap <= 0 ? "rgba(34,197,94,0.08)" : gap <= 30 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${gap <= 0 ? "rgba(34,197,94,0.15)" : gap <= 30 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`,
              marginBottom: "1rem",
              width: "100%",
            }}>
              <div className="num" style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: gap <= 0 ? "var(--green)" : gap <= 30 ? "var(--amber)" : "var(--danger)",
                marginBottom: "0.2rem",
              }}>
                {gap <= 0 ? "✓ Aman passing grade" : `+${gap} poin lagi`}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                {gap <= 0 ? "Pertahankan konsistensimu" : gap <= 30 ? "Hampir sampai!" : "Fokus subtes terlemah"}
              </div>
            </div>
          ) : (
            <div style={{
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              marginBottom: "1rem",
              width: "100%",
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Belum ada skor</div>
            </div>
          )}

          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            PG SKD: <span className="num" style={{ color: "var(--text-muted)", fontWeight: 600 }}>{PASSING_GRADE.total}</span>
            <br />
            <span>TWK {PASSING_GRADE.twk} · TIU {PASSING_GRADE.tiu} · TKP {PASSING_GRADE.tkp}</span>
          </div>

          <Link href={ROUTES.tryouts} style={{ width: "100%" }}>
            <button className="btn-primary" style={{ width: "100%", padding: "0.7rem", fontSize: "0.85rem", cursor: "pointer", borderRadius: "0.625rem" }}>
              Tryout Lagi
            </button>
          </Link>
        </div>

        {/* Performa Subtes card */}
        <div style={{
          padding: "1.75rem 1.5rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "1.25rem" }}>
            Performa Subtes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "TWK", score: lastScore != null ? Math.round((lastScore / PASSING_GRADE.total) * PASSING_GRADE.twk) : 0, target: PASSING_GRADE.twk, color: "var(--blue)" },
              { label: "TIU", score: lastScore != null ? Math.round((lastScore / PASSING_GRADE.total) * PASSING_GRADE.tiu) : 0, target: PASSING_GRADE.tiu, color: "var(--violet)" },
              { label: "TKP", score: lastScore != null ? Math.round((lastScore / PASSING_GRADE.total) * PASSING_GRADE.tkp) : 0, target: PASSING_GRADE.tkp, color: "var(--green)" },
            ].map((subtest) => {
              const safe = subtest.score >= subtest.target;
              const pct = Math.min(100, Math.round((subtest.score / subtest.target) * 100));
              return (
                <div key={subtest.label} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.875rem",
                  padding: "1rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>{subtest.label}</span>
                    <span className="num" style={{ fontSize: "0.82rem", fontWeight: 700, color: subtest.color }}>
                      {subtest.score} <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", fontWeight: 500 }}>/ {subtest.target}</span>
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden", marginBottom: "0.5rem" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: subtest.color, transition: "width 300ms ease" }} />
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: safe ? "var(--green)" : "var(--amber)" }}>
                    {safe ? "✓ Aman" : `Kurang ${subtest.target - subtest.score}`}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: "1.25rem", color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.6 }}>
            Fokus perbaiki subtes dengan gap terbesar.
          </p>
        </div>

        {/* History list card */}
        <div style={{
          padding: "1.75rem 1.5rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}>
            <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Riwayat Tryout
            </h3>
            <Link href={ROUTES.history} style={{
              fontSize: "0.75rem",
              color: "var(--blue)",
              textDecoration: "none",
              fontWeight: 600,
            }}>
              Lihat semua →
            </Link>
          </div>

          {history.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              textAlign: "center",
              gap: "0.75rem",
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: "1rem",
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--blue)",
              }}>
                <IconClipboard />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                  Belum ada riwayat
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 260 }}>
                  Selesaikan tryout pertama untuk melihat analisis.
                </div>
              </div>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {history.slice(0, 5).map((h, idx) => {
                const scoreGap = h.totalScore != null ? PASSING_GRADE.total - h.totalScore : null;
                return (
                  <li key={h.id}>
                    <Link href={ROUTES.result(h.id)} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.875rem 1rem",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.875rem",
                      textDecoration: "none",
                      transition: "border-color 150ms ease",
                      cursor: "pointer",
                      gap: "0.75rem",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        <div className="num" style={{
                          width: 28,
                          height: 28,
                          borderRadius: "0.5rem",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          color: "var(--text-dim)",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            color: "var(--text-primary)",
                            fontSize: "0.84rem",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: "0.15rem",
                          }}>
                            {h.packageTitle}
                          </div>
                          <div style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>
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
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
                        <span className={`badge ${h.isPassed ? "badge-green" : "badge-red"}`}>
                          <span className="num">{h.totalScore ?? "—"}</span>
                          {h.isPassed ? " ✓" : " ✗"}
                        </span>
                        {scoreGap != null && !h.isPassed && (
                          <span style={{ fontSize: "0.62rem", color: "var(--text-dim)" }}>
                            <span className="num">-{scoreGap}</span> dari PG
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ===== RECOMMENDATION CARD ===== */}
      <div style={{
        padding: "1.5rem 1.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.25rem",
        flexWrap: "wrap",
        background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.04))",
        border: "1px solid rgba(37,99,235,0.12)",
        borderRadius: "1.25rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: "0.875rem",
            background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))",
            border: "1px solid rgba(37,99,235,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--blue)",
          }}>
            <IconRocket />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              Siap tryout berikutnya?
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {COPY.empty.recommendation}
            </div>
          </div>
        </div>
        <Link href={ROUTES.tryouts}>
          <button className="btn-ghost" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", whiteSpace: "nowrap", cursor: "pointer", borderRadius: "0.625rem" }}>
            {COPY.cta.viewCatalog} →
          </button>
        </Link>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
