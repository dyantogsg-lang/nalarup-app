import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { COPY } from "@/lib/constants/copy";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

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
          Hei, {firstName} 👋
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
            fontSize: "1.875rem",
            border: "1px solid rgba(37,99,235,0.2)",
          }}>
            🎯
          </div>

          <h2 style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.625rem",
            letterSpacing: "-0.025em",
            lineHeight: 1.3,
          }}>
            Ayo mulai tryout pertama kamu
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            maxWidth: 420,
            margin: "0 auto 2rem",
            lineHeight: 1.75,
          }}>
            Selesai dalam 100 menit — langsung tahu posisimu vs passing grade SKD.
            Gratis, tanpa batas pengulangan.
          </p>

          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.8rem 2rem", cursor: "pointer" }}>
              Pilih Paket Tryout
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
            icon: "⏱",
            title: "100 menit",
            desc: "Durasi simulasi SKD penuh — identik dengan ujian asli",
            accent: "#60A5FA",
          },
          {
            icon: "📊",
            title: "Analisis langsung",
            desc: "Breakdown skor per subtes setelah selesai. Tahu persis di mana bocornya.",
            accent: "#A78BFA",
          },
          {
            icon: "🔁",
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
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
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
    { label: "Tryout Selesai", value: String(totalAttempts), accent: "blue" as const,  icon: "📋", sub: "total sesi" },
    { label: "Skor Terakhir",  value: lastScore != null ? String(lastScore) : "—", accent: "violet" as const, icon: "🎯", sub: `PG: ${PASSING_GRADE.total}` },
    { label: "Streak",         value: currentStreak > 0 ? `${currentStreak}h` : "0h", accent: "green" as const,  icon: "🔥", sub: "hari berturut" },
    { label: "Pass Rate",      value: passRate != null ? `${passRate}%` : "—", accent: "amber" as const, icon: "✅", sub: `${passedCount} dari ${history.length}` },
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
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 700,
              }}>
                {s.label}
              </span>
              <span style={{ fontSize: "1rem" }}>{s.icon}</span>
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

      {/* ===== MAIN GRID: progress ring + history ===== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "clamp(240px, 28%, 300px) 1fr",
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

        {/* History card */}
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
                fontSize: "1.375rem",
              }}>
                📋
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
            fontSize: "1.1rem",
            flexShrink: 0,
          }}>
            🚀
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
