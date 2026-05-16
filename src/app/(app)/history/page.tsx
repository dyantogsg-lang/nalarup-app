import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { HistoryClient } from "@/components/history/HistoryClient";

export default async function HistoryPage() {
  const { profile } = await requireUser();

  const history = await db
    .select({
      id: attempts.id,
      totalScore: attempts.totalScore,
      isPassed: attempts.isPassed,
      status: attempts.status,
      submittedAt: attempts.submittedAt,
      startedAt: attempts.startedAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      packageDuration: tryoutPackages.durationMinutes,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.userId, profile.id)))
    .orderBy(desc(attempts.startedAt))
    .limit(50);

  const submitted = history.filter((h) => h.status === "submitted");
  const passedCount = submitted.filter((h) => h.isPassed).length;
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((s, h) => s + (h.totalScore ?? 0), 0) / submitted.length)
      : null;
  const bestScore = submitted.length > 0
    ? Math.max(...submitted.map((h) => h.totalScore ?? 0))
    : null;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1rem" }}>
      {/* ===== HEADER with gradient ===== */}
      <div style={{
        marginBottom: "1.75rem",
        padding: "2rem 2.25rem",
        background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(37,99,235,0.03))",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
      }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
          Riwayat Tryout
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0, marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Semua sesi tryout kamu — selesai maupun yang masih berjalan.
        </p>

        {/* Stats with icon boxes */}
        {submitted.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.875rem" }}>
            {[
              { label: "Total Selesai", value: String(submitted.length), accent: "var(--blue)", bg: "rgba(37,99,235,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> },
              { label: "Rata-rata Skor", value: avgScore != null ? String(avgScore) : "—", accent: "var(--violet)", bg: "rgba(124,58,237,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> },
              { label: "Lulus Passing", value: `${passedCount}/${submitted.length}`, accent: "var(--green)", bg: "rgba(34,197,94,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
              { label: "Skor Terbaik", value: bestScore != null ? String(bestScore) : "—", accent: "var(--amber)", bg: "rgba(245,158,11,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "1rem 1.1rem",
                background: s.bg,
                border: "1px solid var(--border)",
                borderRadius: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "0.5rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.accent,
                  flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</div>
                  <div className="num" style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CONTENT — client component for tabs ===== */}
      {history.length === 0 ? (
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1.05rem", marginBottom: "0.5rem" }}>Belum ada riwayat</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.75rem", maxWidth: 360, margin: "0 auto 1.75rem", lineHeight: 1.6 }}>
            Mulai tryout pertama untuk melihat progress dan analisis skor kamu di sini.
          </p>
          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem", borderRadius: "0.75rem", cursor: "pointer" }}>
              Lihat Katalog Tryout
            </button>
          </Link>
        </div>
      ) : (
        <HistoryClient history={history.map(h => ({
          ...h,
          submittedAt: h.submittedAt?.toISOString() ?? null,
          startedAt: h.startedAt.toISOString(),
        }))} />
      )}
    </div>
  );
}
