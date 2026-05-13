"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ExamAnswer, ExamAttempt, ExamQuestion } from "@/lib/exam/queries";

interface Props {
  attempt: ExamAttempt;
  questions: ExamQuestion[];
  initialAnswers: ExamAnswer[];
  onSave: (input: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string | null;
    isMarkedDoubtful: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  onSubmit: (attemptId: string, reason: "user" | "timeout") => Promise<void>;
  onCancel: (attemptId: string) => Promise<void>;
}

type AnswerMap = Record<
  string,
  { selectedOptionId: string | null; isMarkedDoubtful: boolean }
>;

type SaveState = "idle" | "saving" | "saved" | "error";

export function ExamRoom({
  attempt,
  questions,
  initialAnswers,
  onSave,
  onSubmit,
  onCancel,
}: Props) {
  // ─── State ────────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const map: AnswerMap = {};
    for (const a of initialAnswers) {
      map[a.questionId] = {
        selectedOptionId: a.selectedOptionId,
        isMarkedDoubtful: a.isMarkedDoubtful,
      };
    }
    return map;
  });

  const [now, setNow] = useState(() => new Date());
  const endsAtMs = useMemo(() => new Date(attempt.endsAt).getTime(), [attempt.endsAt]);

  // Queue of answer-changes to sync. Avoids blocking UI while network slow.
  const pendingRef = useRef<
    Map<string, { selectedOptionId: string | null; isMarkedDoubtful: boolean; seq: number }>
  >(new Map());
  const seqRef = useRef(0);
  const flushingRef = useRef(false);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = Math.max(0, endsAtMs - now.getTime());
  const remainingSec = Math.floor(remainingMs / 1000);
  const timerColor =
    remainingSec <= 60
      ? "#FCA5A5"
      : remainingSec <= 5 * 60
      ? "#FCA5A5"
      : remainingSec <= 15 * 60
      ? "#FCD34D"
      : "#F1F5F9";
  const timerPulse = remainingSec <= 60;
  const hh = Math.floor(remainingSec / 3600);
  const mm = Math.floor((remainingSec % 3600) / 60);
  const ss = remainingSec % 60;
  const timerText =
    hh > 0
      ? `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
      : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  // Auto-submit on time up
  useEffect(() => {
    if (remainingMs > 0) return;
    if (isSubmitting) return;
    startSubmitTransition(async () => {
      await onSubmit(attempt.id, "timeout");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  // Online/offline. We keep `navigator.onLine` out of the effect body —
  // reading it initially via a lazy state initializer avoids the
  // "setState in effect" rule. flushPending is accessed via ref so the
  // effect doesn't need to re-run when it changes.
  const flushRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      flushRef.current();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const current = questions[currentIndex];
  const summary = useMemo(() => {
    let answered = 0;
    let doubtful = 0;
    for (const q of questions) {
      const a = answers[q.id];
      if (a?.selectedOptionId) answered++;
      if (a?.isMarkedDoubtful) doubtful++;
    }
    const empty = questions.length - answered;
    return { answered, empty, doubtful, total: questions.length };
  }, [answers, questions]);

  // ─── Autosave ─────────────────────────────────────────────────────────────
  // React 19 + React Compiler handle memoization — plain functions are fine.
  async function flushPending() {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      while (pendingRef.current.size > 0) {
        const [qid, payload] = pendingRef.current.entries().next().value!;
        pendingRef.current.delete(qid);
        setSaveState("saving");
        const res = await onSave({
          attemptId: attempt.id,
          questionId: qid,
          selectedOptionId: payload.selectedOptionId,
          isMarkedDoubtful: payload.isMarkedDoubtful,
        });
        if (!res.ok) {
          setSaveState("error");
          if (!pendingRef.current.has(qid)) {
            pendingRef.current.set(qid, payload);
          }
          break;
        }
      }
      if (pendingRef.current.size === 0) setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      flushingRef.current = false;
    }
  }
  useLayoutEffect(() => {
    flushRef.current = () => void flushPending();
  });

  function queueSave(
    qid: string,
    selectedOptionId: string | null,
    isMarkedDoubtful: boolean
  ) {
    seqRef.current++;
    pendingRef.current.set(qid, {
      selectedOptionId,
      isMarkedDoubtful,
      seq: seqRef.current,
    });
    if (typeof navigator === "undefined" || navigator.onLine) {
      void flushPending();
    } else {
      setSaveState("error");
    }
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function selectOption(optionId: string) {
    if (!current) return;
    const existing = answers[current.id];
    const nextSelected =
      existing?.selectedOptionId === optionId ? null : optionId; // toggle off
    const nextDoubt = existing?.isMarkedDoubtful ?? false;
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { selectedOptionId: nextSelected, isMarkedDoubtful: nextDoubt },
    }));
    queueSave(current.id, nextSelected, nextDoubt);
  }

  function toggleDoubtful() {
    if (!current) return;
    const existing = answers[current.id];
    const next = {
      selectedOptionId: existing?.selectedOptionId ?? null,
      isMarkedDoubtful: !(existing?.isMarkedDoubtful ?? false),
    };
    setAnswers((prev) => ({ ...prev, [current.id]: next }));
    queueSave(current.id, next.selectedOptionId, next.isMarkedDoubtful);
  }

  function goTo(idx: number) {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, idx)));
    setDrawerOpen(false);
  }

  function confirmSubmitNow() {
    startSubmitTransition(async () => {
      // Flush outstanding saves first
      await flushPending();
      await onSubmit(attempt.id, "user");
    });
  }

  function confirmCancelNow() {
    startCancelTransition(async () => {
      await onCancel(attempt.id);
    });
  }

  const answerForCurrent = current ? answers[current.id] : undefined;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0A0F1E",
      }}
    >
      {/* Top strip */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.75rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,15,30,0.85)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Ujian
          </div>
          <div
            style={{
              color: "#F1F5F9",
              fontSize: "0.9rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {attempt.packageTitle}
          </div>
        </div>

        {/* Save indicator */}
        <div style={{ fontSize: "0.75rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <StatusDot state={isOnline ? saveState : "error"} />
          <span>
            {!isOnline
              ? "Offline — jawaban tersimpan lokal"
              : saveState === "saving"
              ? "Menyimpan..."
              : saveState === "error"
              ? "Gagal sinkron"
              : saveState === "saved"
              ? "Tersimpan"
              : "Siap"}
          </span>
        </div>

        {/* Timer */}
        <div
          aria-live="polite"
          className={timerPulse ? "timer-pulse" : ""}
          style={{
            fontVariantNumeric: "tabular-nums",
            fontWeight: 700,
            fontSize: "1.15rem",
            color: timerColor,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "0.4rem 0.8rem",
            borderRadius: "0.5rem",
            minWidth: 90,
            textAlign: "center",
          }}
        >
          {timerText}
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            padding: "0.45rem 0.85rem",
            fontSize: "0.8rem",
            color: "#CBD5E1",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Daftar Soal
        </button>
      </header>

      {/* Summary strip */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          padding: "0.55rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          fontSize: "0.72rem",
          color: "#94A3B8",
          background: "rgba(17,24,39,0.4)",
        }}
      >
        <span>Terjawab {summary.answered}/{summary.total}</span>
        <span>Kosong {summary.empty}</span>
        <span>Ragu {summary.doubtful}</span>
      </div>

      {/* Main grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 240px",
          gap: "1.25rem",
          padding: "1.25rem 1.25rem 6rem",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
        className="exam-grid"
      >
        {/* Question area */}
        <main>
          {current ? (
            <QuestionCard
              q={current}
              answer={answerForCurrent}
              onSelect={selectOption}
              onToggleDoubtful={toggleDoubtful}
            />
          ) : (
            <div style={{ color: "#94A3B8" }}>Memuat soal...</div>
          )}
        </main>

        {/* Sidebar navigator (desktop only) */}
        <aside className="exam-sidebar">
          <Navigator
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onGo={goTo}
          />
        </aside>
      </div>

      {/* Bottom nav */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0.75rem 1rem",
          background: "rgba(10,15,30,0.92)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          backdropFilter: "blur(8px)",
          zIndex: 20,
        }}
      >
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            padding: "0.55rem 1rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#CBD5E1",
            borderRadius: "0.5rem",
            fontSize: "0.82rem",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          ← Sebelumnya
        </button>
        <div style={{ flex: 1, textAlign: "center", color: "#64748B", fontSize: "0.8rem" }}>
          Soal {currentIndex + 1} dari {questions.length}
        </div>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="btn-primary"
            style={{
              padding: "0.55rem 1rem",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            Selanjutnya →
          </button>
        ) : (
          <button
            onClick={() => setConfirmSubmit(true)}
            style={{
              padding: "0.55rem 1rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: "rgba(16,185,129,0.2)",
              color: "#6EE7B7",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Submit Tryout
          </button>
        )}
      </footer>

      {/* Drawer (mobile/full) */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,15,30,0.7)",
            zIndex: 50,
            backdropFilter: "blur(4px)",
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(360px, 94vw)",
              background: "#0F1629",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              padding: "1rem",
              overflowY: "auto",
            }}
          >
            <h3 style={{ color: "#F1F5F9", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Daftar Soal
            </h3>
            <Legend />
            <Navigator
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onGo={goTo}
              columns={6}
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                onClick={() => setConfirmCancel(true)}
                style={{
                  flex: 1,
                  padding: "0.55rem 0.8rem",
                  background: "rgba(239,68,68,0.1)",
                  color: "#FCA5A5",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Batalkan
              </button>
              <button
                onClick={() => setConfirmSubmit(true)}
                style={{
                  flex: 2,
                  padding: "0.55rem 0.8rem",
                  background: "rgba(16,185,129,0.2)",
                  color: "#6EE7B7",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "0.5rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Submit Tryout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Submit confirm */}
      {confirmSubmit && (
        <ConfirmDialog
          title="Submit tryout sekarang?"
          body={
            <>
              Kamu punya <strong>{summary.empty}</strong> soal kosong dan{" "}
              <strong>{summary.doubtful}</strong> soal ragu. Setelah submit, jawaban tidak bisa diubah.
            </>
          }
          confirmLabel={isSubmitting ? "Mengirim..." : "Ya, Submit"}
          onConfirm={confirmSubmitNow}
          onCancel={() => !isSubmitting && setConfirmSubmit(false)}
          disabled={isSubmitting}
          tone="success"
        />
      )}

      {/* Cancel confirm */}
      {confirmCancel && (
        <ConfirmDialog
          title="Batalkan tryout?"
          body="Tryout akan ditandai dibatalkan dan tidak masuk riwayat skor. Kamu bisa memulai tryout baru kapan saja."
          confirmLabel={isCancelling ? "Membatalkan..." : "Ya, Batalkan"}
          onConfirm={confirmCancelNow}
          onCancel={() => !isCancelling && setConfirmCancel(false)}
          disabled={isCancelling}
          tone="danger"
        />
      )}

      <style>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .timer-pulse { animation: timerPulse 1s ease-in-out infinite; }
        @media (max-width: 860px) {
          .exam-grid { grid-template-columns: 1fr !important; }
          .exam-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function QuestionCard({
  q,
  answer,
  onSelect,
  onToggleDoubtful,
}: {
  q: ExamQuestion;
  answer?: { selectedOptionId: string | null; isMarkedDoubtful: boolean };
  onSelect: (optionId: string) => void;
  onToggleDoubtful: () => void;
}) {
  return (
    <article className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
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
        <span style={{ color: "#64748B", fontSize: "0.75rem" }}>
          Soal #{q.orderNumber}
        </span>
        <button
          onClick={onToggleDoubtful}
          style={{
            marginLeft: "auto",
            padding: "0.2rem 0.6rem",
            fontSize: "0.72rem",
            background: answer?.isMarkedDoubtful
              ? "rgba(245,158,11,0.15)"
              : "rgba(255,255,255,0.03)",
            color: answer?.isMarkedDoubtful ? "#FBBF24" : "#94A3B8",
            border: answer?.isMarkedDoubtful
              ? "1px solid rgba(245,158,11,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.35rem",
            cursor: "pointer",
          }}
        >
          {answer?.isMarkedDoubtful ? "✓ Ditandai Ragu" : "Tandai Ragu"}
        </button>
      </div>

      <p
        style={{
          color: "#F1F5F9",
          fontSize: "1rem",
          lineHeight: 1.65,
          marginBottom: "1.5rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {q.questionText}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {q.options.map((o) => {
          const selected = answer?.selectedOptionId === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: selected
                  ? "rgba(96,165,250,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: selected
                  ? "1px solid rgba(96,165,250,0.45)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.55rem",
                color: "#F1F5F9",
                fontSize: "0.88rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              <span
                style={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: selected
                    ? "2px solid #60A5FA"
                    : "1px solid rgba(255,255,255,0.2)",
                  background: selected ? "rgba(96,165,250,0.25)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: selected ? "#BFDBFE" : "#94A3B8",
                }}
              >
                {o.label}
              </span>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{o.text}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

function Navigator({
  questions,
  answers,
  currentIndex,
  onGo,
  columns = 5,
}: {
  questions: ExamQuestion[];
  answers: AnswerMap;
  currentIndex: number;
  onGo: (i: number) => void;
  columns?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "0.3rem",
      }}
    >
      {questions.map((q, i) => {
        const a = answers[q.id];
        const isCurrent = i === currentIndex;
        const status: "answered" | "doubt" | "empty" = a?.isMarkedDoubtful
          ? "doubt"
          : a?.selectedOptionId
          ? "answered"
          : "empty";
        const bg =
          status === "answered"
            ? "rgba(16,185,129,0.12)"
            : status === "doubt"
            ? "rgba(245,158,11,0.15)"
            : "rgba(255,255,255,0.03)";
        const fg =
          status === "answered"
            ? "#6EE7B7"
            : status === "doubt"
            ? "#FBBF24"
            : "#94A3B8";
        const border = isCurrent
          ? "1px solid #60A5FA"
          : "1px solid rgba(255,255,255,0.06)";
        return (
          <button
            key={q.id}
            onClick={() => onGo(i)}
            style={{
              padding: "0.4rem 0",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: fg,
              background: bg,
              border,
              borderRadius: "0.35rem",
              cursor: "pointer",
              aspectRatio: "1 / 1",
            }}
            title={`Soal ${q.orderNumber}`}
          >
            {q.orderNumber}
          </button>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem", fontSize: "0.7rem" }}>
      <LegendChip color="#6EE7B7" bg="rgba(16,185,129,0.12)" label="Dijawab" />
      <LegendChip color="#FBBF24" bg="rgba(245,158,11,0.15)" label="Ragu" />
      <LegendChip color="#94A3B8" bg="rgba(255,255,255,0.03)" label="Kosong" />
    </div>
  );
}

function LegendChip({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#94A3B8" }}>
      <span style={{ width: 10, height: 10, background: bg, border: `1px solid ${color}`, borderRadius: 2 }} />
      {label}
    </span>
  );
}

function StatusDot({ state }: { state: SaveState }) {
  const color =
    state === "saving"
      ? "#FBBF24"
      : state === "error"
      ? "#FCA5A5"
      : state === "saved"
      ? "#6EE7B7"
      : "#64748B";
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 0 3px ${color}22`,
      }}
    />
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  disabled,
  tone,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
  tone: "success" | "danger";
}) {
  const toneColors =
    tone === "success"
      ? { bg: "rgba(16,185,129,0.2)", fg: "#6EE7B7", border: "rgba(16,185,129,0.3)" }
      : { bg: "rgba(239,68,68,0.15)", fg: "#FCA5A5", border: "rgba(239,68,68,0.3)" };
  return (
    <div
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,15,30,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          maxWidth: 420,
          width: "100%",
          padding: "1.5rem",
          background: "rgba(17,24,39,0.95)",
        }}
      >
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "0.6rem" }}>
          {title}
        </h2>
        <p style={{ color: "#CBD5E1", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
          {body}
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onCancel}
            disabled={disabled}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.5rem",
              color: "#94A3B8",
              fontSize: "0.85rem",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            style={{
              flex: 1.4,
              padding: "0.6rem 1rem",
              background: toneColors.bg,
              color: toneColors.fg,
              border: `1px solid ${toneColors.border}`,
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
