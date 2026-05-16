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

/** Server-confirmed answers (only these count for scoring) */
type SavedMap = Record<
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

  // Local selection (unsaved — resets on navigation if not saved)
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

  // Server-confirmed answers (only these count)
  const [savedAnswers, setSavedAnswers] = useState<SavedMap>(() => {
    const map: SavedMap = {};
    for (const a of initialAnswers) {
      map[a.questionId] = {
        selectedOptionId: a.selectedOptionId,
        isMarkedDoubtful: a.isMarkedDoubtful,
      };
    }
    return map;
  });

  // Track if current question has unsaved changes
  const currentHasUnsaved = (() => {
    if (!questions[currentIndex]) return false;
    const qid = questions[currentIndex].id;
    const local = answers[qid];
    const saved = savedAnswers[qid];
    if (!local && !saved) return false;
    if (!local || !saved) return true;
    return local.selectedOptionId !== saved.selectedOptionId || local.isMarkedDoubtful !== saved.isMarkedDoubtful;
  })();

  const [now, setNow] = useState(() => new Date());
  const endsAtMs = useMemo(() => new Date(attempt.endsAt).getTime(), [attempt.endsAt]);

  // Queue of answer-changes to sync. Avoids blocking UI while network slow.
  const pendingRef = useRef<
    Map<string, { selectedOptionId: string | null; isMarkedDoubtful: boolean; seq: number }>
  >(new Map());
  const seqRef = useRef(0);
  const flushingRef = useRef(false);
  /**
   * Opt #3b — Debounce timer ref.
   * Tiap perubahan ditahan 500 ms; klik beruntun (A→B→C) hanya hasilkan
   * satu network roundtrip dengan payload final. Cancel saat user pindah
   * soal supaya nothing bocor antar halaman.
   */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SAVE_DEBOUNCE_MS = 500;

  /**
   * Opt #5 — Outbox persistence di localStorage.
   * Kunci per attempt id; isi: { qid: { selectedOptionId, isMarkedDoubtful } }.
   * Recover saat mount kalau ada save yang gagal di sesi sebelumnya
   * (mis. user tutup tab di tengah pengerjaan, koneksi flaky).
   */
  const outboxKey = `nalarup:outbox:${attempt.id}`;

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = Math.max(0, endsAtMs - now.getTime());
  const remainingSec = Math.floor(remainingMs / 1000);
  const timerColor =
    remainingSec <= 60
      ? "var(--danger)"
      : remainingSec <= 5 * 60
      ? "var(--danger)"
      : remainingSec <= 15 * 60
      ? "var(--amber)"
      : "var(--text-primary)";
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
      const a = savedAnswers[q.id];
      if (a?.selectedOptionId) answered++;
      if (a?.isMarkedDoubtful) doubtful++;
    }
    const empty = questions.length - answered;
    return { answered, empty, doubtful, total: questions.length };
  }, [savedAnswers, questions]);

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
        // Opt #5 — sukses sync: hapus dari outbox per-question.
        try {
          if (typeof localStorage !== "undefined") {
            const raw = localStorage.getItem(outboxKey);
            if (raw) {
              const obj = JSON.parse(raw);
              delete obj[qid];
              if (Object.keys(obj).length === 0) {
                localStorage.removeItem(outboxKey);
              } else {
                localStorage.setItem(outboxKey, JSON.stringify(obj));
              }
            }
          }
        } catch {
          // ignore
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

    // Opt #5 — persist outbox ke localStorage segera, sebelum network call.
    // Kalau browser/tab crash sekarang, save tetap recoverable saat reload.
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(outboxKey);
        const obj = raw ? JSON.parse(raw) : {};
        obj[qid] = { selectedOptionId, isMarkedDoubtful };
        localStorage.setItem(outboxKey, JSON.stringify(obj));
      }
    } catch {
      // localStorage penuh / disabled — non-fatal.
    }

    setSaveState("saving"); // immediate UI feedback while debounce holds

    // Opt #3b — debounce: batalkan timer pending lalu reschedule.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      // Offline: tetap buffer di pendingRef + outbox, flushPending akan jalan saat online.
      setSaveState("error");
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      void flushPending();
    }, SAVE_DEBOUNCE_MS);
  }

  // Opt #5 — Recover outbox saat mount: replay save yang belum ter-sync.
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      const raw = localStorage.getItem(outboxKey);
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<
        string,
        { selectedOptionId: string | null; isMarkedDoubtful: boolean }
      >;
      let recovered = 0;
      for (const [qid, payload] of Object.entries(obj)) {
        if (!pendingRef.current.has(qid)) {
          pendingRef.current.set(qid, { ...payload, seq: ++seqRef.current });
          recovered++;
        }
      }
      if (recovered > 0) void flushPending();
    } catch {
      // ignore corrupt outbox
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opt #5 — Flush saat tab hidden / pagehide (mobile back, switch app).
  // Pakai keepalive supaya request selesai walau halaman ditutup.
  useEffect(() => {
    function flushOnHide() {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (pendingRef.current.size > 0) void flushPending();
    }
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushOnHide();
    });
    window.addEventListener("pagehide", flushOnHide);
    return () => {
      window.removeEventListener("pagehide", flushOnHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush pending immediately when component unmounts (route change).
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        if (pendingRef.current.size > 0) void flushPending();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function selectOption(optionId: string) {
    if (!current) return;
    const existing = answers[current.id];
    const nextSelected =
      existing?.selectedOptionId === optionId ? null : optionId; // toggle off
    const nextDoubt = existing?.isMarkedDoubtful ?? false;
    // Only update local state — NOT saved to server yet
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { selectedOptionId: nextSelected, isMarkedDoubtful: nextDoubt },
    }));
  }

  function toggleDoubtful() {
    if (!current) return;
    const existing = answers[current.id];
    const next = {
      selectedOptionId: existing?.selectedOptionId ?? null,
      isMarkedDoubtful: !(existing?.isMarkedDoubtful ?? false),
    };
    // Only update local state
    setAnswers((prev) => ({ ...prev, [current.id]: next }));
  }

  /** Explicit save — like CAT BKN "Simpan" button */
  function saveCurrentAnswer() {
    if (!current) return;
    const local = answers[current.id];
    if (!local) return;
    queueSave(current.id, local.selectedOptionId, local.isMarkedDoubtful);
    // Mark as saved locally immediately for responsive UI
    setSavedAnswers((prev) => ({
      ...prev,
      [current.id]: { selectedOptionId: local.selectedOptionId, isMarkedDoubtful: local.isMarkedDoubtful },
    }));
  }

  function goTo(idx: number) {
    // CAT BKN behavior: pindah soal tanpa simpan = jawaban hilang (reset ke saved state)
    if (current) {
      const saved = savedAnswers[current.id];
      setAnswers((prev) => ({
        ...prev,
        [current.id]: saved ?? { selectedOptionId: null, isMarkedDoubtful: false },
      }));
    }

    // Opt #3b — flush pending sebelum pindah soal
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      if (pendingRef.current.size > 0) void flushPending();
    }
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, idx)));
    setDrawerOpen(false);
  }

  function confirmSubmitNow() {
    startSubmitTransition(async () => {
      // Flush outstanding saves first
      await flushPending();
      // Opt #5 — outbox sudah dibersihkan flushPending; pastikan key juga gone.
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(outboxKey);
        }
      } catch {
        // ignore
      }
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
        background: "var(--bg-base)",
      }}
    >
      {/* Top strip */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "0.75rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: remainingSec <= 300 ? "linear-gradient(135deg, rgba(239,68,68,0.04), var(--bg-card))" : "var(--bg-card)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          transition: "background 500ms ease",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.15rem",
          }}>
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "999px",
              background: current?.subtest?.includes("TWK") ? "rgba(37,99,235,0.1)" : current?.subtest?.includes("TIU") ? "rgba(124,58,237,0.1)" : "rgba(34,197,94,0.1)",
              color: current?.subtest?.includes("TWK") ? "var(--blue)" : current?.subtest?.includes("TIU") ? "var(--violet)" : "var(--green)",
              border: `1px solid ${current?.subtest?.includes("TWK") ? "rgba(37,99,235,0.2)" : current?.subtest?.includes("TIU") ? "rgba(124,58,237,0.2)" : "rgba(34,197,94,0.2)"}`,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              {current?.subtest ?? "—"}
            </span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
              Soal {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <div style={{
            color: "var(--text-primary)",
            fontSize: "0.88rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {attempt.packageTitle}
          </div>
        </div>

        {/* Save indicator — compact */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} title={!isOnline ? "Offline — jawaban tersimpan lokal" : saveState === "saving" ? "Menyimpan..." : saveState === "error" ? "Gagal sinkron" : saveState === "saved" ? "Tersimpan" : "Siap"}>
          <StatusDot state={isOnline ? saveState : "error"} />
          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
            {!isOnline ? "Offline" : saveState === "saving" ? "Saving..." : saveState === "error" ? "Error" : saveState === "saved" ? "Saved" : ""}
          </span>
        </div>

        {/* Progress ring mini + Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {/* Mini progress ring */}
          <div style={{ position: "relative", width: 32, height: 32 }} title={`${summary.answered}/${summary.total} terjawab`}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="16" cy="16" r="13" fill="none" strokeWidth="3" stroke="var(--border)" />
              <circle cx="16" cy="16" r="13" fill="none" strokeWidth="3" stroke="var(--green)"
                strokeDasharray={`${2 * Math.PI * 13}`}
                strokeDashoffset={`${2 * Math.PI * 13 * (1 - summary.answered / summary.total)}`}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 700, color: "var(--text-muted)" }}>
              {Math.round((summary.answered / summary.total) * 100)}%
            </span>
          </div>

          {/* Timer with circular ring */}
          <div style={{ position: "relative" }}>
            <div
              aria-live="polite"
              className={timerPulse ? "timer-pulse" : ""}
              style={{
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: timerColor,
                background: "var(--bg-card2)",
                border: `1px solid ${remainingSec <= 60 ? "rgba(239,68,68,0.3)" : remainingSec <= 300 ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
                padding: "0.4rem 0.85rem",
                borderRadius: "0.625rem",
                minWidth: 90,
                textAlign: "center",
                transition: "border-color 300ms ease",
              }}
            >
              {timerText}
            </div>
          </div>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            padding: "0.5rem 0.9rem",
            fontSize: "0.8rem",
            color: "var(--text-primary)",
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            borderRadius: "0.625rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Daftar Soal
        </button>
      </header>

      {/* Summary strip with progress bar */}
      <div style={{ position: "relative" }}>
        {/* Thin progress bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--border)",
        }}>
          <div style={{
            height: "100%",
            width: `${(summary.answered / summary.total) * 100}%`,
            background: "var(--green)",
            borderRadius: "0 2px 2px 0",
            transition: "width 300ms ease",
          }} />
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            padding: "0.6rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            background: "var(--bg-card2)",
            paddingTop: "0.75rem",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(34,197,94,0.3)", border: "1px solid var(--green)" }} />
            Terjawab {summary.answered}/{summary.total}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--bg-card2)", border: "1px solid var(--border)" }} />
            Kosong {summary.empty}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)" }} />
            Ragu {summary.doubtful}
          </span>
        </div>
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
              onSaveAnswer={saveCurrentAnswer}
              hasUnsaved={currentHasUnsaved}
            />
          ) : (
            <div style={{ color: "var(--text-muted)" }}>Memuat soal...</div>
          )}
        </main>

        {/* Sidebar navigator (desktop only) */}
        <aside className="exam-sidebar">
          <Navigator
            questions={questions}
            answers={savedAnswers}
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
          padding: "0.75rem 1.25rem",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
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
            padding: "0.6rem 1.1rem",
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            borderRadius: "0.625rem",
            fontSize: "0.82rem",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentIndex === 0 ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>←</span> Sebelumnya
          <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginLeft: "0.25rem", opacity: 0.7 }}>⌨</span>
        </button>
        <div style={{ flex: 1, textAlign: "center", color: "var(--text-muted)", fontSize: "0.78rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem" }}>
          <span>Soal <strong style={{ color: "var(--text-primary)" }}>{currentIndex + 1}</strong> dari {questions.length}</span>
        </div>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="btn-primary"
            style={{
              padding: "0.6rem 1.1rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              borderRadius: "0.625rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            Selanjutnya <span>→</span>
          </button>
        ) : (
          <button
            onClick={() => setConfirmSubmit(true)}
            style={{
              padding: "0.6rem 1.1rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: "rgba(34,197,94,0.15)",
              color: "var(--green)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "0.625rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            Submit Tryout ✓
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
              background: "var(--bg-card)",
              borderLeft: "1px solid var(--border)",
              padding: "1rem",
              overflowY: "auto",
            }}
          >
            <h3 style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Daftar Soal
            </h3>
            <Legend />
            <Navigator
              questions={questions}
              answers={savedAnswers}
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
                  color: "var(--danger)",
                  border: "1px solid rgba(239,68,68,0.2)",
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
                  color: "var(--green)",
                  border: "1px solid rgba(34,197,94,0.25)",
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
  onSaveAnswer,
  hasUnsaved,
}: {
  q: ExamQuestion;
  answer?: { selectedOptionId: string | null; isMarkedDoubtful: boolean };
  onSelect: (optionId: string) => void;
  onToggleDoubtful: () => void;
  onSaveAnswer: () => void;
  hasUnsaved: boolean;
}) {
  return (
    <article style={{
      padding: "1.75rem",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <span
          style={{
            padding: "0.2rem 0.6rem",
            borderRadius: "0.4rem",
            background: q.subtest?.includes("TWK") ? "rgba(37,99,235,0.1)" : q.subtest?.includes("TIU") ? "rgba(124,58,237,0.1)" : "rgba(34,197,94,0.1)",
            color: q.subtest?.includes("TWK") ? "var(--blue)" : q.subtest?.includes("TIU") ? "var(--violet)" : "var(--green)",
            fontSize: "0.72rem",
            fontWeight: 700,
          }}
        >
          {q.subtest}
        </span>
        <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
          Soal #{q.orderNumber}
        </span>
        <button
          onClick={onToggleDoubtful}
          style={{
            marginLeft: "auto",
            padding: "0.3rem 0.75rem",
            fontSize: "0.72rem",
            background: answer?.isMarkedDoubtful
              ? "rgba(245,158,11,0.12)"
              : "var(--bg-card2)",
            color: answer?.isMarkedDoubtful ? "var(--amber)" : "var(--text-muted)",
            border: answer?.isMarkedDoubtful
              ? "1px solid rgba(245,158,11,0.25)"
              : "1px solid var(--border)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 150ms ease",
          }}
        >
          {answer?.isMarkedDoubtful ? "✓ Ragu" : "Tandai Ragu"}
        </button>
      </div>

      <p
        style={{
          color: "var(--text-primary)",
          fontSize: "1.05rem",
          lineHeight: 1.7,
          marginBottom: "1.75rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {q.questionText}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {q.options.map((o) => {
          const selected = answer?.selectedOptionId === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.875rem",
                padding: "0.9rem 1.1rem",
                background: selected
                  ? "rgba(37,99,235,0.08)"
                  : "var(--bg-card2)",
                border: selected
                  ? "1px solid rgba(37,99,235,0.35)"
                  : "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: selected
                    ? "2px solid var(--blue)"
                    : "1.5px solid var(--border)",
                  background: selected ? "rgba(37,99,235,0.15)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: selected ? "var(--blue)" : "var(--text-muted)",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {o.label}
              </span>
              <span style={{ flex: 1, lineHeight: 1.55, paddingTop: "0.15rem" }}>{o.text}</span>
            </button>
          );
        })}
      </div>

      {/* ===== SIMPAN BUTTON — CAT BKN style ===== */}
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onSaveAnswer}
          disabled={!hasUnsaved}
          style={{
            padding: "0.7rem 1.75rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            background: hasUnsaved ? "rgba(37,99,235,0.12)" : "var(--bg-card2)",
            color: hasUnsaved ? "var(--blue)" : "var(--text-dim)",
            border: hasUnsaved ? "1px solid rgba(37,99,235,0.3)" : "1px solid var(--border)",
            borderRadius: "0.75rem",
            cursor: hasUnsaved ? "pointer" : "not-allowed",
            opacity: hasUnsaved ? 1 : 0.6,
            transition: "all 150ms ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {hasUnsaved ? "Simpan Jawaban" : "Tersimpan"}
        </button>
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
  // Group questions by subtest
  const groups: { subtest: string; items: { q: ExamQuestion; idx: number }[] }[] = [];
  let currentGroup: typeof groups[0] | null = null;
  questions.forEach((q, i) => {
    if (!currentGroup || currentGroup.subtest !== q.subtest) {
      currentGroup = { subtest: q.subtest, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push({ q, idx: i });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {groups.map((group) => {
        const answered = group.items.filter((item) => answers[item.q.id]?.selectedOptionId).length;
        const pct = Math.round((answered / group.items.length) * 100);
        const color = group.subtest.includes("TWK") ? "var(--blue)" : group.subtest.includes("TIU") ? "var(--violet)" : "var(--green)";
        return (
          <div key={group.subtest}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {group.subtest}
              </span>
              <span style={{ fontSize: "0.62rem", color: "var(--text-dim)" }}>
                {answered}/{group.items.length}
              </span>
            </div>
            {/* Mini progress bar */}
            <div style={{ height: 3, borderRadius: 999, background: "var(--border)", marginBottom: "0.5rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 300ms ease" }} />
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "0.3rem",
            }}>
              {group.items.map(({ q, idx: i }) => {
                const a = answers[q.id];
                const isCurrent = i === currentIndex;
                const status: "answered" | "doubt" | "empty" = a?.isMarkedDoubtful
                  ? "doubt"
                  : a?.selectedOptionId
                  ? "answered"
                  : "empty";
                const bg =
                  status === "answered"
                    ? "rgba(34,197,94,0.1)"
                    : status === "doubt"
                    ? "rgba(245,158,11,0.12)"
                    : "var(--bg-card2)";
                const fg =
                  status === "answered"
                    ? "var(--green)"
                    : status === "doubt"
                    ? "var(--amber)"
                    : "var(--text-dim)";
                const border = isCurrent
                  ? "1.5px solid var(--blue)"
                  : "1px solid var(--border)";
                return (
                  <button
                    key={q.id}
                    onClick={() => onGo(i)}
                    style={{
                      padding: "0.4rem 0",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: fg,
                      background: bg,
                      border,
                      borderRadius: "0.4rem",
                      cursor: "pointer",
                      aspectRatio: "1 / 1",
                      boxShadow: isCurrent ? "0 0 0 2px rgba(37,99,235,0.15)" : "none",
                      transition: "all 100ms ease",
                    }}
                    title={`Soal ${q.orderNumber}`}
                  >
                    {q.orderNumber}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem", fontSize: "0.7rem" }}>
      <LegendChip color="var(--green)" bg="rgba(34,197,94,0.1)" label="Dijawab" />
      <LegendChip color="var(--amber)" bg="rgba(245,158,11,0.12)" label="Ragu" />
      <LegendChip color="var(--text-dim)" bg="var(--bg-card2)" label="Kosong" />
    </div>
  );
}

function LegendChip({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-dim)" }}>
      <span style={{ width: 10, height: 10, background: bg, border: `1px solid ${color}`, borderRadius: 2 }} />
      {label}
    </span>
  );
}

function StatusDot({ state }: { state: SaveState }) {
  const color =
    state === "saving"
      ? "var(--amber)"
      : state === "error"
      ? "var(--danger)"
      : state === "saved"
      ? "var(--green)"
      : "var(--text-dim)";
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
      ? { bg: "rgba(34,197,94,0.15)", fg: "var(--green)", border: "rgba(34,197,94,0.25)" }
      : { bg: "rgba(239,68,68,0.1)", fg: "var(--danger)", border: "rgba(239,68,68,0.2)" };
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
          background: "var(--bg-card)",
        }}
      >
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.6rem" }}>
          {title}
        </h2>
        <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
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
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--text-muted)",
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
