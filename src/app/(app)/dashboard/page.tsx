import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { COPY } from "@/lib/constants/copy";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const firstName = profile.fullName.split(" ")[0];

  // Fetch lightweight dashboard data
  const [stats] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
      submitted: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      inProgress: sql<number>`count(*) filter (where ${attempts.status} = 'in_progress')::int`,
      lastScore: sql<
        number | null
      >`(array_agg(${attempts.totalScore} order by ${attempts.submittedAt} desc nulls last))[1]`,
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

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#F1F5F9",
            marginBottom: "0.25rem",
          }}
        >
          Hei, {firstName} 👋
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
          {isNewUser
            ? "Mulai tryout pertama dan lihat hasilnya langsung."
            : "Lanjutkan loop latihan sampai skor aman passing grade."}
        </p>
      </div>

      {/* Active attempt banner (always wins if present) */}
      {active && (
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: "#FBBF24", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Tryout berjalan
            </div>
            <div style={{ color: "#F1F5F9", fontSize: "0.9rem" }}>{active.packageTitle}</div>
            <div style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {COPY.activeAttempt.banner}
            </div>
          </div>
          <Link href={ROUTES.exam(active.id)}>
            <button className="btn-primary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem" }}>
              {COPY.cta.continueTryout}
            </button>
          </Link>
        </div>
      )}

      {isNewUser ? (
        <NewUserDashboard />
      ) : (
        <ReturningUserDashboard
          totalAttempts={stats?.totalAttempts ?? 0}
          lastScore={stats?.lastScore ?? null}
          history={lastSubmitted}
          currentStreak={profile.currentStreak}
        />
      )}
    </div>
  );
}

function NewUserDashboard() {
  return (
    <div>
      {/* CTA card */}
      <div
        className="glass-card"
        style={{
          padding: "2.5rem",
          textAlign: "center",
          marginBottom: "1.25rem",
          background: "rgba(37,99,235,0.06)",
          borderColor: "rgba(37,99,235,0.2)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            background: "rgba(37,99,235,0.15)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: "1.5rem",
          }}
        >
          🎯
        </div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.5rem" }}>
          Mulai Tryout Pertama
        </h2>
        <p
          style={{
            color: "#64748B",
            fontSize: "0.875rem",
            maxWidth: 400,
            margin: "0 auto 1.5rem",
          }}
        >
          SKD CPNS — Paket Perdana. 30 soal, 30 menit. Gratis, open access.
        </p>
        <Link href={ROUTES.tryouts}>
          <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.75rem 2rem" }}>
            {COPY.cta.startFirstTryout}
          </button>
        </Link>
      </div>

      {/* Empty state riwayat */}
      <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748B", fontSize: "0.875rem" }}>{COPY.empty.historyNew}</p>
      </div>
    </div>
  );
}

function ReturningUserDashboard({
  totalAttempts,
  lastScore,
  history,
  currentStreak,
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
}) {
  const statCards = [
    { label: "Tryout Selesai", value: String(totalAttempts) },
    { label: "Skor Terakhir", value: lastScore != null ? String(lastScore) : "-" },
    { label: "Streak", value: currentStreak > 0 ? `${currentStreak} hari` : "0 hari" },
    {
      label: "Passing Rate",
      value: (() => {
        const passed = history.filter((h) => h.isPassed).length;
        return history.length > 0 ? `${Math.round((passed / history.length) * 100)}%` : "-";
      })(),
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        {statCards.map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: "1.25rem" }}>
            <div
              style={{
                color: "#64748B",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {s.label}
            </div>
            <div style={{ color: "#F1F5F9", fontSize: "1.5rem", fontWeight: 600 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* History */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F1F5F9" }}>Riwayat Tryout</h3>
            <Link
              href={ROUTES.history}
              style={{ fontSize: "0.75rem", color: "#60A5FA", textDecoration: "none" }}
            >
              Lihat semua →
            </Link>
          </div>
          {history.length === 0 ? (
            <p style={{ color: "#64748B", fontSize: "0.8rem" }}>Belum ada tryout submitted.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {history.slice(0, 4).map((h) => (
                <li key={h.id}>
                  <Link
                    href={ROUTES.result(h.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.6rem 0.75rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "0.5rem",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#F1F5F9", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.packageTitle}
                      </div>
                      <div style={{ color: "#64748B", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                        {h.submittedAt ? new Date(h.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "0.3rem",
                          background: h.isPassed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                          color: h.isPassed ? "#6EE7B7" : "#FCA5A5",
                        }}
                      >
                        {h.totalScore ?? "-"}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendations */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "1rem" }}>
            Rekomendasi Latihan
          </h3>
          <p style={{ color: "#64748B", fontSize: "0.8rem", marginBottom: "1rem" }}>
            {COPY.empty.recommendation}
          </p>
          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
              {COPY.cta.viewCatalog}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
