"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[var(--container-lg)] px-4 sm:px-6 pb-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        {/* Error icon with glow */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            boxShadow: "0 0 24px rgba(239,68,68,0.15)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2
          className="text-xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Terjadi Kesalahan
        </h2>
        <p
          className="text-sm mb-6 max-w-md"
          style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
        >
          Dashboard gagal dimuat. Ini mungkin masalah sementara — coba muat
          ulang halaman.
        </p>

        {error.digest && (
          <p
            className="text-[10px] font-mono mb-4"
            style={{ color: "var(--text-dim)" }}
          >
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
