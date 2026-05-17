"use client";

import Link from "next/link";
import { useState } from "react";
import { ProgressRing } from "@/components/ui";

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
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-150"
            style={{
              border: tab === t.value ? "1px solid rgba(37,99,235,0.4)" : "1px solid var(--border)",
              background: tab === t.value ? "rgba(37,99,235,0.1)" : "var(--bg-card)",
              color: tab === t.value ? "var(--blue)" : "var(--text-muted)",
              fontWeight: tab === t.value ? 700 : 500,
            }}
          >
            {t.label}
            <span
              className="text-[0.68rem] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                background: tab === t.value ? "rgba(37,99,235,0.15)" : "var(--bg-card2)",
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm" style={{ color: "var(--text-dim)" }}>
          Tidak ada riwayat untuk filter ini.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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

            return (
              <Link key={h.id} href={href} className="no-underline">
                <div
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors duration-150"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${accentBorder}`,
                  }}
                >
                  {/* Score ring or status icon */}
                  {h.status === "submitted" && h.totalScore != null ? (
                    <ProgressRing
                      value={h.totalScore}
                      max={PASSING_GRADE}
                      size={40}
                      strokeWidth={3.5}
                      color={h.isPassed ? "var(--green)" : "var(--danger)"}
                      className="flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center flex-shrink-0 rounded-[0.625rem]"
                      style={{
                        width: 40,
                        height: 40,
                        background: h.status === "in_progress" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.06)",
                        border: `1px solid ${h.status === "in_progress" ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                        color: h.status === "in_progress" ? "var(--amber)" : "var(--text-dim)",
                      }}
                    >
                      {h.status === "in_progress" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {h.packageTitle}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                      {new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Score + trend */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {trend === "up" && <span className="text-sm font-bold" style={{ color: "var(--green)" }}>↑</span>}
                    {trend === "down" && <span className="text-sm font-bold" style={{ color: "var(--danger)" }}>↓</span>}
                    {h.status === "submitted" && h.totalScore != null ? (
                      <span
                        className="font-bold text-sm px-2.5 py-1 rounded-lg"
                        style={{
                          background: h.isPassed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                          color: h.isPassed ? "var(--green)" : "var(--danger)",
                        }}
                      >
                        {h.totalScore} {h.isPassed ? "✓" : ""}
                      </span>
                    ) : h.status === "in_progress" ? (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          color: "var(--amber)",
                        }}
                      >
                        Berjalan
                      </span>
                    ) : (
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{
                          background: "rgba(148,163,184,0.08)",
                          color: "var(--text-dim)",
                        }}
                      >
                        Expired
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" style={{ color: "var(--text-dim)" }}>
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
