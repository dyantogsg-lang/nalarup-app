import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { getAttemptResult } from "@/lib/results/queries";
import { ROUTES } from "@/lib/constants/routes";
import { COPY } from "@/lib/constants/copy";

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

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 1rem" }}>

      {/* ===== STATUS HERO — celebratory ===== */}
      <div style={{
        padding: "2.5rem 2.25rem 2rem",
        marginBottom: "1.25rem",
        background: attempt.isPassed
          ? "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))"
          : "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))",
        border: `1px solid ${attempt.isPassed ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
        borderRadius: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          background: attempt.isPassed
            ? "radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%)"
            : "radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />
        {attempt.isPassed && (
          <div style={{
            position: "absolute",
            top: 20,
            left: 30,
            width: 80,
            height: 80,
            background: "radial-gradient(circle, rgba(34,197,94,0.06), transparent 70%)",
            pointerEvents: "none",
          }} />
        )}

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "1.75rem", flexWrap: "wrap" }}>
          {/* Icon */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "1.25rem",
            background: attempt.isPassed
              ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))"
              : "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))",
            border: `1px solid ${attempt.isPassed ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: attempt.isPassed ? "var(--green)" : "var(--danger)",
            flexShrink: 0,
          }}>
            {attempt.isPassed ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/><circle cx="12" cy="12" r="10"/></svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              color: attempt.isPassed ? "var(--green)" : "var(--danger)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.4rem",
            }}>
              {attempt.isPassed ? "🎉 Lulus Passing Grade" : "Belum Lulus"}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span className="num" style={{
                fontSize: "3rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}>
                {totalScore}
              </span>
              {passing != null && (
                <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>/ PG {passing}</span>
              )}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.3rem" }}>
              {pkg.title}
            </div>
          </div>
        </div>

        {/* ===== MINI STAT CARDS with icons ===== */}
        <div style={{
          marginTop: "1.75rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.875rem",
          position: "relative",
          zIndex: 1,
        }}>
          {[
            { label: "Benar", value: String(attempt.correctCount ?? 0), accent: "var(--green)", bg: "rgba(34,197,94,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
            { label: "Salah", value: String(attempt.wrongCount ?? 0), accent: "var(--danger)", bg: "rgba(239,68,68,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
            { label: "Kosong", value: String(attempt.emptyCount ?? 0), accent: "var(--text-dim)", bg: "rgba(148,163,184,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg> },
            { label: "Akurasi", value: `${accuracy}%`, accent: "var(--blue)", bg: "rgba(37,99,235,0.06)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
          ].map((s) => (
            <div key={s.label} style={{
              padding: "1rem 1.1rem",
              background: s.bg,
              border: "1px solid var(--border)",
              borderRadius: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "0.5rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.accent,
                flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</div>
                <div className="num" style={{ fontSize: "1.2rem", fontWeight: 800, color: s.accent, letterSpacing: "-0.02em" }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SAFE SCORE METER — circular ring ===== */}
      {target != null && (
        <div style={{
          padding: "2rem",
          marginBottom: "1.25rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}>
          {/* Ring */}
          <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
            {(() => {
              const RADIUS = 48;
              const CIRC = 2 * Math.PI * RADIUS;
              const pct = Math.min(100, Math.round((totalScore / target) * 100));
              const offset = CIRC - (pct / 100) * CIRC;
              const safe = (safeGap ?? 0) <= 0;
              const ringColor = safe ? "var(--green)" : pct >= 80 ? "var(--amber)" : "var(--blue)";
              return (
                <>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" stroke="var(--border)" />
                    <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" stroke={ringColor}
                      strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span className="num" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{pct}%</span>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginTop: "0.2rem" }}>dari target</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Skor Aman Meter
            </h2>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
              {(safeGap ?? 0) <= 0 ? (
                <>🎯 Skor kamu sudah <strong style={{ color: "var(--green)" }}>aman</strong>. Lebih {Math.abs(safeGap ?? 0)} poin dari target {target}.</>
              ) : (
                <>Butuh <strong style={{ color: "var(--blue)" }}>+{safeGap}</strong> poin lagi untuk target aman {target}.
                {passingGap != null && passingGap > 0 && <> PG kurang {passingGap}.</>}</>
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>
              <span>Skor: <strong style={{ color: "var(--text-primary)" }}>{totalScore}</strong></span>
              <span>Target: <strong style={{ color: "var(--text-primary)" }}>{target}</strong></span>
              {passing != null && <span>PG: <strong style={{ color: "var(--text-primary)" }}>{passing}</strong></span>}
            </div>
          </div>
        </div>
      )}

      {/* ===== SUBTEST BREAKDOWN — cards with color + mini ring ===== */}
      {subtestBreakdown.length > 0 && (
        <section style={{
          padding: "1.75rem",
          marginBottom: "1.25rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
            Skor per Subtes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {subtestBreakdown.map((s) => {
              const max = s.questionCount * 5;
              const pct = max > 0 ? Math.min(100, Math.round((s.score / max) * 100)) : 0;
              const color = s.subtest.includes("TWK") ? "var(--blue)" : s.subtest.includes("TIU") ? "var(--violet)" : "var(--green)";
              const safe = s.isPassed === true;
              const RADIUS = 18;
              const CIRC = 2 * Math.PI * RADIUS;
              const offset = CIRC - (pct / 100) * CIRC;

              return (
                <div key={s.subtest} style={{
                  padding: "1.25rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${color}`,
                  borderRadius: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                }}>
                  {/* Mini ring */}
                  <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="22" cy="22" r={RADIUS} fill="none" strokeWidth="4" stroke="var(--border)" />
                      <circle cx="22" cy="22" r={RADIUS} fill="none" strokeWidth="4" stroke={color}
                        strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      {pct}%
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>{s.subtest}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="num" style={{ fontSize: "0.88rem", fontWeight: 700, color }}>{s.score}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>/ {max}</span>
                        {s.passingGrade != null && (
                          <span style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "0.3rem",
                            background: safe ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                            color: safe ? "var(--green)" : "var(--danger)",
                          }}>
                            {safe ? "✓ Pass" : `PG ${s.passingGrade}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ position: "relative", height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 400ms ease" }} />
                      {s.passingGrade != null && max > 0 && (
                        <div style={{
                          position: "absolute",
                          top: -1,
                          bottom: -1,
                          left: `${Math.min(100, Math.round((s.passingGrade / max) * 100))}%`,
                          width: 2,
                          background: "var(--amber)",
                        }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== TOPIC WEAKNESS ===== */}
      {weakest.length > 0 && (
        <section style={{
          padding: "1.75rem",
          marginBottom: "1.25rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
            Prioritas Belajar Kamu
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Topik dengan jawaban salah terbanyak. Fokus latihan di sini untuk naikkan skor cepat.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {weakest.map((t, idx) => (
              <div
                key={`${t.topicId ?? "unk"}-${t.subtest}`}
                style={{
                  padding: "0.875rem 1.1rem",
                  background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.12)",
                  borderRadius: "0.875rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <span style={{
                    width: 26,
                    height: 26,
                    borderRadius: "0.5rem",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--danger)",
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                      {t.subtest}{t.topicName ? ` — ${t.topicName}` : ""}
                    </div>
                    <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                      {t.totalQuestions} soal · benar {t.correctCount} · kosong {t.emptyCount}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "0.4rem",
                  background: "rgba(239,68,68,0.1)",
                  color: "var(--danger)",
                  flexShrink: 0,
                }}>
                  {t.wrongCount} salah
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA BAR — prominent + contextual ===== */}
      <div style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.03))",
        border: "1px solid rgba(37,99,235,0.12)",
        borderRadius: "1.25rem",
        marginBottom: "2rem",
      }}>
        {/* Contextual recommendation */}
        {weakestSubtest && weakestSubtest.isPassed === false && (
          <div style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            marginBottom: "1.25rem",
            lineHeight: 1.6,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Rekomendasi: fokus latihan <strong style={{ color: "var(--text-primary)" }}>{weakestSubtest.subtest}</strong> dulu — gap terbesar dari passing grade.</span>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "0.75rem",
        }} className="result-cta-grid">
          <Link href={ROUTES.review(attempt.id)}>
            <button className="btn-primary" style={{
              width: "100%",
              padding: "0.85rem 1.25rem",
              fontSize: "0.9rem",
              fontWeight: 700,
              borderRadius: "0.75rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {COPY.cta.reviewWrong}
            </button>
          </Link>
          <Link href={ROUTES.tryoutDetail(pkg.slug)}>
            <button style={{
              width: "100%",
              padding: "0.85rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}>
              {COPY.cta.retryTryout}
            </button>
          </Link>
          <Link href={ROUTES.tryouts}>
            <button style={{
              width: "100%",
              padding: "0.85rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}>
              {COPY.cta.viewCatalog}
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .result-cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
