"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { COPY } from "@/lib/constants/copy";
import { formatDuration } from "@/lib/packages/format";

interface Props {
  slug: string;
  durationMinutes: number;
  totalQuestions: number;
  ctaLabel: string;
  hasActiveAttempt: boolean;
  startAction: (slug: string) => Promise<void>;
}

export function StartExamButton({
  slug,
  durationMinutes,
  totalQuestions,
  ctaLabel,
  hasActiveAttempt,
  startAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Resume = skip modal (no "are you ready" — they're already mid-exam)
  function handleClick() {
    if (hasActiveAttempt) {
      submit();
    } else {
      setOpen(true);
    }
  }

  function submit() {
    startTransition(async () => {
      await startAction(slug);
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={pending}
        className="btn-primary"
        style={{
          width: "100%",
          padding: "0.9rem 1.25rem",
          fontSize: "0.95rem",
          fontWeight: 600,
          justifyContent: "center",
        }}
      >
        {pending ? "Memproses..." : ctaLabel}
      </button>

      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <Modal
            onClose={() => !pending && setOpen(false)}
            onConfirm={submit}
            pending={pending}
            durationMinutes={durationMinutes}
            totalQuestions={totalQuestions}
          />,
          document.body
        )}
    </>
  );
}

function Modal({
  onClose,
  onConfirm,
  pending,
  durationMinutes,
  totalQuestions,
}: {
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  durationMinutes: number;
  totalQuestions: number;
}) {
  return (
    <div
      onClick={onClose}
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
          padding: "1.75rem",
          background: "var(--bg-card)",
        }}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
          }}
        >
          {COPY.exam.readyModal.title}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.6rem",
            marginBottom: "1.1rem",
          }}
        >
          <Stat label="Durasi" value={formatDuration(durationMinutes)} />
          <Stat label="Jumlah Soal" value={String(totalQuestions)} />
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          <Warn text={COPY.exam.readyModal.warningTimer} />
          <Warn text={COPY.exam.readyModal.warningConnection} />
        </ul>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onClose}
            disabled={pending}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              background: "transparent",
              border: "1px solid var(--border)",
             borderRadius: "0.5rem",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              cursor: pending ? "not-allowed" : "pointer",
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="btn-primary"
            style={{
              flex: 1.4,
              padding: "0.6rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              justifyContent: "center",
            }}
          >
            {pending ? "Memulai..." : COPY.exam.readyModal.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "0.65rem 0.75rem",
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
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function Warn({ text }: { text: string }) {
  return (
    <li
      style={{
        display: "flex",
        gap: "0.5rem",
        fontSize: "0.78rem",
        color: "var(--text-primary)",
      }}
    >
      <span aria-hidden style={{ color: "#FBBF24" }}>
        !
      </span>
      <span>{text}</span>
    </li>
  );
}
