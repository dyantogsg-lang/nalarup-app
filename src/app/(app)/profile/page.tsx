import { requireUser } from "@/lib/auth/requireUser";
import { db } from "@/lib/db";
import { attempts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { PageHeader, StatCard, SectionCard } from "@/components/ui";

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

  return (
    <div className="container-md">
      <PageHeader
        title="Profil"
        subtitle="Informasi akun dan statistik kamu."
      />

      {/* ===== PROFILE CARD ===== */}
      <SectionCard padding="lg" className="mb-4">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0" style={{ width: 76, height: 76 }}>
            {/* Outer glow */}
            <div
              className="absolute rounded-full"
              style={{
                inset: -4,
                background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
                filter: "blur(4px)",
              }}
            />
            {/* Border ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: -3,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                padding: 3,
              }}
            >
              <div className="w-full h-full rounded-full" style={{ background: "var(--bg-card)" }} />
            </div>
            {/* Avatar circle */}
            <div
              className="relative flex items-center justify-center rounded-full font-bold text-white"
              style={{
                width: 76,
                height: 76,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                fontSize: "1.4rem",
                letterSpacing: "-0.02em",
              }}
            >
              {initials}
            </div>
          </div>

          {/* Name & meta */}
          <div>
            <div className="font-bold text-lg" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {profile.fullName}
            </div>
            <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {profile.email}
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-xs mt-2 px-3 py-1 rounded-full"
              style={{
                color: "var(--text-dim)",
                background: "var(--bg-card2)",
                border: "1px solid var(--border)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Bergabung {memberSince}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2.5">
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center px-4 py-3 rounded-xl"
              style={{
                background: "var(--bg-card2)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex" style={{ color: "var(--text-dim)" }} aria-hidden="true">{row.icon}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{row.label}</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ===== STATS ===== */}
      <SectionCard title="Statistik Tryout" padding="md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Tryout"
            value={stats?.total ?? 0}
            accent="blue"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>}
          />
          <StatCard
            label="Selesai"
            value={stats?.submitted ?? 0}
            accent="violet"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          />
          <StatCard
            label="Lulus"
            value={stats?.passed ?? 0}
            accent="green"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          />
          <StatCard
            label="Skor Terbaik"
            value={stats?.bestScore ?? "—"}
            accent="amber"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
          />
        </div>
      </SectionCard>
    </div>
  );
}
