import Link from "next/link";
import { listAdminQuestions } from "@/lib/admin/questionQueries";

interface Props {
  searchParams: Promise<{
    q?: string;
    subtest?: string;
    status?: string;
  }>;
}

export default async function AdminQuestionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const rows = await listAdminQuestions({
    search: sp.q,
    subtest: sp.subtest,
    status: sp.status,
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#F1F5F9" }}>
            Bank Soal
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.8rem" }}>
            {rows.length} soal total. Kelola teks, opsi, pembahasan, dan status publish.
          </p>
        </div>
        <Link href="/admin/questions/new">
          <button className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
            + Soal Baru
          </button>
        </Link>
      </div>

      <form
        action="/admin/questions"
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Cari teks soal…"
          style={inputStyle}
        />
        <select name="subtest" defaultValue={sp.subtest ?? "all"} style={inputStyle}>
          <option value="all" style={bg}>Semua subtes</option>
          <option value="TWK" style={bg}>TWK</option>
          <option value="TIU" style={bg}>TIU</option>
          <option value="TKP" style={bg}>TKP</option>
          <option value="SKB" style={bg}>SKB</option>
        </select>
        <select name="status" defaultValue={sp.status ?? "all"} style={inputStyle}>
          <option value="all" style={bg}>Semua status</option>
          <option value="draft" style={bg}>Draft</option>
          <option value="reviewed" style={bg}>Reviewed</option>
          <option value="published" style={bg}>Published</option>
          <option value="archived" style={bg}>Archived</option>
        </select>
        <button type="submit" style={{ ...inputStyle, cursor: "pointer", color: "#CBD5E1", width: "auto" }}>
          Filter
        </button>
      </form>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <Th>Soal</Th>
              <Th>Subtes</Th>
              <Th>Topik</Th>
              <Th>Scoring</Th>
              <Th>Status</Th>
              <Th right>Opsi</Th>
              <Th>Diperbarui</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#64748B" }}>
                  Belum ada soal yang cocok filter.
                </td>
              </tr>
            )}
            {rows.map((q) => (
              <tr key={q.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <Td>
                  <div style={{ color: "#F1F5F9", fontSize: "0.82rem", lineHeight: 1.4 }}>
                    {q.questionText.length > 90
                      ? `${q.questionText.slice(0, 90)}…`
                      : q.questionText}
                  </div>
                </Td>
                <Td>{q.subtest}</Td>
                <Td>{q.topicName ?? "-"}</Td>
                <Td>
                  {q.scoringType === "single_correct" ? "Single" : "Weighted"}
                </Td>
                <Td>
                  <StatusBadge status={q.status} />
                </Td>
                <Td right>{q.optionCount}</Td>
                <Td>
                  {new Date(q.updatedAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </Td>
                <Td>
                  <Link
                    href={`/admin/questions/${q.id}/edit`}
                    style={{ color: "#60A5FA", textDecoration: "none", fontSize: "0.78rem" }}
                  >
                    Edit →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.4rem",
  color: "#F1F5F9",
  fontSize: "0.82rem",
  outline: "none",
  minWidth: 150,
};
const bg = { background: "#0A0F1E" };

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th
      style={{
        padding: "0.65rem 0.85rem",
        textAlign: right ? "right" : "left",
        color: "#94A3B8",
        fontWeight: 500,
        fontSize: "0.72rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </th>
  );
}
function Td({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <td style={{ padding: "0.65rem 0.85rem", textAlign: right ? "right" : "left", color: "#CBD5E1" }}>
      {children}
    </td>
  );
}
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    published: { bg: "rgba(16,185,129,0.15)", fg: "#6EE7B7" },
    draft: { bg: "rgba(255,255,255,0.04)", fg: "#94A3B8" },
    reviewed: { bg: "rgba(96,165,250,0.1)", fg: "#BFDBFE" },
    archived: { bg: "rgba(239,68,68,0.08)", fg: "#FCA5A5" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span
      style={{
        padding: "0.18rem 0.5rem",
        borderRadius: "0.3rem",
        background: s.bg,
        color: s.fg,
        fontSize: "0.7rem",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}
