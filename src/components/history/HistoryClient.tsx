"use client";

import Link from "next/link";
import { useState } from "react";

type HistoryItem = {
  id: string;
  totalScore: number | null;
  isPassed: boolean | null;
  status: string;
  submittedAt: string | null;
  startedAt: string;
  packageTitle: string;
  packageSlug: string;
  packageDuration: number;
};

type Tab = "all" | "submitted" | "in_progress";

const PASSING_GRADE = 311;

export function HistoryClient({ history }: { history: HistoryItem[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = tab === "all" ? history : history.filter((h) => h.status === tab);

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "Semua", count: history.length },
    { value: "submitted", label: "Selesai", count: history.filter((h) => h.status === "submitted").length },
    { value: "in_progress", label: "Berjalan", count: history.filter((h) => h.status === "in_progress").length },
  ];

  // Build trend map: for each item, compare with previous attempt of same package
  const trendMap = new Map<string, "up" | "down" | "same" | null>();
  const packageScores = new Map<string, number[]>();
  // Process in chronological order (history is desc, so reverse)
  const chronological = [...history].reverse();
  for (const h of chronological) {
    if (h.status === "submitted" && h.totalScore != null) {
      const scores = packageScores.get(h.packageSlug) ?? [];
      if (scores.length > 0) {
        const prev = scores[scores.length - 1];
        trendMap.set(h.id, h.totalScore > prev ? "up" : h.totalScore < prev ? "down" : "same");
      }
      scores.push(h.totalScore);
      packageScores.set(h.packageSlug, scores);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              border: tab === t.value ? "1px solid rgba(37,99,235,0.4)" : "1px solid var(--border)",
              background: tab === t.value ? "rgba(37,99,235,0.1)" : "var(--bg-card)",
              color: tab === t.value ? "var(--blue)" : "var(--text-muted)",
              fontSize: "0.82rem",
              fontWeight: tab === t.value ? 700 : 500,
              cursor: "pointer",
              transition: "all 150ms ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {t.label}
            <span style={{
              fontSize: "0.68rem",
              background: tab === t.value ? "rgba(37,99,235,0.15)" : "var(--bg-card2)",
              padding: "0.1rem 0.4rem",
              borderRadius: "999px",
              fontWeight: 600,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem" }}>
          Tidak ada riwayat untuk filter ini.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((h) => {
            const trend = trendMap.get(h.id) ?? null;
            const date = h.submittedAt ?? h.startedAt;
            const accentBorder =
              h.status === "submitted"
                ? h.isPassed ? "var(--green)" : "var(--danger)"
                : h.status === "in_progress" ? "var(--amber)" : "var(--text-dim)";

            const href = h.status === "submitted"
              ? `/results/${h.id}`
              : h.status === "in_progress"
              ? `/exam/${h.id}`
              : "#";

            // Mini ring for score
            const scorePct = h.totalScore != null && PASSING_GRADE > 0
              ? Math.min(100, Math.round((h.totalScore / PASSING_GRADE) * 100))
              : 0;
            const RADIUS = 16;
            const CIRC = 2 * Math.PI * RADIUS;
            const offset = CIRC - (scorePct / 100) * CIRC;

            return (
              <Link key={h.id} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "1.1rem 1.25rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${accentBorder}`,
                  borderRadius: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  transition: "border-color 150ms ease",
                  cursor: "pointer",
                }}>
                  {/* Score ring or status icon */}
                  {h.status === "submitted" && h.totalScore != null ? (
                    <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                      <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="20" cy="20" r={RADIUS} fill="none" strokeWidth="3.5" stroke="var(--border)" />
                        <circle cx="20" cy="20" r={RADIUS} fill="none" strokeWidth="3.5"
                          stroke={h.isPassed ? "var(--green)" : "var(--danger)"}
                          strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round" />
                      </svg>
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                      }}>
                        {scorePct}%
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "0.625rem",
                      background: h.status === "in_progress" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.06)",
                      border: `1px solid ${h.status === "in_progress" ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: h.status === "in_progress" ? "var(--amber)" : "var(--text-dim)",
                      flexShrink: 0,
                    }}>
                      {h.status === "in_progress" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--text-primary)", fontSize: "0.88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {h.packageTitle}
                    </div>
                    <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                      {new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Score + trend */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    {trend === "up" && <span style={{ color: "var(--green)", fontSize: "0.88rem", fontWeight: 700 }}>↑</span>}
                    {trend === "down" && <span style={{ color: "var(--danger)", fontSize: "0.88rem", fontWeight: 700 }}>↓</span>}
                    {h.status === "submitted" && h.totalScore != null ? (
                      <span style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        padding: "0.2rem 0.65rem",
                        borderRadius: "0.4rem",
                        background: h.isPassed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                        color: h.isPassed ? "var(--green)" : "var(--danger)",
                      }}>
                        {h.totalScore} {h.isPassed ? "✓" : ""}
                      </span>
                    ) : h.status === "in_progress" ? (
                      <span style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "0.4rem",
                        background: "rgba(245,158,11,0.1)",
                        color: "var(--amber)",
                      }}>
                        Berjalan
                      </span>
                    ) : (
                      <span style={{
                        fontSize: "0.78rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "0.4rem",
                        background: "rgba(148,163,184,0.08)",
                        color: "var(--text-dim)",
                      }}>
                        Expired
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
