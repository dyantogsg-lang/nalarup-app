"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants/routes";
import { COPY } from "@/lib/constants/copy";
import {
  GlassCard,
  ProgressRing,
  StatCard,
  Button3D,
  AnimatedCounter,
  AlertBox,
  PageTransition,
} from "@/components/ui";

interface SubtestItem {
  subtest: string;
  score: number;
  questionCount: number;
  passingGrade: number | null;
  isPassed: boolean | null;
}

interface WeaknessItem {
  topicId: string | null;
  topicName: string | null;
  subtest: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
}

interface ResultsClientProps {
  totalScore: number;
  scoreMax: number;
  ringColor: string;
  isPassed: boolean;
  passing: number | null;
  target: number | null;
  safeGap: number | null;
  passingGap: number | null;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  accuracy: number;
  subtestBreakdown: SubtestItem[];
  weakest: WeaknessItem[];
  weakestSubtest: SubtestItem | null;
  packageTitle: string;
  packageSlug: string;
  attemptId: string;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function ResultsClient({
  totalScore,
  scoreMax,
  ringColor,
  isPassed,
  passing,
  target,
  safeGap,
  passingGap,
  correctCount,
  wrongCount,
  emptyCount,
  accuracy,
  subtestBreakdown,
  weakest,
  weakestSubtest,
  packageTitle,
  packageSlug,
  attemptId,
}: ResultsClientProps) {
  const xpEarned = Math.round(totalScore * 0.3) + (isPassed ? 50 : 10);

  return (
    <PageTransition className="container-md">
      {/* ===== SCORE HERO ===== */}
      <motion.div variants={stagger} initial="hidden" animate="show">
        {/* Title */}
        <motion.div variants={fadeUp} className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {isPassed ? "🎉 Lulus Passing Grade!" : "Belum Lulus"}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{packageTitle}</p>
        </motion.div>

        {/* Big Score Ring */}
        <motion.div variants={fadeUp}>
          <GlassCard glow={isPassed ? "green" : undefined} className="mb-6">
            <div className="flex flex-col items-center py-4">
              {/* Neon glow ring wrapper */}
              <div
                className="relative mb-4"
                style={{
                  filter: isPassed
                    ? "drop-shadow(0 0 20px rgba(34,197,94,0.4))"
                    : "drop-shadow(0 0 20px rgba(239,68,68,0.3))",
                }}
              >
                <ProgressRing
                  value={totalScore}
                  max={scoreMax}
                  size={160}
                  strokeWidth={14}
                  color={ringColor}
                  subLabel={passing != null ? `PG ${passing}` : "skor"}
                  passingGrade={passing ?? undefined}
                />
              </div>

              {/* Score number */}
              <div className="flex items-baseline gap-2 mb-2">
                <AnimatedCounter
                  value={totalScore}
                  className="text-4xl text-[var(--text-primary)]"
                />
                {passing != null && (
                  <span className="text-sm text-[var(--text-dim)]">/ PG {passing}</span>
                )}
              </div>

              {/* Pass/fail badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                  isPassed
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {isPassed ? "✓ Lulus" : "✗ Belum Lulus"}
              </span>

              {/* XP earned animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-400" aria-hidden="true">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                </svg>
                <span className="text-sm font-bold text-emerald-400">+{xpEarned} XP</span>
              </motion.div>

              {/* Gap info */}
              {target != null && (
                <p className="mt-3 text-xs text-[var(--text-muted)] text-center max-w-xs leading-relaxed">
                  {(safeGap ?? 0) <= 0 ? (
                    <>Skor kamu sudah <strong className="text-emerald-400">aman</strong> — lebih {Math.abs(safeGap ?? 0)} poin dari target {target}.</>
                  ) : (
                    <>Butuh <strong className="text-blue-400">+{safeGap}</strong> poin lagi untuk target aman {target}.
                    {passingGap != null && passingGap > 0 && <> PG kurang {passingGap}.</>}</>
                  )}
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* ===== STAT CARDS ===== */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Benar"
            value={correctCount}
            accent="green"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          />
          <StatCard
            label="Salah"
            value={wrongCount}
            accent="amber"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          />
          <StatCard
            label="Kosong"
            value={emptyCount}
            accent="blue"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          />
          <StatCard
            label="Akurasi"
            value={`${accuracy}%`}
            accent="violet"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
          />
        </motion.div>

        {/* ===== SUBTEST BREAKDOWN ===== */}
        {subtestBreakdown.length > 0 && (
          <motion.div variants={fadeUp}>
            <GlassCard className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-dim)] mb-4">
                Skor per Subtes
              </h2>
              <div className="flex flex-col gap-3">
                {subtestBreakdown.map((s) => {
                  const max = s.questionCount * 5;
                  const pct = max > 0 ? Math.min(100, Math.round((s.score / max) * 100)) : 0;
                  const color = s.subtest.includes("TWK")
                    ? "var(--blue)"
                    : s.subtest.includes("TIU")
                    ? "var(--violet)"
                    : "var(--green)";
                  const safe = s.isPassed === true;

                  return (
                    <div
                      key={s.subtest}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                    >
                      {/* Mini ring */}
                      <ProgressRing
                        value={s.score}
                        max={max}
                        size={44}
                        strokeWidth={4}
                        color={color}
                        className="flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">
                            {s.subtest}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm" style={{ color }}>
                              {s.score}
                            </span>
                            <span className="text-xs text-[var(--text-dim)]">/ {max}</span>
                            {s.passingGrade != null && (
                              <span
                                className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded ${
                                  safe
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {safe ? "✓ Pass" : `PG ${s.passingGrade}`}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                          />
                          {s.passingGrade != null && max > 0 && (
                            <div
                              className="absolute top-[-1px] bottom-[-1px] w-0.5 bg-amber-400"
                              style={{
                                left: `${Math.min(100, Math.round((s.passingGrade / max) * 100))}%`,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ===== TOPIC WEAKNESS ===== */}
        {weakest.length > 0 && (
          <motion.div variants={fadeUp}>
            <GlassCard className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                Prioritas Belajar Kamu
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                Topik dengan jawaban salah terbanyak. Fokus latihan di sini untuk naikkan skor cepat.
              </p>
              <div className="flex flex-col gap-2.5">
                {weakest.map((t, idx) => (
                  <div
                    key={`${t.topicId ?? "unk"}-${t.subtest}`}
                    className="flex justify-between items-center gap-3 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.12]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex items-center justify-center flex-shrink-0 text-[0.68rem] font-bold rounded-lg w-[26px] h-[26px] bg-red-500/10 border border-red-500/15 text-red-400">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {t.subtest}{t.topicName ? ` — ${t.topicName}` : ""}
                        </div>
                        <div className="text-xs mt-0.5 text-[var(--text-dim)]">
                          {t.totalQuestions} soal · benar {t.correctCount} · kosong {t.emptyCount}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 bg-red-500/10 text-red-400">
                      {t.wrongCount} salah
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ===== CTA BAR ===== */}
        <motion.div variants={fadeUp}>
          <GlassCard className="mb-8">
            {weakestSubtest && weakestSubtest.isPassed === false && (
              <AlertBox variant="info" className="mb-4">
                Rekomendasi: fokus latihan <strong>{weakestSubtest.subtest}</strong> dulu — gap terbesar dari passing grade.
              </AlertBox>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button3D variant="green" href={ROUTES.review(attemptId)} className="w-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {COPY.cta.reviewWrong}
              </Button3D>
              <Button3D variant="ghost" href={ROUTES.tryoutDetail(packageSlug)} className="w-full">
                {COPY.cta.retryTryout}
              </Button3D>
              <Button3D variant="ghost" href={ROUTES.tryouts} className="w-full">
                {COPY.cta.viewCatalog}
              </Button3D>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
