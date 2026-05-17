"use client";

import { type ReactNode } from "react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the dashboard route segment.
 * Catches unexpected errors from DB queries or rendering.
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="mx-auto max-w-[var(--container-lg)] px-4 sm:px-6">
      <div className="glass-card p-8 text-center max-w-md mx-auto mt-12">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.08)", color: "var(--danger)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2
          className="text-lg font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Terjadi Kesalahan
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--text-muted)", lineHeight: 1.6 }}
        >
          Gagal memuat data dashboard. Coba muat ulang halaman ini.
        </p>
        <button
          onClick={reset}
          className="btn-primary"
          style={{ padding: "0.65rem 1.5rem", fontSize: "0.88rem", borderRadius: "0.75rem" }}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
