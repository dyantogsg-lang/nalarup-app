"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  GlassCard,
  ProgressRing,
  StatCard,
  Button3D,
  PageTransition,
  StreakBadge,
} from "@/components/ui";
import { ROUTES } from "@/lib/constants/routes";

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

interface HistoryStats {
  totalSubmitted: number;
  avgScore: number | null;
  passedCount: number;
  bestScore: number | null;
  streakDays: number;
}

const PASSING_GRADE = 311;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function HistoryClient({
  history,
  stats,
}: {
  history: HistoryItem[];
  stats: HistoryStats;
}) {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = tab === "all" ? history : history.filter((h) => h.status === tab);

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "Semua", count: history.length },
    { value: "submitted", label: "Selesai", count: history.filter((h) => h.status === "submitted").length },
    { value: "in_progress", label: "Berjalan", count: history.filter((h) => h.status === "in_progress").length },
  ];

  // Build trend map
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
    <PageTransition className="container-md">
      <motion.div variants={stagger} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Riwayat Tryout
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Semua sesi tryout kamu — selesai maupun yang masih berjalan.
          </p>
        </motion.div>

        {/* Streak + Stats */}
        {stats.totalSubmitted > 0 && (
          <motion.div variants={fadeUp}>
            {/* Streak banner */}
            {stats.streakDays > 0 && (
              <GlassCard glow="orange" className="mb-4 !p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-400">
                      🔥 {stats.streakDays} Hari Streak!
                    </span>
                    <p className="text-xs text-[var(--text-dim)] mt-0.5">
                      Terus latihan setiap hari untuk jaga streak kamu.
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                label="Total Selesai"
                value={stats.totalSubmitted}
                accent="blue"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>}
              />
              <StatCard
                label="Rata-rata Skor"
                value={stats.avgScore ?? "—"}
                accent="violet"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>}
              />
              <StatCard
                label="Lulus Passing"
                value={`${stats.passedCount}/${stats.totalSubmitted}`}
                accent="green"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              />
              <StatCard
                label="Skor Terbaik"
                value={stats.bestScore ?? "—"}
                accent="amber"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
              />
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <motion.div variants={fadeUp} className="flex gap-2 mb-5">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-150 border ${
                tab === t.value
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold"
                  : "border-white/10 bg-white/[0.03] text-[var(--text-muted)] font-medium hover:bg-white/[0.06]"
              }`}
            >
              {t.label}
              <span
                className={`text-[0.68rem] font-semibold px-1.5 py-0.5 rounded-full ${
                  tab === t.value ? "bg-emerald-500/15" : "bg-white/[0.06]"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* List */}
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp}>
            <GlassCard className="text-center py-12">
              <div className="mb-5 opacity-50">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              {history.length === 0 ? (
                <>
                  <h3 className="font-bold text-base mb-2 text-[var(--text-primary)]">
                    Belum ada riwayat
                  </h3>
                  <p className="text-sm mb-6 max-w-[360px] mx-auto text-[var(--text-muted)] leading-relaxed">
                    Mulai tryout pertama untuk melihat progress dan analisis skor kamu di sini.
                  </p>
                  <Button3D variant="green" href={ROUTES.tryouts}>
                    Lihat Katalog Tryout
                  </Button3D>
                </>
              ) : (
                <p className="text-sm text-[var(--text-dim)]">
                  Tidak ada riwayat untuk filter ini.
                </p>
              )}
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={stagger} className="flex flex-col gap-3">
            {filtered.map((h) => {
              const trend = trendMap.get(h.id) ?? null;
              const date = h.submittedAt ?? h.startedAt;

              const href = h.status === "submitted"
                ? `/results/${h.id}`
                : h.status === "in_progress"
                ? `/exam/${h.id}`
                : "#";

              return (
                <motion.div key={h.id} variants={fadeUp}>
                  <Link href={href} className="no-underline block">
                    <GlassCard hoverable className="!p-4">
                      <div className="flex items-center gap-4">
                        {/* Score ring or status icon */}
                        {h.status === "submitted" && h.totalScore != null ? (
                          <div
                            style={{
                              filter: h.isPassed
                                ? "drop-shadow(0 0 6px rgba(34,197,94,0.3))"
                                : "drop-shadow(0 0 6px rgba(239,68,68,0.2))",
                            }}
                          >
                            <ProgressRing
                              value={h.totalScore}
                              max={PASSING_GRADE}
                              size={44}
                              strokeWidth={4}
                              color={h.isPassed ? "var(--green)" : "var(--danger)"}
                              className="flex-shrink-0"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center flex-shrink-0 rounded-xl w-[44px] h-[44px] bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            {h.status === "in_progress" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            )}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate text-[var(--text-primary)]">
                            {h.packageTitle}
                          </div>
                          <div className="text-xs mt-0.5 text-[var(--text-dim)]">
                            {new Date(date).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {/* Score + trend */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {trend === "up" && (
                            <span className="text-sm font-bold text-emerald-400">↑</span>
                          )}
                          {trend === "down" && (
                            <span className="text-sm font-bold text-red-400">↓</span>
                          )}
                          {h.status === "submitted" && h.totalScore != null ? (
                            <span
                              className={`font-bold text-sm px-2.5 py-1 rounded-lg ${
                                h.isPassed
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {h.totalScore} {h.isPassed ? "✓" : ""}
                            </span>
                          ) : h.status === "in_progress" ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400">
                              Berjalan
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] text-[var(--text-dim)]">
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Arrow */}
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-[var(--text-dim)]">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}
