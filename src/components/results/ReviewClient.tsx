"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { ReviewQuestion } from "@/lib/results/queries";
import { ROUTES } from "@/lib/constants/routes";

type Filter = "all" | "wrong" | "correct" | "empty" | "doubt" | "saved";
type Mode = "learn" | "quick";

interface Props {
  attempt: { id: string; packageTitle: string; packageSlug: string };
  questions: ReviewQuestion[];
  onToggleSave: (questionId: string) => Promise<{
    ok: boolean;
    saved?: boolean;
    error?: string;
  }>;
  onReport: (input: {
    questionId: string;
    attemptId: string;
    reason: string;
    description?: string;
  }) => Promise<{ ok: boolean; reportId?: string; error?: string }>;
}

export function ReviewClient({
  attempt,
  questions: initial,
  onToggleSave,
  onReport,
}: Props) {
  const [filter, setFilter] = useState<Filter>(() => {
    const wrong = initial.filter((q) => q.status === "wrong").length;
    return wrong > 0 ? "wrong" : "all";
  });
  const [mode, setMode] = useState<Mode>("learn");
  const [questions, setQuestions] = useState<ReviewQuestion[]>(initial);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c = { wrong: 0, correct: 0, empty: 0, doubt: 0, saved: 0 };
    for (const q of questions) {
      if (q.status === "wrong") c.wrong++;
      else if (q.status === "correct") c.correct++;
      else c.empty++;
      if (q.isMarkedDoubtful) c.doubt++;
      if (q.isSaved) c.saved++;
    }
    return c;
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filter === "all") return true;
      if (filter === "wrong") return q.status === "wrong";
      if (filter === "correct") return q.status === "correct";
      if (filter === "empty") return q.status === "empty";
      if (filter === "doubt") return q.isMarkedDoubtful;
      if (filter === "saved") return q.isSaved;
      return true;
    });
  }, [questions, filter]);

  function setSaved(qid: string, saved: boolean) {
    setQuestions((prev) =>
      prev.map((q) => (q.questionId === qid ? { ...q, isSaved: saved } : q))
    );
  }

  function handleToggleSave(qid: string) {
    const q = questions.find((x) => x.questionId === qid);
    if (!q) return;
    const optimistic = !q.isSaved;
    setSaved(qid, optimistic);
    startTransition(async () => {
      const res = await onToggleSave(qid);
      if (!res.ok) setSaved(qid, !optimistic); // revert
      else if (res.saved !== undefined) setSaved(qid, res.saved);
    });
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href={ROUTES.result(attempt.id)}
          style={{ color: "#60A5FA", fontSize: "0.82rem", textDecoration: "none" }}
        >
          ← Kembali ke Hasil
        </Link>
        <h1
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "#F1F5F9",
            marginTop: "0.35rem",
          }}
        >
          Pembahasan — {attempt.packageTitle}
        </h1>
      </div>

      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginBottom: "0.85rem",
          background: "rgba(255,255,255,0.03)",
          padding: "0.25rem",
          borderRadius: "0.55rem",
          border: "1px solid rgba(255,255,255,0.06)",
          width: "fit-content",
        }}
      >
        <ModeChip label="Mode Belajar" active={mode === "learn"} onClick={() => setMode("learn")} />
        <ModeChip label="Review Cepat" active={mode === "quick"} onClick={() => setMode("quick")} />
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Semua ({questions.length})
        </FilterChip>
        <FilterChip active={filter === "wrong"} onClick={() => setFilter("wrong")} color="#FCA5A5">
          Salah ({counts.wrong})
        </FilterChip>
        <FilterChip active={filter === "correct"} onClick={() => setFilter("correct")} color="#6EE7B7">
          Benar ({counts.correct})
        </FilterChip>
        <FilterChip active={filter === "empty"} onClick={() => setFilter("empty")} color="#94A3B8">
          Kosong ({counts.empty})
        </FilterChip>
        <FilterChip active={filter === "doubt"} onClick={() => setFilter("doubt")} color="#FBBF24">
          Ragu ({counts.doubt})
        </FilterChip>
        <FilterChip active={filter === "saved"} onClick={() => setFilter("saved")} color="#C4B5FD">
          Disimpan ({counts.saved})
        </FilterChip>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
            Tidak ada soal yang cocok filter ini.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((q) => (
            <ReviewCard
              key={q.questionId}
              q={q}
              mode={mode}
              attemptId={attempt.id}
              onToggleSave={handleToggleSave}
              onReport={onReport}
              pendingSave={pending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ModeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.35rem 0.75rem",
        borderRadius: "0.4rem",
        background: active ? "rgba(96,165,250,0.15)" : "transparent",
        color: active ? "#BFDBFE" : "#94A3B8",
        border: active ? "1px solid rgba(96,165,250,0.35)" : "1px solid transparent",
        fontSize: "0.78rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  color = "#CBD5E1",
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: "999px",
        border: active
          ? `1px solid ${color}`
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? `${color}22`
          : "rgba(255,255,255,0.02)",
        color: active ? color : "#94A3B8",
        fontSize: "0.78rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: "correct" | "wrong" | "empty" }) {
  const styles =
    status === "correct"
      ? { bg: "rgba(16,185,129,0.15)", fg: "#6EE7B7", label: "Benar" }
      : status === "wrong"
      ? { bg: "rgba(239,68,68,0.15)", fg: "#FCA5A5", label: "Salah" }
      : { bg: "rgba(255,255,255,0.04)", fg: "#94A3B8", label: "Kosong" };
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.2rem 0.55rem",
        borderRadius: "999px",
        background: styles.bg,
        color: styles.fg,
      }}
    >
      {styles.label}
    </span>
  );
}

function ReviewCard({
  q,
  mode,
  attemptId,
  onToggleSave,
  onReport,
  pendingSave,
}: {
  q: ReviewQuestion;
  mode: Mode;
  attemptId: string;
  onToggleSave: (qid: string) => void;
  onReport: Props["onReport"];
  pendingSave: boolean;
}) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <article className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.85rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "0.15rem 0.5rem",
            borderRadius: "0.3rem",
            background: "rgba(96,165,250,0.1)",
            color: "#93C5FD",
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          {q.subtest}
        </span>
        <span style={{ color: "#64748B", fontSize: "0.72rem" }}>Soal #{q.orderNumber}</span>
        {q.topicName && (
          <span
            style={{
              color: "#A78BFA",
              fontSize: "0.7rem",
              padding: "0.15rem 0.5rem",
              background: "rgba(167,139,250,0.1)",
              borderRadius: "0.3rem",
            }}
          >
            {q.topicName}
          </span>
        )}
        {q.isMarkedDoubtful && (
          <span
            style={{
              color: "#FBBF24",
              fontSize: "0.7rem",
              padding: "0.15rem 0.5rem",
              background: "rgba(245,158,11,0.1)",
              borderRadius: "0.3rem",
            }}
          >
            ⚑ Ragu
          </span>
        )}
        <StatusBadge status={q.status} />

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => onToggleSave(q.questionId)}
            disabled={pendingSave}
            title="Simpan soal"
            style={{
              padding: "0.28rem 0.55rem",
              background: q.isSaved
                ? "rgba(196,181,253,0.15)"
                : "rgba(255,255,255,0.03)",
              color: q.isSaved ? "#C4B5FD" : "#94A3B8",
              border: q.isSaved
                ? "1px solid rgba(196,181,253,0.3)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.35rem",
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            {q.isSaved ? "★ Tersimpan" : "☆ Simpan"}
          </button>
          <button
            onClick={() => setReportOpen(true)}
            title="Laporkan soal"
            style={{
              padding: "0.28rem 0.55rem",
              background: "rgba(255,255,255,0.03)",
              color: "#94A3B8",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.35rem",
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            ⚠ Lapor
          </button>
        </div>
      </header>

      {mode === "learn" && (
        <p
          style={{
            color: "#F1F5F9",
            fontSize: "0.92rem",
            lineHeight: 1.6,
            marginBottom: "1rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {q.questionText}
        </p>
      )}

      {/* Options (Learn mode) or condensed correct option (Quick mode) */}
      {mode === "learn" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {q.options.map((o) => {
            const isUser = o.id === q.userSelectedOptionId;
            const isCorrect = o.isCorrect;
            let bg = "rgba(255,255,255,0.03)";
            let border = "1px solid rgba(255,255,255,0.06)";
            let label = "";
            if (isCorrect && isUser) {
              bg = "rgba(16,185,129,0.15)";
              border = "1px solid rgba(16,185,129,0.35)";
              label = "Jawabanmu — Benar";
            } else if (isCorrect) {
              bg = "rgba(16,185,129,0.08)";
              border = "1px solid rgba(16,185,129,0.25)";
              label =
                q.scoringType === "weighted_options"
                  ? "Skor maks"
                  : "Jawaban benar";
            } else if (isUser) {
              bg = "rgba(239,68,68,0.08)";
              border = "1px solid rgba(239,68,68,0.25)";
              label = "Jawabanmu";
            }

            return (
              <div
                key={o.id}
                style={{
                  padding: "0.55rem 0.85rem",
                  background: bg,
                  border,
                  borderRadius: "0.5rem",
                  display: "flex",
                  gap: "0.65rem",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#CBD5E1",
                  }}
                >
                  {o.label}
                </span>
                <span style={{ flex: 1, color: "#CBD5E1", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  {o.text}
                </span>
                {q.scoringType === "weighted_options" && (
                  <span
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.7rem",
                      background: "rgba(255,255,255,0.04)",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "0.3rem",
                      alignSelf: "center",
                    }}
                  >
                    {o.scoreValue} pt
                  </span>
                )}
                {label && (
                  <span
                    style={{
                      color: isCorrect ? "#6EE7B7" : "#FCA5A5",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      alignSelf: "center",
                    }}
                  >
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <QuickModeBody q={q} />
      )}

      {/* Explanation */}
      {(q.explanation || q.explanationShort) && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.9rem 1rem",
            background: "rgba(96,165,250,0.05)",
            border: "1px solid rgba(96,165,250,0.15)",
            borderRadius: "0.5rem",
          }}
        >
          <div
            style={{
              color: "#93C5FD",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.4rem",
            }}
          >
            Pembahasan
          </div>
          <p style={{ color: "#CBD5E1", fontSize: "0.82rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {mode === "quick" && q.explanationShort
              ? q.explanationShort
              : q.explanation ?? q.explanationShort}
          </p>
        </div>
      )}

      {reportOpen && (
        <ReportDialog
          onClose={() => setReportOpen(false)}
          onSubmit={async (payload) => {
            const res = await onReport({
              questionId: q.questionId,
              attemptId,
              reason: payload.reason,
              description: payload.description,
            });
            return res;
          }}
        />
      )}
    </article>
  );
}

function QuickModeBody({ q }: { q: ReviewQuestion }) {
  const correct = q.options.find((o) => o.isCorrect);
  const user = q.options.find((o) => o.id === q.userSelectedOptionId);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          padding: "0.55rem 0.75rem",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "0.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#FCA5A5",
            fontWeight: 600,
            marginBottom: "0.3rem",
          }}
        >
          Jawabanmu
        </div>
        <div style={{ fontSize: "0.82rem", color: "#F1F5F9" }}>
          {user ? `${user.label}. ${user.text}` : "(Kosong)"}
        </div>
      </div>
      <div
        style={{
          padding: "0.55rem 0.75rem",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: "0.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#6EE7B7",
            fontWeight: 600,
            marginBottom: "0.3rem",
          }}
        >
          {q.scoringType === "weighted_options" ? "Skor maks" : "Jawaban benar"}
        </div>
        <div style={{ fontSize: "0.82rem", color: "#F1F5F9" }}>
          {correct ? `${correct.label}. ${correct.text}` : "-"}
        </div>
      </div>
    </div>
  );
}

const REPORT_REASONS = [
  "Soal tidak jelas",
  "Jawaban salah",
  "Pembahasan kurang tepat",
  "Typo atau format",
  "Lainnya",
];

function ReportDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: { reason: string; description?: string }) => Promise<{
    ok: boolean;
    reportId?: string;
    error?: string;
  }>;
}) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    start(async () => {
      setErr(null);
      const res = await onSubmit({ reason, description });
      if (res.ok) {
        setDone(true);
        setTimeout(onClose, 1400);
      } else {
        setErr(res.error ?? "unknown");
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,15,30,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          maxWidth: 440,
          width: "100%",
          padding: "1.5rem",
          background: "rgba(17,24,39,0.95)",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#F1F5F9",
            marginBottom: "0.75rem",
          }}
        >
          Laporkan Soal
        </h2>

        {done ? (
          <div
            style={{
              padding: "1rem",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "0.5rem",
              color: "#6EE7B7",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            Laporan terkirim. Terima kasih.
          </div>
        ) : (
          <>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#94A3B8",
                marginBottom: "0.35rem",
              }}
            >
              Alasan
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F1F5F9",
                borderRadius: "0.45rem",
                marginBottom: "0.9rem",
                fontSize: "0.85rem",
              }}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r} style={{ background: "#0A0F1E" }}>
                  {r}
                </option>
              ))}
            </select>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#94A3B8",
                marginBottom: "0.35rem",
              }}
            >
              Deskripsi (opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Jelaskan secara singkat…"
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F1F5F9",
                borderRadius: "0.45rem",
                resize: "vertical",
                fontSize: "0.85rem",
                marginBottom: "0.9rem",
              }}
            />
            {err && (
              <div style={{ color: "#FCA5A5", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                Gagal mengirim: {err}
              </div>
            )}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={onClose}
                disabled={pending}
                style={{
                  flex: 1,
                  padding: "0.6rem 1rem",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  color: "#94A3B8",
                  fontSize: "0.85rem",
                  cursor: pending ? "not-allowed" : "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={submit}
                disabled={pending}
                className="btn-primary"
                style={{
                  flex: 1.3,
                  padding: "0.6rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  justifyContent: "center",
                }}
              >
                {pending ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
