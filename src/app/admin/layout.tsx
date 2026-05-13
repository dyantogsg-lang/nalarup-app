import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex" }}>
      <aside
        style={{
          width: 220,
          background: "rgba(15,22,41,0.9)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "1.25rem 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 1.25rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NalarUp Admin
          </div>
          <div style={{ color: "#64748B", fontSize: "0.72rem", marginTop: "0.2rem" }}>
            {profile.fullName}
          </div>
        </div>

        <nav style={{ padding: "0.75rem 0.5rem", flex: 1 }}>
          <AdminLink href="/admin">Dashboard</AdminLink>
          <AdminLink href="/admin/packages">Paket Tryout</AdminLink>
          <AdminLink href="/admin/questions">Bank Soal</AdminLink>
          <AdminLink href="/admin/reports">Laporan Soal</AdminLink>
        </nav>

        <div style={{ padding: "0.75rem" }}>
          <Link
            href="/dashboard"
            style={{
              display: "block",
              padding: "0.5rem 0.75rem",
              fontSize: "0.78rem",
              color: "#94A3B8",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4rem",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Kembali ke App
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "0.55rem 0.75rem",
        fontSize: "0.85rem",
        color: "#CBD5E1",
        textDecoration: "none",
        borderRadius: "0.4rem",
        marginBottom: "0.2rem",
      }}
    >
      {children}
    </Link>
  );
}
