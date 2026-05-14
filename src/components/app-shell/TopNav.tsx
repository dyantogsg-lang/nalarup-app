"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/tryouts", label: "Katalog Tryout", icon: "◎" },
  { href: "/history", label: "Riwayat", icon: "◷" },
  { href: "/saved", label: "Disimpan", icon: "☆" },
  { href: "/profile", label: "Profil", icon: "◯" },
];

export function TopNav({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const initial = fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Top row: logo + user */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          height: 56,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span
            className="gradient-text"
            style={{
              fontWeight: 800,
              fontSize: "1.15rem",
              letterSpacing: "-0.02em",
            }}
          >
            NalarUp
          </span>
        </Link>

        {/* Right: theme toggle + user + logout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <ThemeToggle />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ display: "none" }} className="topnav-name">
              {fullName}
            </span>
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

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                padding: "0.4rem 0.75rem",
                color: "var(--text-dim)",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "color 150ms ease, border-color 150ms ease",
              }}
            >
              Keluar
            </button>
          </form>
        </div>
      </div>

      {/* Nav row */}
      <nav
        style={{
          borderTop: "1px solid var(--border)",
          padding: "0 1.5rem",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          gap: "0.25rem",
          overflowX: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                textDecoration: "none",
                fontSize: "0.84rem",
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive
                  ? "2px solid var(--blue)"
                  : "2px solid transparent",
                transition: "color 150ms ease, border-color 150ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
