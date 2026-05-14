"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SaveStar } from "@/components/catalog/SaveStar";

const STORAGE_KEY = "nalarup-saved-packages";

function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function SavedPageClient() {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSavedSlugs(getSavedSlugs());

    // Listen for storage changes (from other tabs or SaveStar clicks)
    function onStorage() {
      setSavedSlugs(getSavedSlugs());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Re-check on focus (user might unsave from catalog page)
  useEffect(() => {
    function onFocus() {
      setSavedSlugs(getSavedSlugs());
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (!mounted) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
            Disimpan
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Paket tryout yang kamu tandai dengan bintang.
          </p>
        </div>
        <div className="skeleton" style={{ height: 200, borderRadius: "1rem" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Disimpan
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Paket tryout yang kamu tandai dengan bintang.
        </p>
      </div>

      {savedSlugs.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "1rem",
            background: "var(--amber-subtle)",
            border: "1px solid rgba(245,158,11,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            color: "var(--amber)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem", fontSize: "1rem" }}>
            Belum ada paket disimpan
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem", maxWidth: 360, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
            Klik bintang di paket tryout untuk menyimpannya di sini. Akses cepat tanpa cari ulang.
          </p>
          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
              Lihat Katalog Tryout
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {savedSlugs.map((slug) => (
            <div
              key={slug}
              className="glass-card"
              style={{
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <Link
                href={ROUTES.tryoutDetail(slug)}
                style={{
                  textDecoration: "none",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "2px" }}>
                  Klik untuk lihat detail paket
                </div>
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <Link href={ROUTES.tryoutDetail(slug)}>
                  <button className="btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", cursor: "pointer" }}>
                    Buka
                  </button>
                </Link>
                <SaveStar slug={slug} />
              </div>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
              {savedSlugs.length} paket disimpan
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
