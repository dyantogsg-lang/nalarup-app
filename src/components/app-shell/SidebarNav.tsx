"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/tryouts", label: "Katalog Tryout", icon: "◎" },
  { href: "/history", label: "Riwayat", icon: "◷" },
  { href: "/saved", label: "Disimpan", icon: "☆" },
  { href: "/profile", label: "Profil", icon: "◯" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
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
              gap: "0.75rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.5rem",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              background: isActive
                ? "var(--blue-subtle)"
                : "transparent",
              border: isActive
                ? "1px solid rgba(37,99,235,0.2)"
                : "1px solid transparent",
              textDecoration: "none",
              fontSize: "0.875rem",
              marginBottom: "0.25rem",
              transition: "all 0.15s",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
