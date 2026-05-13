import Link from "next/link";
import { listAdminPackages } from "@/lib/admin/packageQueries";

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    mode?: string;
  }>;
}

export default async function AdminPackagesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pkgs = await listAdminPackages({
    search: sp.q,
    status: sp.status,
    mode: sp.mode,
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
            Paket Tryout
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.8rem" }}>
            Kelola paket tryout dan publish ke user.
          </p>
        </div>
        <Link href="/admin/packages/new">
          <button className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
            + Paket Baru
          </button>
        </Link>
      </div>

      {/* Filter bar */}
      <form
        action="/admin/packages"
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Cari judul atau slug…"
          style={inputStyle}
        />
        <select name="status" defaultValue={sp.status ?? "all"} style={inputStyle}>
          <option value="all" style={{ background: "#0A0F1E" }}>Semua status</option>
          <option value="draft" style={{ background: "#0A0F1E" }}>Draft</option>
          <option value="review" style={{ background: "#0A0F1E" }}>Review</option>
          <option value="published" style={{ background: "#0A0F1E" }}>Published</option>
          <option value="archived" style={{ background: "#0A0F1E" }}>Archived</option>
        </select>
        <select name="mode" defaultValue={sp.mode ?? "all"} style={inputStyle}>
          <option value="all" style={{ background: "#0A0F1E" }}>Semua mode</option>
          <option value="simulation" style={{ background: "#0A0F1E" }}>Simulasi</option>
          <option value="practice" style={{ background: "#0A0F1E" }}>Latihan</option>
        </select>
        <button type="submit" style={{ ...inputStyle, cursor: "pointer", color: "#CBD5E1", width: "auto" }}>
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <Th>Judul</Th>
              <Th>Kategori</Th>
              <Th>Mode</Th>
              <Th>Status</Th>
              <Th right>Soal</Th>
              <Th right>Durasi</Th>
              <Th>Diperbarui</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {pkgs.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#64748B" }}>
                  Belum ada paket.
                </td>
              </tr>
            )}
            {pkgs.map((p) => (
              <tr
                key={p.id}
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <Td>
                  <div style={{ color: "#F1F5F9", fontWeight: 500 }}>{p.title}</div>
                  <div style={{ color: "#64748B", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                    /{p.slug}
                  </div>
                </Td>
                <Td>{p.categoryName ?? "-"}</Td>
                <Td>{p.mode === "simulation" ? "Simulasi" : "Latihan"}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
                <Td right>
                  {p.assignedQuestionCount}/{p.totalQuestions}
                </Td>
                <Td right>{p.durationMinutes}m</Td>
                <Td>
                  {new Date(p.updatedAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </Td>
                <Td>
                  <Link
                    href={`/admin/packages/${p.id}/edit`}
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
    <td
      style={{
        padding: "0.65rem 0.85rem",
        textAlign: right ? "right" : "left",
        color: "#CBD5E1",
      }}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    published: { bg: "rgba(16,185,129,0.15)", fg: "#6EE7B7" },
    draft: { bg: "rgba(255,255,255,0.04)", fg: "#94A3B8" },
    review: { bg: "rgba(245,158,11,0.1)", fg: "#FCD34D" },
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
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}
