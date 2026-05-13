import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  questionReports,
  questions,
  profiles,
} from "@/lib/db/schema";

export default async function AdminReportsPage() {
  const rows = await db
    .select({
      id: questionReports.id,
      reason: questionReports.reason,
      description: questionReports.description,
      status: questionReports.status,
      createdAt: questionReports.createdAt,
      questionId: questionReports.questionId,
      questionText: questions.questionText,
      userEmail: profiles.email,
    })
    .from(questionReports)
    .innerJoin(questions, eq(questionReports.questionId, questions.id))
    .innerJoin(profiles, eq(questionReports.userId, profiles.id))
    .where(and(eq(questionReports.status, "open")))
    .orderBy(desc(questionReports.createdAt))
    .limit(100);

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.25rem" }}>
        Laporan Soal
      </h1>
      <p style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
        {rows.length} laporan terbuka. Klik untuk review soal.
      </p>

      {rows.length === 0 ? (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Tidak ada laporan aktif.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {rows.map((r) => (
            <article
              key={r.id}
              className="glass-card"
              style={{ padding: "0.9rem 1.1rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#FBBF24" }}>
                  {r.reason}
                </span>
                <span style={{ color: "#64748B", fontSize: "0.7rem" }}>
                  {new Date(r.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} · {r.userEmail}
                </span>
              </div>
              <div style={{ color: "#CBD5E1", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
                {r.questionText.length > 140 ? `${r.questionText.slice(0, 140)}…` : r.questionText}
              </div>
              {r.description && (
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "0.78rem",
                    padding: "0.5rem 0.7rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "0.35rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  {r.description}
                </div>
              )}
              <Link
                href={`/admin/questions/${r.questionId}/edit`}
                style={{ color: "#60A5FA", textDecoration: "none", fontSize: "0.78rem" }}
              >
                Buka soal →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
