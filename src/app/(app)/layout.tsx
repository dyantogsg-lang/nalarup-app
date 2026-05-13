import { requireUser } from "@/lib/auth/requireUser";
import { SidebarNav } from "@/components/app-shell/SidebarNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0A0F1E",
      }}
    >
      <AppSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppTopbar fullName={profile.fullName} />
        <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AppSidebar() {
  return (
    <aside
      style={{
        width: 220,
        background: "rgba(17,24,39,0.8)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: "1.2rem",
            background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          NalarUp
        </span>
      </div>

      {/* Nav (active state, client component) */}
      <SidebarNav />

      {/* Logout */}
      <div style={{ padding: "0.75rem" }}>
        <LogoutButton />
      </div>
    </aside>
  );
}

function AppTopbar({ fullName }: { fullName: string }) {
  const initial = fullName.trim().charAt(0).toUpperCase() || "U";
  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        padding: "0 2rem",
        background: "rgba(10,15,30,0.6)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          color: "#94A3B8",
          fontSize: "0.85rem",
        }}
      >
        <span>{fullName}</span>
        <div
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0A0F1E",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        style={{
          width: "100%",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "0.5rem",
          padding: "0.5rem 0.75rem",
          color: "#64748B",
          fontSize: "0.8rem",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        Keluar
      </button>
    </form>
  );
}
