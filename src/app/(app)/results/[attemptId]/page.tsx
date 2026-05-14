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
    // Should not normally happen — exam route handles in_progress/expired.
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

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Status hero */}
      <div
        className="glass-card"
        style={{
          padding: "2rem 2rem 1.5rem",
          marginBottom: "1.25rem",
          background: attempt.isPassed
            ? "rgba(16,185,129,0.08)"
            : "rgba(239,68,68,0.06)",
          borderColor: attempt.isPassed
            ? "rgba(16,185,129,0.25)"
            : "rgba(239,68,68,0.2)",
        }}
      >
        <div
          style={{
            color: attempt.isPassed ? "#6EE7B7" : "#FCA5A5",
            fontSize: "0.78rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.5rem",
          }}
        >
          {attempt.isPassed ? "Lulus passing grade" : "Belum lulus"}
        </div>
        <div
          style={{
            fontSize: "2.75rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            marginBottom: "0.25rem",
          }}
        >
          {totalScore}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Skor total — {pkg.title}
        </div>

        <div
          style={{
            marginTop: "1.25rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
            gap: "0.75rem",
          }}
        >
          <Mini label="Benar" value={String(attempt.correctCount ?? 0)} accent="#6EE7B7" />
          <Mini label="Salah" value={String(attempt.wrongCount ?? 0)} accent="#FCA5A5" />
          <Mini label="Kosong" value={String(attempt.emptyCount ?? 0)} accent="#94A3B8" />
          <Mini label="Akurasi" value={`${accuracy}%`} accent="#93C5FD" />
        </div>
      </div>

      {/* Safe score meter */}
      {target != null && (
        <SafeScoreMeter
          totalScore={totalScore}
          target={target}
          gap={safeGap ?? 0}
          passingGap={passingGap}
        />
      )}

      {/* Subtest breakdown */}
      {subtestBreakdown.length > 0 && (
        <section
          className="glass-card"
          style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "0.85rem",
            }}
          >
            Skor per Subtes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {subtestBreakdown.map((s) => (
              <SubtestRow key={s.subtest} s={s} />
            ))}
          </div>
        </section>
      )}

      {/* Topic weakness */}
      {weakest.length > 0 && (
        <section
          className="glass-card"
          style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "0.4rem",
            }}
          >
            Prioritas Belajar Kamu
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "1rem" }}>
            Topik dengan jawaban salah terbanyak. Fokus latihan di sini untuk naikkan skor cepat.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {weakest.map((t) => (
              <li
                key={`${t.topicId ?? "unk"}-${t.subtest}`}
                style={{
                  padding: "0.7rem 0.85rem",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                    {t.subtest}
                    {t.topicName ? ` — ${t.topicName}` : ""}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                    {t.totalQuestions} soal · benar {t.correctCount} · kosong {t.emptyCount}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "0.18rem 0.55rem",
                    borderRadius: "0.35rem",
                    background: "rgba(239,68,68,0.18)",
                    color: "#FCA5A5",
                  }}
                >
                  {t.wrongCount} salah
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
          gap: "0.6rem",
          marginTop: "0.5rem",
        }}
      >
        <Link href={ROUTES.review(attempt.id)}>
          <button className="btn-primary" style={ctaStyle}>
            {COPY.cta.reviewWrong}
          </button>
        </Link>
        <Link href={ROUTES.tryoutDetail(pkg.slug)}>
          <button style={ghostStyle}>{COPY.cta.retryTryout}</button>
        </Link>
        <Link href={ROUTES.tryouts}>
          <button style={ghostStyle}>{COPY.cta.viewCatalog}</button>
        </Link>
      </div>
    </div>
  );
}

const ctaStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem 1rem",
  fontSize: "0.88rem",
  fontWeight: 600,
  justifyContent: "center",
};
const ghostStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem 1rem",
  fontSize: "0.88rem",
  fontWeight: 500,
  background: "var(--bg-card2)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--text-primary)",
  cursor: "pointer",
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function Mini({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: "0.65rem 0.85rem",
        background: "var(--bg-card2)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div style={{ color: accent, fontSize: "1.1rem", fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function SafeScoreMeter({
  totalScore,
  target,
  gap,
  passingGap,
}: {
  totalScore: number;
  target: number;
  gap: number;
  passingGap: number | null;
}) {
  const pct = Math.min(100, Math.max(0, Math.round((totalScore / target) * 100)));
  const safe = gap <= 0;

  return (
    <div className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.65rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
          Skor Aman Meter
        </h2>
        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
          {totalScore} / target {target}
        </span>
      </div>

      <div
        style={{
          height: 10,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: "0.7rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: safe
              ? "linear-gradient(90deg, #10B981, #34D399)"
              : "linear-gradient(90deg, #2563EB, #60A5FA)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", lineHeight: 1.55 }}>
        {safe ? (
          <>
            🎯 Skor kamu sudah <strong>aman</strong>. Lebih {Math.abs(gap)} poin dari target {target}.
          </>
        ) : (
          <>
            Butuh <strong>+{gap}</strong> poin lagi untuk mencapai target aman {target}.
            {passingGap != null && passingGap > 0 && (
              <> Passing grade kurang {passingGap}.</>
            )}
          </>
        )}
      </p>
    </div>
  );
}

function SubtestRow({
  s,
}: {
  s: {
    subtest: "TWK" | "TIU" | "TKP" | "SKB";
    questionCount: number;
    score: number;
    passingGrade: number | null;
    isPassed: boolean | null;
  };
}) {
  // Scale: TWK/TIU = 5pt × jumlah soal; TKP = 5pt × jumlah soal (max).
  const max = s.questionCount * 5;
  const pct = max > 0 ? Math.min(100, Math.round((s.score / max) * 100)) : 0;
  const passingPct =
    s.passingGrade != null && max > 0
      ? Math.min(100, Math.round((s.passingGrade / max) * 100))
      : null;

  const barColor =
    s.isPassed === true
      ? "linear-gradient(90deg, #10B981, #34D399)"
      : s.isPassed === false
      ? "linear-gradient(90deg, #DC2626, #F87171)"
      : "linear-gradient(90deg, #2563EB, #60A5FA)";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.78rem",
          color: "var(--text-primary)",
          marginBottom: "0.35rem",
        }}
      >
        <span style={{ fontWeight: 600 }}>{s.subtest}</span>
        <span>
          <strong style={{ color: "var(--text-primary)" }}>{s.score}</strong>
            <span style={{ color: "var(--text-muted)" }}> / {max}</span>
          {s.passingGrade != null && (
            <span
              style={{
                marginLeft: "0.5rem",
                color: s.isPassed ? "#6EE7B7" : "#FCA5A5",
                fontSize: "0.72rem",
              }}
            >
              {s.isPassed ? "✓ pass" : `pass ${s.passingGrade}`}
            </span>
          )}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 8,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            transition: "width 0.4s ease",
          }}
        />
        {passingPct != null && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -2,
              bottom: -2,
              left: `${passingPct}%`,
              width: 2,
              background: "#FBBF24",
            }}
          />
        )}
      </div>
    </div>
  );
}
