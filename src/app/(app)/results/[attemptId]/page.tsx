import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { getAttemptResult } from "@/lib/results/queries";
import { ROUTES } from "@/lib/constants/routes";
import { COPY } from "@/lib/constants/copy";
import { PageHeader, StatCard, ProgressRing, SectionCard, AlertBox } from "@/components/ui";

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { attemptId } = await params;
  const { profile } = await requireUser();
  const data = await getAttemptResult(attemptId, profile.id);

  if (!data) notFound();
  const { attempt, pkg, subtestBreakdown, topicWeakness } = data;

  if (attempt.status !== "submitted") {
    notFound();
  }

  const passing = pkg.passingGradeTotal;
  const target = pkg.targetSafeScore;
  const totalScore = attempt.totalScore ?? 0;

  const safeGap = target != null ? target - totalScore : null;
  const passingGap = passing != null ? passing - totalScore : null;
  const totalQ = attempt.correctCount! + attempt.wrongCount! + attempt.emptyCount!;
  const accuracy = totalQ > 0 ? Math.round(((attempt.correctCount ?? 0) / totalQ) * 100) : 0;

  // Top 3 weakness with wrong > 0
  const weakest = topicWeakness.filter((t) => t.wrongCount > 0).slice(0, 3);

  // Weakest subtest for contextual recommendation
  const weakestSubtest = subtestBreakdown.length > 0
    ? subtestBreakdown.reduce((a, b) => {
        const aGap = a.passingGrade != null ? a.passingGrade - a.score : 0;
        const bGap = b.passingGrade != null ? b.passingGrade - b.score : 0;
        return bGap > aGap ? b : a;
      })
    : null;

  // Score percentage for the main ring
  const scoreMax = target ?? passing ?? 500;
  const scorePct = Math.min(100, Math.round((totalScore / scoreMax) * 100));
  const ringColor = attempt.isPassed ? "var(--green)" : scorePct >= 70 ? "var(--amber)" : "var(--danger)";

  return (
    <div className="container-md">
      <PageHeader
        title={attempt.isPassed ? "🎉 Lulus Passing Grade" : "Belum Lulus"}
        subtitle={pkg.title}
        gradient={false}
      />

      {/* ===== SCORE HERO ===== */}
      <SectionCard padding="lg" className="mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Prominent score ring */}
          <ProgressRing
            value={totalScore}
            max={scoreMax}
            size={140}
            strokeWidth={12}
            color={ringColor}
            subLabel={passing != null ? `PG ${passing}` : "skor"}
            passingGrade={passing ?? undefined}
          />

          {/* Score info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-2 mb-2">
              <span
                className="font-bold leading-none"
                style={{ fontSize: "3rem", color: "var(--text-primary)", letterSpacing: "-0.03em" }}
              >
                {totalScore}
              </span>
              {passing != null && (
                <span className="text-sm" style={{ color: "var(--text-dim)" }}>/ PG {passing}</span>
              )}
            </div>

            {/* Pass/fail badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: attempt.isPassed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                color: attempt.isPassed ? "var(--green)" : "var(--danger)",
              }}
            >
              {attempt.isPassed ? "✓ Lulus" : "✗ Belum Lulus"}
            </span>

            {target != null && (
              <p className="mt-3 text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                {(safeGap ?? 0) <= 0 ? (
                  <>Skor kamu sudah <strong style={{ color: "var(--green)" }}>aman</strong> — lebih {Math.abs(safeGap ?? 0)} poin dari target {target}.</>
                ) : (
                  <>Butuh <strong style={{ color: "var(--blue)" }}>+{safeGap}</strong> poin lagi untuk target aman {target}.
                  {passingGap != null && passingGap > 0 && <> PG kurang {passingGap}.</>}</>
                )}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Benar"
          value={attempt.correctCount ?? 0}
          accent="green"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard
          label="Salah"
          value={attempt.wrongCount ?? 0}
          accent="amber"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
        />
        <StatCard
          label="Kosong"
          value={attempt.emptyCount ?? 0}
          accent="blue"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>}
        />
        <StatCard
          label="Akurasi"
          value={`${accuracy}%`}
          accent="violet"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
        />
      </div>

      {/* ===== SUBTEST BREAKDOWN ===== */}
      {subtestBreakdown.length > 0 && (
        <SectionCard title="Skor per Subtes" padding="md" className="mb-4">
          <div className="flex flex-col gap-3">
            {subtestBreakdown.map((s) => {
              const max = s.questionCount * 5;
              const pct = max > 0 ? Math.min(100, Math.round((s.score / max) * 100)) : 0;
              const color = s.subtest.includes("TWK") ? "var(--blue)" : s.subtest.includes("TIU") ? "var(--violet)" : "var(--green)";
              const safe = s.isPassed === true;

              return (
                <div
                  key={s.subtest}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: "var(--bg-card2)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${color}`,
                  }}
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
                      <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{s.subtest}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color }}>{s.score}</span>
                        <span className="text-xs" style={{ color: "var(--text-dim)" }}>/ {max}</span>
                        {s.passingGrade != null && (
                          <span
                            className="text-[0.68rem] font-semibold px-2 py-0.5 rounded"
                            style={{
                              background: safe ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                              color: safe ? "var(--green)" : "var(--danger)",
                            }}
                          >
                            {safe ? "✓ Pass" : `PG ${s.passingGrade}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div
                        className="h-full rounded-full transition-[width] duration-400 ease-out"
                        style={{ width: `${pct}%`, background: color }}
                      />
                      {s.passingGrade != null && max > 0 && (
                        <div
                          className="absolute top-[-1px] bottom-[-1px] w-0.5"
                          style={{
                            left: `${Math.min(100, Math.round((s.passingGrade / max) * 100))}%`,
                            background: "var(--amber)",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ===== TOPIC WEAKNESS ===== */}
      {weakest.length > 0 && (
        <SectionCard title="Prioritas Belajar Kamu" padding="md" className="mb-4">
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Topik dengan jawaban salah terbanyak. Fokus latihan di sini untuk naikkan skor cepat.
          </p>
          <div className="flex flex-col gap-2.5">
            {weakest.map((t, idx) => (
              <div
                key={`${t.topicId ?? "unk"}-${t.subtest}`}
                className="flex justify-between items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.12)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex items-center justify-center flex-shrink-0 text-[0.68rem] font-bold rounded-lg"
                    style={{
                      width: 26,
                      height: 26,
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      color: "var(--danger)",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {t.subtest}{t.topicName ? ` — ${t.topicName}` : ""}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                      {t.totalQuestions} soal · benar {t.correctCount} · kosong {t.emptyCount}
                    </div>
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "var(--danger)",
                  }}
                >
                  {t.wrongCount} salah
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ===== CTA BAR ===== */}
      <SectionCard padding="md" className="mb-8">
        {/* Contextual recommendation */}
        {weakestSubtest && weakestSubtest.isPassed === false && (
          <AlertBox variant="info" className="mb-4">
            Rekomendasi: fokus latihan <strong>{weakestSubtest.subtest}</strong> dulu — gap terbesar dari passing grade.
          </AlertBox>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3">
          <Link href={ROUTES.review(attempt.id)}>
            <button className="btn-primary w-full py-3 px-5 text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {COPY.cta.reviewWrong}
            </button>
          </Link>
          <Link href={ROUTES.tryoutDetail(pkg.slug)}>
            <button
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              {COPY.cta.retryTryout}
            </button>
          </Link>
          <Link href={ROUTES.tryouts}>
            <button
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              {COPY.cta.viewCatalog}
            </button>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
