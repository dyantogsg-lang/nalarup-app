"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SectionCard } from "@/components/ui";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Subtest {
  subtest: string;
  questionCount: number;
  passingGrade: number | null;
}

interface HistoryItem {
  id: string;
  status: "in_progress" | "submitted" | "expired" | "cancelled";
  totalScore: number | null;
  isPassed: boolean | null;
  startedAt: Date;
  submittedAt: Date | null;
}

interface Props {
  subtests: Subtest[];
  totalQuestions: number;
  history: HistoryItem[];
  bestScore: number | null;
  rules: readonly string[];
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function TryoutDetailSections({
  subtests,
  totalQuestions,
  history,
  bestScore,
  rules,
}: Props) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Komposisi Subtes */}
      {subtests.length > 0 && (
        <CollapsibleSection title="Komposisi Subtes" defaultOpen>
          <div className="flex flex-col gap-3">
            {subtests.map((s) => {
              const pct = Math.round((s.questionCount / totalQuestions) * 100);
              const color = s.subtest.includes("TWK")
                ? "var(--blue)"
                : s.subtest.includes("TIU")
                ? "var(--violet)"
                : "var(--green)";
              return (
                <div
                  key={s.subtest}
                  className="p-3 sm:p-4 rounded-xl"
                  style={{
                    background: "var(--bg-card2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                        aria-hidden="true"
                      />
                      <span
                        className="font-bold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {s.subtest}
                      </span>
                    </div>
                    <div
                      className="flex gap-3 items-center text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span className="font-semibold">
                        {s.questionCount} soal
                      </span>
                      {s.passingGrade != null && (
                        <span>PG {s.passingGrade}</span>
                      )}
                      <span
                        className="text-[0.7rem]"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${s.subtest}: ${pct}%`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Riwayat Pengerjaan */}
      {history.length > 0 && (
        <CollapsibleSection
          title="Riwayat Pengerjaan"
          defaultOpen={history.length <= 3}
        >
          <div className="flex flex-col gap-0">
            {history.map((h, idx) => {
              const prevScore =
                idx < history.length - 1
                  ? history[idx + 1]?.totalScore
                  : null;
              const trend =
                h.totalScore != null && prevScore != null
                  ? h.totalScore > prevScore
                    ? "up"
                    : h.totalScore < prevScore
                    ? "down"
                    : "same"
                  : null;
              const isBest =
                h.totalScore != null && h.totalScore === bestScore;
              const date = h.submittedAt ?? h.startedAt;
              const statusLabel =
                h.status === "submitted"
                  ? "Selesai"
                  : h.status === "in_progress"
                  ? "Berjalan"
                  : h.status === "expired"
                  ? "Kedaluwarsa"
                  : "Dibatalkan";

              return (
                <div key={h.id} className="flex gap-3">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center w-5 flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{
                        background: isBest
                          ? "var(--green)"
                          : h.status === "submitted"
                          ? "var(--blue)"
                          : "var(--border)",
                        border: isBest
                          ? "2px solid rgba(34,197,94,0.3)"
                          : "2px solid var(--bg-card)",
                      }}
                    />
                    {idx < history.length - 1 && (
                      <div
                        className="w-0.5 flex-1 min-h-[20px]"
                        style={{ background: "var(--border)" }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <Link
                    href={
                      h.status === "submitted"
                        ? ROUTES.result(h.id)
                        : ROUTES.exam(h.id)
                    }
                    className="flex-1 flex justify-between items-center p-3 rounded-xl mb-2 transition-colors no-underline"
                    style={{
                      background: isBest
                        ? "rgba(34,197,94,0.04)"
                        : "var(--bg-card2)",
                      border: `1px solid ${
                        isBest ? "rgba(34,197,94,0.15)" : "var(--border)"
                      }`,
                    }}
                  >
                    <div>
                      <div
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {new Date(date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        className="text-[0.7rem] mt-0.5 flex items-center gap-2"
                        style={{ color: "var(--text-dim)" }}
                      >
                        <span>{statusLabel}</span>
                        {isBest && (
                          <span
                            className="font-semibold"
                            style={{ color: "var(--green)" }}
                          >
                            ★ Terbaik
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trend === "up" && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--green)" }}
                        >
                          ↑
                        </span>
                      )}
                      {trend === "down" && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--danger)" }}
                        >
                          ↓
                        </span>
                      )}
                      {h.status === "submitted" && h.totalScore != null && (
                        <span
                          className="font-bold text-xs px-2 py-0.5 rounded"
                          style={{
                            background: h.isPassed
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(239,68,68,0.08)",
                            color: h.isPassed
                              ? "var(--green)"
                              : "var(--danger)",
                          }}
                        >
                          {h.totalScore}
                          {h.isPassed ? " ✓" : ""}
                        </span>
                      )}
                      {h.status === "in_progress" && (
                        <span
                          className="font-semibold text-xs"
                          style={{ color: "var(--amber)" }}
                        >
                          ⏳
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Aturan Ujian */}
      <CollapsibleSection title="Aturan Ujian" defaultOpen={false}>
        <ul className="flex flex-col gap-2 list-none p-0 m-0">
          {rules.map((r, i) => (
            <li
              key={i}
              className="flex gap-2.5 items-start text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(37,99,235,0.08)",
                  color: "var(--blue)",
                }}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}

// ─── Collapsible Section ────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <SectionCard padding="sm" className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1 cursor-pointer"
        style={{ background: "transparent", border: "none" }}
        aria-expanded={open}
        aria-controls={`section-${title}`}
      >
        <h2
          className="text-sm font-bold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id={`section-${title}`}
        className={`transition-all duration-200 overflow-hidden ${
          open ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!open}
      >
        {children}
      </div>
    </SectionCard>
  );
}
