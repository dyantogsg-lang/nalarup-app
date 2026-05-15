"use client";

import { useState } from "react";
import { pickDailyMotivation, accentColor } from "@/lib/constants/motivation";

/**
 * Daily motivation banner untuk dashboard.
 * Deterministic per-hari; di-resolve sekali saat mount client supaya
 * konsisten dengan initial render server (server pakai UTC date).
 */
export default function DailyMotivationBanner({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [m] = useState(() => pickDailyMotivation());

  const c = accentColor(m.accent);

  if (compact) {
    return (
      <div
        className="glass-card daily-motivation-compact"
        style={{
          padding: "0.85rem 1.1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: c.bg,
          borderColor: c.border,
          borderLeft: `3px solid ${c.text}`,
        }}
      >
        <span aria-hidden="true" style={{ color: c.text, display: "flex", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </span>
        <p
          style={{
            color: "var(--text-primary)",
            fontSize: "0.82rem",
            lineHeight: 1.55,
            margin: 0,
            fontWeight: 500,
          }}
        >
          {m.text}
        </p>
      </div>
    );
  }

  return (
    <div
      className="glass-card daily-motivation"
      style={{
        position: "relative",
        padding: "1.5rem 1.75rem",
        background: c.bg,
        borderColor: c.border,
        overflow: "hidden",
      }}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: 220,
          height: 220,
          background: `radial-gradient(circle, ${c.bg}, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: "0.75rem",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${c.border}`,
            color: c.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Sparkle icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5L12 3z" />
            <path d="M19 17l.6 1.7L21 19l-1.4.3L19 21l-.6-1.7L17 19l1.4-.3L19 17z" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: c.text,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.45rem",
            }}
          >
            Pengingat Hari Ini
          </div>
          <p
            style={{
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              fontWeight: 500,
              margin: 0,
              marginBottom: m.hint ? "0.55rem" : 0,
              letterSpacing: "-0.005em",
            }}
          >
            {m.text}
          </p>
          {m.hint && (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {m.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
