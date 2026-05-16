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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          height: 56,
          maxWidth: 1200,
          margin: "0 auto",
          gap: "1.5rem",
        }}
      >
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/logo-icon.png" alt="NalarUp" width={28} height={28} style={{ borderRadius: 6 }} />
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

        {/* Nav links — sejajar logo */}
        <nav
          style={{
            display: "flex",
            gap: "0.125rem",
            flex: 1,
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
                  gap: "0.4rem",
                  padding: "0.5rem 0.75rem",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: "0.375rem",
                  background: isActive ? "var(--blue-subtle, rgba(37,99,235,0.08))" : "transparent",
                  transition: "color 150ms ease, background 150ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: theme toggle + user + logout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          <ThemeToggle />

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
    </header>
  );
}
