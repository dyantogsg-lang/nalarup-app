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

  const infoRows = [
    {
      label: "Email",
      value: profile.email,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      ),
    },
    {
      label: "Target Ujian",
      value: profile.targetExam ?? "Belum diset",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      ),
    },
    {
      label: "Streak Saat Ini",
      value: `${profile.currentStreak} hari`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
      ),
    },
    {
      label: "Streak Terpanjang",
      value: `${profile.longestStreak} hari`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      ),
    },
  ];

  const statCards = [
    { label: "Total Tryout", value: String(stats?.total ?? 0), accent: "var(--blue)", bg: "rgba(37,99,235,0.06)" },
    { label: "Selesai", value: String(stats?.submitted ?? 0), accent: "var(--violet)", bg: "rgba(124,58,237,0.06)" },
    { label: "Lulus", value: String(stats?.passed ?? 0), accent: "var(--green)", bg: "rgba(34,197,94,0.06)" },
    { label: "Skor Terbaik", value: stats?.bestScore != null ? String(stats.bestScore) : "—", accent: "var(--amber)", bg: "rgba(245,158,11,0.06)" },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.3rem" }}>
          Profil
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>Informasi akun dan statistik kamu.</p>
      </div>

      {/* Profile card */}
      <div style={{
        padding: "2.25rem",
        marginBottom: "1.25rem",
        background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.03))",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Avatar with ring */}
          <div style={{
            position: "relative",
            width: 76,
            height: 76,
            flexShrink: 0,
          }}>
            {/* Outer glow ring */}
            <div style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
              filter: "blur(4px)",
            }} />
            {/* Border ring */}
            <div style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              padding: 3,
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "var(--bg-card)",
              }} />
            </div>
            {/* Avatar */}
            <div style={{
              position: "relative",
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}>
              {initials}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.3rem", letterSpacing: "-0.02em" }}>
              {profile.fullName}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{profile.email}</div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.72rem",
              color: "var(--text-dim)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "9999px",
              padding: "0.25rem 0.75rem",
              marginTop: "0.3rem",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Bergabung {memberSince}
            </div>
          </div>
        </div>

        {/* Info rows with icons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {infoRows.map((row) => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ color: "var(--text-dim)", display: "flex" }}>{row.icon}</span>
                <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>{row.label}</span>
              </div>
              <span style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats card */}
      <div style={{
        padding: "1.75rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
      }}>
        <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
          Statistik Tryout
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
          {statCards.map((s) => (
            <div key={s.label} style={{
              padding: "1.25rem",
              background: s.bg,
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}>
                {s.label}
              </div>
              <div className="num" style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}>
                {s.value}
              </div>
              {/* Decorative accent dot */}
              <div style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: s.accent,
                opacity: 0.5,
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
