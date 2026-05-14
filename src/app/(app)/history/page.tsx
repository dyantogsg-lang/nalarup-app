import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

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

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Riwayat Tryout
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
          Semua sesi tryout kamu — selesai maupun yang masih berjalan.
        </p>
      </div>

      {/* Summary stats */}
      {submitted.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Selesai", value: String(submitted.length), accent: "blue" },
            { label: "Rata-rata Skor", value: avgScore != null ? String(avgScore) : "—", accent: "violet" },
            { label: "Lulus Passing", value: `${passedCount}/${submitted.length}`, accent: "green" },
          ].map((s) => (
            <div key={s.label} className={`glass-card stat-card-${s.accent}`} style={{ padding: "1rem 1rem 1rem 1.25rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "0.375rem" }}>
                {s.label}
              </div>
              <div className="num" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F1F5F9" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {history.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ fontWeight: 600, color: "#F1F5F9", marginBottom: "0.5rem" }}>Belum ada riwayat</h3>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Mulai tryout pertama untuk melihat riwayat di sini.
          </p>
          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}>
              Lihat Katalog Tryout
            </button>
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {history.map((h, i) => (
              <li key={h.id} style={{ borderBottom: i < history.length - 1 ? "1px solid #1E293B" : "none" }}>
                <Link
                  href={h.status === "submitted" ? ROUTES.result(h.id) : h.status === "in_progress" ? ROUTES.exam(h.id) : "#"}
                  style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", textDecoration: "none", transition: "background 150ms ease" }}
                >
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: h.status === "submitted"
                      ? (h.isPassed ? "#22C55E" : "#EF4444")
                      : h.status === "in_progress" ? "#F59E0B" : "#475569",
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#F1F5F9", fontSize: "0.875rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {h.packageTitle}
                    </div>
                    <div style={{ color: "#475569", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                      {h.submittedAt
                        ? new Date(h.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : h.startedAt
                        ? new Date(h.startedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                        : "—"}
                    </div>
                  </div>

                  {/* Score / status */}
                  <div style={{ flexShrink: 0 }}>
                    {h.status === "submitted" ? (
                      <span className={`badge ${h.isPassed ? "badge-green" : "badge-red"}`}>
                        <span className="num">{h.totalScore ?? "—"}</span>
                        {h.isPassed ? " Lulus" : " Tidak Lulus"}
                      </span>
                    ) : h.status === "in_progress" ? (
                      <span className="badge badge-amber">Berjalan</span>
                    ) : (
                      <span className="badge" style={{ background: "rgba(71,85,105,0.2)", color: "#94A3B8" }}>Kedaluwarsa</span>
                    )}
                  </div>

                  {/* Arrow */}
                  {h.status === "submitted" && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "#475569", flexShrink: 0 }}>
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
