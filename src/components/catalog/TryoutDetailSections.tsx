"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "@/lib/constants/routes";
import { GlassCard, ProgressRing } from "@/components/ui";

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

// Neon colors for subtests
const SUBTEST_COLORS: Record<string, string> = {
  TWK: "#3b82f6",
  TIU: "#8b5cf6",
  TKP: "#22c55e",
};

function getSubtestColor(name: string): string {
  for (const [key, color] of Object.entries(SUBTEST_COLORS)) {
    if (name.includes(key)) return color;
  }
  return "#3b82f6";
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
        <CollapsibleSection title="Komposisi Subtes" icon="📊" defaultOpen>
          <div className="flex flex-col gap-3">
            {subtests.map((s, idx) => {
              const pct = Math.round((s.questionCount / totalQuestions) * 100);
              const color = getSubtestColor(s.subtest);
              return (
                <motion.div
                  key={s.subtest}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: color,
                          boxShadow: `0 0 8px ${color}60`,
                        }}
                        aria-hidden="true"
                      />
                      <span className="font-bold text-sm text-[var(--text-primary)]">
                        {s.subtest}
                      </span>
                    </div>
                    <div className="flex gap-3 items-center text-xs text-[var(--text-muted)]">
                      <span className="font-semibold num">
                        {s.questionCount} soal
                      </span>
                      {s.passingGrade != null && (
                        <span className="text-emerald-400/80 font-medium">
                          PG {s.passingGrade}
                        </span>
                      )}
                      <span
                        className="text-[0.7rem] font-bold px-1.5 py-0.5 rounded bg-white/[0.06]"
                        style={{ color }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* XP-style progress bar */}
                  <div
                    className="h-2 rounded-full overflow-hidden bg-white/[0.06]"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${s.subtest}: ${pct}%`}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        boxShadow: `0 0 10px ${color}40`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Riwayat Pengerjaan */}
      {history.length > 0 && (
        <CollapsibleSection
          title="Riwayat Pengerjaan"
          icon="📈"
          defaultOpen={history.length <= 3}
        >
          <div className="flex flex-col gap-3">
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
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={
                      h.status === "submitted"
                        ? ROUTES.result(h.id)
                        : ROUTES.exam(h.id)
                    }
                    className={`flex items-center justify-between p-4 rounded-xl transition-all no-underline border ${
                      isBest
                        ? "bg-emerald-500/[0.06] border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_16px_rgba(34,197,94,0.12)]"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini score ring */}
                      {h.status === "submitted" && h.totalScore != null ? (
                        <ProgressRing
                          value={h.totalScore}
                          max={h.totalScore > 100 ? 1000 : 100}
                          size={40}
                          strokeWidth={3}
                          color={h.isPassed ? "#22c55e" : "#3b82f6"}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-sm">
                          {h.status === "in_progress" ? "⏳" : "—"}
                        </div>
                      )}

                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                          {new Date(date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[0.7rem] mt-0.5 flex items-center gap-2 text-[var(--text-dim)]">
                          <span>{statusLabel}</span>
                          {isBest && (
                            <span className="font-bold text-emerald-400">
                              ★ Terbaik
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {trend === "up" && (
                        <span className="text-xs text-emerald-400 font-bold">↑</span>
                      )}
                      {trend === "down" && (
                        <span className="text-xs text-red-400 font-bold">↓</span>
                      )}
                      {h.status === "submitted" && h.totalScore != null && (
                        <span
                          className="font-bold text-sm num px-2.5 py-1 rounded-lg"
                          style={{
                            background: h.isPassed
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(239,68,68,0.1)",
                            color: h.isPassed ? "#22c55e" : "#ef4444",
                            boxShadow: h.isPassed
                              ? "0 0 8px rgba(34,197,94,0.2)"
                              : "none",
                          }}
                        >
                          {h.totalScore}
                          {h.isPassed ? " ✓" : ""}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Aturan Ujian */}
      <CollapsibleSection title="Aturan Ujian" icon="📋" defaultOpen={false}>
        <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
          {rules.map((r, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="flex gap-3 items-start text-sm text-[var(--text-primary)]"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold flex-shrink-0 mt-0.5 bg-blue-500/15 text-blue-400"
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="leading-relaxed">{r}</span>
            </motion.li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}

// ─── Collapsible Section ────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <GlassCard className="!p-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
        aria-controls={`section-${title}`}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-base" aria-hidden="true">{icon}</span>}
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`section-${title}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
