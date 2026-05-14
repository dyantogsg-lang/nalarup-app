import { requireUser } from "@/lib/auth/requireUser";
import { db } from "@/lib/db";
import { attempts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

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

  const initials = profile.fullName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const memberSince = new Date(profile.createdAt).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Profil
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>Informasi akun dan statistik kamu.</p>
      </div>

      {/* Profile card */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#F1F5F9", marginBottom: "0.25rem" }}>
              {profile.fullName}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#94A3B8" }}>{profile.email}</div>
            <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.2rem" }}>
              Bergabung {memberSince}
            </div>
          </div>
        </div>

        <hr className="divider" style={{ marginBottom: "1.5rem" }} />

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {[
            { label: "Email", value: profile.email },
            { label: "Target Ujian", value: profile.targetExam ?? "Belum diset" },
            { label: "Streak Saat Ini", value: `${profile.currentStreak} hari` },
            { label: "Streak Terpanjang", value: `${profile.longestStreak} hari` },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>{row.label}</span>
              <span style={{ fontSize: "0.875rem", color: "#F1F5F9", fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats card */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "1.25rem" }}>
          Statistik Tryout
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Total Tryout", value: String(stats?.total ?? 0), accent: "blue" },
            { label: "Selesai", value: String(stats?.submitted ?? 0), accent: "violet" },
            { label: "Lulus", value: String(stats?.passed ?? 0), accent: "green" },
            { label: "Skor Terbaik", value: stats?.bestScore != null ? String(stats.bestScore) : "—", accent: "amber" },
          ].map((s) => (
            <div key={s.label} className={`glass-card stat-card-${s.accent}`} style={{ padding: "1rem 1rem 1rem 1.125rem" }}>
              <div style={{ fontSize: "0.68rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "0.375rem" }}>
                {s.label}
              </div>
              <div className="num" style={{ fontSize: "1.4rem", fontWeight: 700, color: "#F1F5F9" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
