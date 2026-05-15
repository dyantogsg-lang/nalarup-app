import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { COPY } from "@/lib/constants/copy";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
);
const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
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
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "0.3rem",
          letterSpacing: "-0.025em",
        }}>
          Hei, {firstName} <span aria-hidden="true">👋</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          {isNewUser
            ? "Mulai tryout pertama dan lihat posisimu vs passing grade SKD."
            : gap != null && gap > 0
            ? `Kamu butuh ${gap} poin lagi untuk aman passing grade SKD.`
            : "Skor kamu sudah aman passing grade. Pertahankan!"}
        </p>
      </div>

      {/* ===== ACTIVE ATTEMPT BANNER ===== */}
      {active && (
        <div className="glass-card" style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          background: "var(--amber-subtle)",
          borderColor: "rgba(245,158,11,0.25)",
          borderLeft: "3px solid var(--amber)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{
              color: "#FCD34D",
              fontSize: "0.7rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--amber)",
                display: "inline-block",
                boxShadow: "0 0 6px var(--amber)",
              }} />
              Tryout sedang berjalan
            </div>
            <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>
              {active.packageTitle}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
              {COPY.activeAttempt.banner}
            </div>
          </div>
          <Link href={ROUTES.exam(active.id)}>
            <button className="btn-primary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem", cursor: "pointer" }}>
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
    </div>
  );
}

/* ===== NEW USER — Onboarding empty state ===== */
function NewUserDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Big onboarding CTA */}
      <div className="glass-card" style={{
        padding: "3.5rem 2rem",
        textAlign: "center",
        background: "var(--blue-subtle)",
        borderColor: "rgba(37,99,235,0.2)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 320,
          height: 220,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.1), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Icon */}
          <div style={{
            width: 68,
            height: 68,
            background: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,58,237,0.18))",
            borderRadius: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            border: "1px solid rgba(37,99,235,0.2)",
            color: "var(--blue)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>

          <h2 style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.625rem",
            letterSpacing: "-0.025em",
            lineHeight: 1.3,
          }}>
            Mulai SKD dasar untuk baca baseline kamu
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            maxWidth: 420,
            margin: "0 auto 2rem",
            lineHeight: 1.75,
          }}>
            Selesai dalam 100 menit — langsung tahu skor total, gap passing grade, dan subtes yang harus kamu fokuskan.
            Semua paket utama open access selama fase awal.
          </p>

          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.8rem 2rem", cursor: "pointer" }}>
              Mulai SKD Dasar
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {[
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            title: "100 menit",
            desc: "Durasi simulasi SKD penuh — identik dengan ujian asli",
            accent: "#60A5FA",
          },
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
            title: "Analisis langsung",
            desc: "Breakdown skor per subtes setelah selesai. Tahu persis di mana bocornya.",
            accent: "#A78BFA",
          },
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
            title: "Ulang bebas",
            desc: "Semua paket bisa diulang tanpa batas. Skor naik terukur.",
            accent: "#4ADE80",
          },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.375rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "0.625rem",
              background: "rgba(255,255,255,0.04)",
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
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: item.accent, marginBottom: "0.3rem" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
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

  // Progress ring calc (max score ~500 for SKD)
  const MAX_SCORE = 500;
  const scorePercent = lastScore != null ? Math.min((lastScore / MAX_SCORE) * 100, 100) : 0;
  const RADIUS = 38;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (scorePercent / 100) * CIRCUMFERENCE;

  // Ring color based on gap
  const ringColor =
    gap == null ? "var(--border-focus)" :
    gap <= 0    ? "var(--green)" :
    gap <= 30   ? "var(--amber)" :
                  "var(--danger)";

  // Passing grade ring overlay
  const pgPercent = Math.min((PASSING_GRADE.total / MAX_SCORE) * 100, 100);
  const pgDashOffset = CIRCUMFERENCE - (pgPercent / 100) * CIRCUMFERENCE;

  const statCards = [
    { label: "Tryout Selesai", value: String(totalAttempts), accent: "blue" as const,  icon: <IconClipboard />, sub: "total sesi" },
    { label: "Skor Terakhir",  value: lastScore != null ? String(lastScore) : "—", accent: "violet" as const, icon: <IconTarget />, sub: `PG: ${PASSING_GRADE.total}` },
    { label: "Streak",         value: currentStreak > 0 ? `${currentStreak}h` : "0h", accent: "green" as const,  icon: <IconFlame />, sub: "hari berturut" },
    { label: "Pass Rate",      value: passRate != null ? `${passRate}%` : "—", accent: "amber" as const, icon: <IconCheckCircle />, sub: `${passedCount} dari ${history.length}` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* ===== STAT CARDS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {statCards.map((s) => (
          <div key={s.label} className={`glass-card stat-card-${s.accent}`} style={{ padding: "1.25rem 1.25rem 1.25rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <span style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 700,
              }}>
                {s.label}
              </span>
              <span style={{ color: "var(--text-dim)", display: "flex" }}>{s.icon}</span>
            </div>
            <div className="num" style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.025em",
              lineHeight: 1,
              marginBottom: "0.375rem",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontWeight: 500 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <Link href={ROUTES.tryouts} style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            transition: "border-color 150ms ease",
          }}>
            <div style={{ color: "var(--blue)", display: "flex" }}><IconPlay /></div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>Lanjut Tryout</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Pilih paket baru</div>
            </div>
          </div>
        </Link>
        <Link href={history.length > 0 ? ROUTES.result(history[0].id) : ROUTES.history} style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            transition: "border-color 150ms ease",
          }}>
            <div style={{ color: "var(--violet)", display: "flex" }}><IconFileText /></div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>Review Soal</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Lihat pembahasan</div>
            </div>
          </div>
        </Link>
        <Link href={ROUTES.history} style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            transition: "border-color 150ms ease",
          }}>
            <div style={{ color: "var(--green)", display: "flex" }}><IconBarChart /></div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>Lihat Analisis</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Trend skor kamu</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ===== MAIN GRID: progress ring + radar + history ===== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "clamp(240px, 28%, 300px) clamp(240px, 28%, 300px) 1fr",
        gap: "1rem",
      }}>

        {/* Progress ring card */}
        <div className="glass-card" style={{
          padding: "1.75rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            Skor Terakhir
          </div>

          {/* SVG Ring */}
          <div style={{ position: "relative", width: 108, height: 108, marginBottom: "1.25rem" }}>
            <svg width="108" height="108" viewBox="0 0 108 108" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
              {/* Track */}
              <circle
                className="progress-ring-track"
                cx="54" cy="54" r={RADIUS}
                fill="none"
                strokeWidth="8"
              />
              {/* Passing grade marker — subtle dashed */}
              <circle
                cx="54" cy="54" r={RADIUS}
                fill="none"
                strokeWidth="2"
                stroke="rgba(34,197,94,0.25)"
                strokeDasharray={`2 ${(CIRCUMFERENCE - 2)}`}
                strokeDashoffset={pgDashOffset}
                strokeLinecap="round"
              />
              {/* Score fill */}
              <circle
                className="progress-ring-fill"
                cx="54" cy="54" r={RADIUS}
                fill="none"
                strokeWidth="8"
                stroke={ringColor}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={lastScore != null ? dashOffset : CIRCUMFERENCE}
              />
            </svg>
            {/* Center label */}
            <div className="num" style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.1rem",
            }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
                {lastScore ?? "—"}
              </span>
              {lastScore != null && (
                <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontWeight: 500 }}>
                  / {MAX_SCORE}
                </span>
              )}
            </div>
          </div>

          {/* Gap context label */}
          {gap != null ? (
            <div style={{
              padding: "0.5rem 0.875rem",
              borderRadius: "0.625rem",
              background: gap <= 0 ? "rgba(34,197,94,0.08)" : gap <= 30 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${gap <= 0 ? "rgba(34,197,94,0.2)" : gap <= 30 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
              marginBottom: "0.75rem",
              width: "100%",
            }}>
              <div className="num" style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: gap <= 0 ? "#4ADE80" : gap <= 30 ? "#FCD34D" : "#FCA5A5",
                marginBottom: "0.2rem",
              }}>
                {gap <= 0 ? "✓ Sudah aman passing grade" : `+${gap} poin lagi`}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                {gap <= 0
                  ? "Pertahankan konsistensimu"
                  : gap <= 30
                  ? "Hampir sampai — fokus satu subtes lagi"
                  : "Identifikasi subtes yang paling bocor"}
              </div>
            </div>
          ) : (
            <div style={{
              padding: "0.5rem 0.875rem",
              borderRadius: "0.625rem",
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              marginBottom: "0.75rem",
              width: "100%",
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Belum ada skor</div>
            </div>
          )}

          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            Passing grade SKD:{" "}
            <span className="num" style={{ color: "var(--text-muted)", fontWeight: 600 }}>
              {PASSING_GRADE.total}
            </span>
            <br />
            <span style={{ color: "var(--text-dim)" }}>TWK {PASSING_GRADE.twk} · TIU {PASSING_GRADE.tiu} · TKP {PASSING_GRADE.tkp}</span>
          </div>

          <Link href={ROUTES.tryouts} style={{ width: "100%" }}>
            <button className="btn-primary" style={{ width: "100%", padding: "0.625rem", fontSize: "0.82rem", cursor: "pointer" }}>
              Tryout Lagi
            </button>
          </Link>
        </div>

        {/* Performa Subtes card */}
        <div className="glass-card" style={{
          padding: "1.5rem",
        }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "1rem" }}>
            Performa Subtes
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
            {[
              { label: "TWK", score: lastScore != null ? Math.round((lastScore / PASSING_GRADE.total) * PASSING_GRADE.twk) : 0, target: PASSING_GRADE.twk, color: "var(--blue)" },
              { label: "TIU", score: lastScore != null ? Math.round((lastScore / PASSING_GRADE.total) * PASSING_GRADE.tiu) : 0, target: PASSING_GRADE.tiu, color: "var(--violet)" },
              { label: "TKP", score: lastScore != null ? Math.round((lastScore / PASSING_GRADE.total) * PASSING_GRADE.tkp) : 0, target: PASSING_GRADE.tkp, color: "var(--green)" },
            ].map((subtest) => {
              const safe = subtest.score >= subtest.target;
              const pct = Math.min(100, Math.round((subtest.score / subtest.target) * 100));
              return (
                <div key={subtest.label} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "0.85rem", textAlign: "center" }}>
                  <div className="num" style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.15rem" }}>
                    {subtest.score}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: "0.55rem" }}>
                    {subtest.label} · PG {subtest.target}
                  </div>
                  <div aria-label={`${subtest.label} ${subtest.score} dari target ${subtest.target}`} style={{ height: 5, borderRadius: 999, background: "var(--border)", overflow: "hidden", marginBottom: "0.55rem" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: subtest.color }} />
                  </div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: safe ? "var(--green)" : "var(--amber)" }}>
                    {safe ? "Aman" : `Kurang ${subtest.target - subtest.score}`}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.6 }}>
            Fokus berikutnya: perbaiki subtes dengan gap terbesar sebelum mengulang full tryout.
          </p>
        </div>

        {/* History list card */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Riwayat Tryout
            </h3>
            <Link href={ROUTES.history} style={{
              fontSize: "0.72rem",
              color: "#60A5FA",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              transition: "color 150ms ease",
            }}>
              Lihat semua →
            </Link>
          </div>

          {history.length === 0 ? (
            /* Empty state */
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2.5rem 1rem",
              textAlign: "center",
              gap: "0.75rem",
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "0.875rem",
                background: "var(--blue-subtle)",
                border: "1px solid rgba(37,99,235,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--blue)",
              }}>
                <IconClipboard />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                  Belum ada riwayat
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 260 }}>
                  Selesaikan tryout pertama untuk melihat skor dan analisis kelemahan kamu.
                </div>
              </div>
              <Link href={ROUTES.tryouts}>
                <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "0.45rem 1rem", cursor: "pointer", marginTop: "0.25rem" }}>
                  Mulai Tryout
                </button>
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {history.slice(0, 5).map((h, idx) => {
                const scoreGap = h.totalScore != null ? PASSING_GRADE.total - h.totalScore : null;
                return (
                  <li key={h.id}>
                    <Link href={ROUTES.result(h.id)} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 0.875rem",
                      background: "var(--bg-card2)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      textDecoration: "none",
                      transition: "border-color 150ms ease, background 150ms ease",
                      cursor: "pointer",
                      gap: "0.75rem",
                    }}>
                      {/* Left: rank + title */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        <div className="num" style={{
                          width: 26,
                          height: 26,
                          borderRadius: "0.375rem",
                          background: "var(--bg-card2)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          color: "var(--text-dim)",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            color: "var(--text-primary)",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: "0.15rem",
                          }}>
                            {h.packageTitle}
                          </div>
                          <div style={{ color: "var(--text-dim)", fontSize: "0.68rem" }}>
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

                      {/* Right: score badge */}
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
      <div className="glass-card" style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        background: "var(--blue-subtle)",
        borderColor: "rgba(37,99,235,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
            border: "1px solid rgba(37,99,235,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--blue)",
          }}>
            <IconRocket />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.2rem" }}>
              Siap tryout berikutnya?
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {COPY.empty.recommendation}
            </div>
          </div>
        </div>
        <Link href={ROUTES.tryouts}>
          <button className="btn-ghost" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem", whiteSpace: "nowrap", cursor: "pointer" }}>
            {COPY.cta.viewCatalog} →
          </button>
        </Link>
      </div>

    </div>
  );
}
