"use client";

import { MOTIVATIONS } from "@/lib/constants/motivation";

/**
 * Horizontal scrolling marquee untuk landing page.
 * CSS-only animation, infinite loop. Pause on hover.
 */
export default function MotivationMarquee() {
  // Duplikasi list supaya animasi continuous tanpa jeda.
  const items = [...MOTIVATIONS, ...MOTIVATIONS];

  return (
    <div
      className="motivation-marquee"
      aria-hidden="true"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "0.85rem 0",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="motivation-marquee-track">
        {items.map((m, i) => (
          <span key={`${m.id}-${i}`} className="motivation-marquee-item">
            <span
              className="motivation-marquee-dot"
              style={{ background: `var(--${m.accent === "blue" ? "blue" : m.accent === "violet" ? "violet" : m.accent === "green" ? "green" : m.accent === "amber" ? "amber" : m.accent === "pink" ? "pink" : "teal"})` }}
            />
            {m.text}
          </span>
        ))}
      </div>
    </div>
  );
}
