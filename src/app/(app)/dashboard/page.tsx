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
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          Hei, {firstName} 👋
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
          {isNewUser
            ? "Mulai tryout pertama dan lihat hasilnya langsung."
            : gap != null && gap > 0
            ? `Kamu butuh ${gap} poin lagi untuk aman passing grade SKD.`
            : "Skor kamu sudah aman passing grade. Pertahankan!"}
        </p>
      </div>

      {/* Active attempt banner */}
      {active && (
        <div className="glass-card" style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          background: "rgba(245,158,11,0.08)",
          borderColor: "rgba(245,158,11,0.3)",
          borderLeft: "3px solid #F59E0B",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: "#FBBF24", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⏱ Tryout sedang berjalan
            </div>
            <div style={{ color: "#F1F5F9", fontSize: "0.9rem", fontWeight: 500 }}>{active.packageTitle}</div>
            <div style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: "0.2rem" }}>
              {COPY.activeAttempt.banner}
            </div>
          </div>
          <Link href={ROUTES.exam(active.id)}>
            <button className="btn-primary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem" }}>
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
        padding: "3rem 2rem",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 100%)",
        borderColor: "rgba(37,99,235,0.25)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 300, height: 200,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.12), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
            borderRadius: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.25rem",
            fontSize: "1.75rem",
            border: "1px solid rgba(37,99,235,0.2)",
          }}>
            🎯
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "0.625rem", letterSpacing: "-0.02em" }}>
            Ayo mulai tryout pertama kamu
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", maxWidth: 420, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Selesai dalam 100 menit — langsung tahu posisimu vs passing grade SKD.
            Gratis, tanpa batas pengulangan.
          </p>
          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.8rem 2rem" }}>
              Pilih Paket Tryout
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {[
          { icon: "⏱", title: "100 menit", desc: "Durasi simulasi SKD penuh" },
          { icon: "📊", title: "Analisis langsung", desc: "Breakdown skor per subtes setelah selesai" },
          { icon: "🔁", title: "Ulang bebas", desc: "Semua paket bisa diulang tanpa batas" },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#F1F5F9", marginBottom: "0.25rem" }}>{item.title}</div>
              <div style={{ fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.5 }}>{item.desc}</div>
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
  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (scorePercent / 100) * CIRCUMFERENCE;
  const ringColor = gap == null ? "#94A3B8" : gap <= 0 ? "#22C55E" : gap <= 30 ? "#F59E0B" : "#EF4444";

  const statCards = [
    { label: "Tryout Selesai", value: String(totalAttempts), accent: "blue" as const, icon: "📋" },
    { label: "Skor Terakhir",  value: lastScore != null ? String(lastScore) : "—", accent: "violet" as const, icon: "🎯" },
    { label: "Streak",         value: currentStreak > 0 ? `${currentStreak}h` : "0h", accent: "green" as const, icon: "🔥" },
    { label: "Pass Rate",      value: passRate != null ? `${passRate}%` : "—", accent: "amber" as const, icon: "✅" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {statCards.map((s) => (
          <div key={s.label} className={`glass-card stat-card-${s.accent}`} style={{ padding: "1.25rem 1.25rem 1.25rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.625rem" }}>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {s.label}
              </span>
              <span style={{ fontSize: "1rem" }}>{s.icon}</span>
            </div>
            <div className="num" style={{ fontSize: "1.75rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid: progress + history */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1rem" }}>

        {/* Progress ring card */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Skor Terakhir
          </div>

          {/* SVG Ring */}
          <div style={{ position: "relative", width: 100, height: 100, marginBottom: "1rem" }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle className="progress-ring-track" cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" />
              <circle
                className="progress-ring-fill"
                cx="50" cy="50" r={RADIUS}
                fill="none"
                strokeWidth="8"
                stroke={ringColor}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={lastScore != null ? dashOffset : CIRCUMFERENCE}
              />
            </svg>
            <div className="num" style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", fontWeight: 700, color: "#F1F5F9",
            }}>
              {lastScore ?? "—"}
            </div>
          </div>

          {/* Gap context */}
          {gap != null && (
            <div style={{
              padding: "0.5rem 0.875rem",
              borderRadius: "0.5rem",
              background: gap <= 0 ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${gap <= 0 ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
              marginBottom: "0.75rem",
            }}>
              <div className="num" style={{ fontSize: "0.8rem", fontWeight: 600, color: gap <= 0 ? "#4ADE80" : "#FCD34D" }}>
                {gap <= 0 ? "✓ Sudah aman passing grade" : `+${gap} poin lagi untuk aman`}
              </div>
            </div>
          )}

          <div style={{ fontSize: "0.72rem", color: "#475569", lineHeight: 1.5 }}>
            Passing grade SKD: <span className="num" style={{ color: "#94A3B8" }}>{PASSING_GRADE.total}</span>
          </div>

          <Link href={ROUTES.tryouts} style={{ marginTop: "1.25rem", width: "100%" }}>
            <button className="btn-primary" style={{ width: "100%", padding: "0.6rem", fontSize: "0.82rem" }}>
              Tryout Lagi
            </button>
          </Link>
        </div>

        {/* History */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F1F5F9" }}>Riwayat Tryout</h3>
            <Link href={ROUTES.history} style={{ fontSize: "0.75rem", color: "#60A5FA", textDecoration: "none" }}>
              Lihat semua →
            </Link>
          </div>

          {history.length === 0 ? (
            <p style={{ color: "#475569", fontSize: "0.8rem" }}>Belum ada tryout submitted.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {history.slice(0, 5).map((h) => (
                <li key={h.id}>
                  <Link href={ROUTES.result(h.id)} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.625rem 0.875rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid #1E293B",
                    borderRadius: "0.625rem",
                    textDecoration: "none",
                    transition: "border-color 150ms ease, background 150ms ease",
                    cursor: "pointer",
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#F1F5F9", fontSize: "0.82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.packageTitle}
                      </div>
                      <div style={{ color: "#475569", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                        {h.submittedAt
                          ? new Date(h.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <span className={`badge ${h.isPassed ? "badge-green" : "badge-red"}`}>
                        <span className="num">{h.totalScore ?? "—"}</span>
                        {h.isPassed ? " ✓" : " ✗"}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recommendation */}
      <div className="glass-card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#F1F5F9", marginBottom: "0.25rem" }}>
            Siap tryout berikutnya?
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
            {COPY.empty.recommendation}
          </div>
        </div>
        <Link href={ROUTES.tryouts}>
          <button className="btn-ghost" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
            {COPY.cta.viewCatalog} →
          </button>
        </Link>
      </div>
    </div>
  );
}
