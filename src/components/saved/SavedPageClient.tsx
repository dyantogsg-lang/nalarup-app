"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SaveStar } from "@/components/catalog/SaveStar";

const STORAGE_KEY = "nalarup-saved-packages";
const STORAGE_EVENT = "nalarup-saved-packages-change";

function getSavedSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getSavedSlugsFromSnapshot(snapshot: string): string[] {
  try {
    return JSON.parse(snapshot);
  } catch {
    return [];
  }
}

function subscribeToSavedSlugs(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("focus", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
}

function getAccentFromSlug(slug: string): string {
  if (slug.includes("skd") || slug.includes("simulasi")) return "var(--danger)";
  if (slug.includes("twk")) return "var(--blue)";
  if (slug.includes("tiu")) return "var(--violet)";
  if (slug.includes("tkp")) return "var(--green)";
  return "var(--blue)";
}

function getModeFromSlug(slug: string): { label: string; color: string } {
  if (slug.includes("simulasi") || slug.includes("skd")) return { label: "Simulasi", color: "var(--danger)" };
  return { label: "Latihan", color: "var(--blue)" };
}

function formatSlugTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function clearAllSaved() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function SavedPageClient() {
  const savedSnapshot = useSyncExternalStore(subscribeToSavedSlugs, getSavedSnapshot, () => "[]");
  const savedSlugs = getSavedSlugsFromSnapshot(savedSnapshot);

  if (typeof window === "undefined") {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 1rem" }}>
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
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 1rem" }}>

      {/* ===== HEADER — gradient + counter ===== */}
      <div style={{
        marginBottom: "1.75rem",
        padding: "2rem 2.25rem",
        background: "linear-gradient(135deg, rgba(245,158,11,0.05), rgba(245,158,11,0.02))",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "0.875rem",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--amber)",
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>
              Disimpan
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Paket tryout yang kamu tandai dengan bintang.
            </p>
          </div>
        </div>
        {savedSlugs.length > 0 && (
          <div style={{
            padding: "0.5rem 1rem",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            <span className="num" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--amber)" }}>{savedSlugs.length}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 500 }}>paket</span>
          </div>
        )}
      </div>

      {/* ===== CONTENT ===== */}
      {savedSlugs.length === 0 ? (
        /* ===== EMPTY STATE — tutorial steps ===== */
        <div style={{
          padding: "3.5rem 2rem",
          textAlign: "center",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "1.25rem",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--amber)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
            Belum ada paket disimpan
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "2rem", maxWidth: 380, margin: "0 auto 2rem", lineHeight: 1.6 }}>
            Simpan paket favorit untuk akses cepat tanpa cari ulang.
          </p>

          {/* Tutorial steps */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[
              { n: "1", label: "Buka Katalog", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { n: "2", label: "Klik ★ di paket", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { n: "3", label: "Akses di sini", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "0.75rem",
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--amber)",
                }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>{step.label}</span>
              </div>
            ))}
          </div>

          <Link href={ROUTES.tryouts}>
            <button className="btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem", borderRadius: "0.75rem", cursor: "pointer" }}>
              Lihat Katalog Tryout
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* ===== SAVED ITEMS — grid 2 col if many ===== */}
          <div style={{
            display: "grid",
            gridTemplateColumns: savedSlugs.length > 4 ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr",
            gap: "0.75rem",
          }}>
            {savedSlugs.map((slug, idx) => {
              const accent = getAccentFromSlug(slug);
              const mode = getModeFromSlug(slug);
              const title = formatSlugTitle(slug);

              return (
                <div key={slug} style={{
                  padding: "1.25rem 1.5rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                  {/* Number */}
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: "0.5rem",
                    background: "var(--bg-card2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--text-dim)",
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>

                  {/* Info */}
                  <Link href={ROUTES.tryoutDetail(slug)} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                    <div style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "0.2rem",
                    }}>
                      {title}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        padding: "0.12rem 0.45rem",
                        borderRadius: "999px",
                        background: mode.color === "var(--danger)" ? "rgba(239,68,68,0.1)" : "rgba(37,99,235,0.1)",
                        color: mode.color,
                        border: `1px solid ${mode.color === "var(--danger)" ? "rgba(239,68,68,0.2)" : "rgba(37,99,235,0.2)"}`,
                      }}>
                        {mode.label}
                      </span>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <Link href={ROUTES.tryoutDetail(slug)}>
                      <button className="btn-primary" style={{
                        padding: "0.4rem 0.85rem",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        borderRadius: "0.5rem",
                        fontWeight: 600,
                      }}>
                        Mulai
                      </button>
                    </Link>
                    <SaveStar slug={slug} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer — count + clear all */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.25rem",
            padding: "0.75rem 1rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
          }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              {savedSlugs.length} paket disimpan
            </span>
            <button
              onClick={clearAllSaved}
              style={{
                padding: "0.4rem 0.85rem",
                fontSize: "0.72rem",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 500,
                transition: "border-color 150ms ease",
              }}
            >
              Hapus Semua
            </button>
          </div>
        </>
      )}
    </div>
  );
}
