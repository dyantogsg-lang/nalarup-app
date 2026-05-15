"use client";

import { useEffect, useState } from "react";
import { MOTIVATIONS, accentColor, type Motivation } from "@/lib/constants/motivation";

/**
 * Rotating motivational card — auto-cycle dengan fade transition.
 * Replacement untuk testimoni di auth left-panel.
 */
export default function RotatingMotivation({
  intervalMs = 6000,
  className = "",
}: {
  intervalMs?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => {
      setFade(false);
      const out = setTimeout(() => {
        setIdx((i) => (i + 1) % MOTIVATIONS.length);
        setFade(true);
      }, 280);
      return () => clearTimeout(out);
    }, intervalMs);
    return () => clearInterval(tick);
  }, [intervalMs]);

  const m: Motivation = MOTIVATIONS[idx];
  const c = accentColor(m.accent);

  return (
    <div
      className={className}
      aria-live="polite"
      style={{
        position: "relative",
        background: "var(--bg-card2)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${c.text}`,
        borderRadius: "0.875rem",
        padding: "1.25rem 1.25rem 1.1rem",
        overflow: "hidden",
      }}
    >
      {/* Soft accent glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 80% at 0% 0%, ${c.bg}, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Quote icon */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "0.85rem",
          right: "1rem",
          color: c.text,
          opacity: 0.35,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.17 5C4.32 5 2 7.32 2 10.17c0 2.25 1.45 4.16 3.46 4.85l-.96 3.98 4.5-4.83c1.94-.74 3.32-2.6 3.32-4.83C12.32 6.32 10 5 7.17 5zm9.66 0C13.99 5 11.66 7.32 11.66 10.17c0 2.25 1.45 4.16 3.46 4.85l-.96 3.98 4.5-4.83c1.94-.74 3.32-2.6 3.32-4.83C21.98 6.32 19.66 5 16.83 5z" />
        </svg>
      </div>

      <div
        style={{
          position: "relative",
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        <p
          style={{
            color: "var(--text-primary)",
            fontSize: "0.92rem",
            lineHeight: 1.6,
            marginBottom: m.hint ? "0.65rem" : "0.75rem",
            fontWeight: 500,
            letterSpacing: "-0.005em",
            paddingRight: "1.6rem",
          }}
        >
          {m.text}
        </p>
        {m.hint && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              lineHeight: 1.6,
              marginBottom: "0.85rem",
            }}
          >
            {m.hint}
          </p>
        )}

        {/* Footer: accent label + dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: c.text,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Reminder Hari Ini
          </span>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {MOTIVATIONS.slice(0, 5).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: i === idx % 5 ? c.text : "var(--border)",
                  transition: "background 200ms ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
