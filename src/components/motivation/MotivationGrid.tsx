"use client";

import { useEffect, useRef, useState } from "react";
import { MOTIVATIONS, accentColor } from "@/lib/constants/motivation";

/**
 * 3-column motivational grid untuk landing page.
 * Cards reveal saat masuk viewport (IntersectionObserver), staggered.
 */
export default function MotivationGrid() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Pilih 6 kutipan teratas untuk grid (variasi accent merata)
  const picks = MOTIVATIONS.slice(0, 6);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: "1.25rem",
      }}
    >
      {picks.map((m, i) => {
        const c = accentColor(m.accent);
        return (
          <div
            key={m.id}
            className="glass-card motivation-grid-card"
            style={{
              padding: "1.5rem",
              position: "relative",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 90}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 90}ms, border-color 200ms ease, box-shadow 200ms ease`,
              borderTop: `2px solid ${c.text}`,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                background: `radial-gradient(circle, ${c.bg}, transparent 70%)`,
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative" }}>
              {/* Quote glyph */}
              <div
                aria-hidden="true"
                style={{
                  fontSize: "2.5rem",
                  lineHeight: 0.5,
                  color: c.text,
                  opacity: 0.35,
                  fontFamily: "Georgia, serif",
                  marginBottom: "0.5rem",
                  fontWeight: 700,
                }}
              >
                &ldquo;
              </div>
              <p
                style={{
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  fontWeight: 500,
                  margin: 0,
                  marginBottom: m.hint ? "0.65rem" : "1rem",
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
                    marginBottom: "1rem",
                  }}
                >
                  {m.hint}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: c.text,
                    boxShadow: `0 0 8px ${c.text}`,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: c.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Catatan #{String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
