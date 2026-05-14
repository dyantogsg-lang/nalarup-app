"use client";

/**
 * Subtest Performance — circular progress rings for TWK, TIU, TKP
 * Clean, modern design inspired by fintech dashboards
 */

interface RadarChartProps {
  twk: number;
  tiu: number;
  tkp: number;
  pgTwk?: number;
  pgTiu?: number;
  pgTkp?: number;
}

export default function RadarChart({
  twk,
  tiu,
  tkp,
  pgTwk = 65,
  pgTiu = 80,
  pgTkp = 166,
}: RadarChartProps) {
  const maxTwk = 150;
  const maxTiu = 175;
  const maxTkp = 175;

  const subtests = [
    { label: "TWK", value: twk, max: maxTwk, pg: pgTwk, color: "var(--blue)", colorRgb: "37,99,235" },
    { label: "TIU", value: tiu, max: maxTiu, pg: pgTiu, color: "var(--violet)", colorRgb: "124,58,237" },
    { label: "TKP", value: tkp, max: maxTkp, pg: pgTkp, color: "var(--green)", colorRgb: "34,197,94" },
  ];

  const RADIUS = 28;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      {/* Title */}
      <div style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "var(--text-dim)",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}>
        Performa Subtes
      </div>

      {/* Circular indicators */}
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        gap: "0.5rem",
      }}>
        {subtests.map((s) => {
          const percent = s.max > 0 ? Math.min((s.value / s.max) * 100, 100) : 0;
          const dashOffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
          const isPassed = s.value >= s.pg;
          const pgPercent = Math.min((s.pg / s.max) * 100, 100);

          return (
            <div key={s.label} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              {/* Ring */}
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                  {/* Track */}
                  <circle
                    cx="36" cy="36" r={RADIUS}
                    fill="none"
                    strokeWidth="5"
                    stroke="var(--bg-card2)"
                  />
                  {/* PG marker — subtle arc */}
                  <circle
                    cx="36" cy="36" r={RADIUS}
                    fill="none"
                    strokeWidth="5"
                    stroke="var(--border)"
                    strokeDasharray={`${(pgPercent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    opacity="0.4"
                  />
                  {/* Value fill */}
                  <circle
                    cx="36" cy="36" r={RADIUS}
                    fill="none"
                    strokeWidth="5"
                    stroke={s.color}
                    strokeLinecap="round"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={dashOffset}
                    style={{
                      transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)",
                      filter: `drop-shadow(0 0 4px rgba(${s.colorRgb},0.4))`,
                    }}
                  />
                </svg>
                {/* Center value */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span className="num" style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}>
                    {s.value}
                  </span>
                  <span style={{
                    fontSize: "0.55rem",
                    color: "var(--text-dim)",
                    fontWeight: 500,
                    marginTop: "1px",
                  }}>
                    / {s.max}
                  </span>
                </div>
              </div>

              {/* Label + status */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "2px",
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: isPassed ? "var(--green)" : "var(--text-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                }}>
                  {isPassed ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Aman
                    </>
                  ) : (
                    <>PG: {s.pg}</>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.625rem 0.75rem",
        background: "var(--bg-card2)",
        borderRadius: "0.5rem",
        border: "1px solid var(--border)",
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: (twk + tiu + tkp) >= (pgTwk + pgTiu + pgTkp) ? "var(--green)" : "var(--amber)",
          boxShadow: (twk + tiu + tkp) >= (pgTwk + pgTiu + pgTkp)
            ? "0 0 6px rgba(34,197,94,0.5)"
            : "0 0 6px rgba(245,158,11,0.5)",
        }} />
        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Total: <span className="num" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{twk + tiu + tkp}</span>
          <span style={{ color: "var(--text-dim)" }}> / {maxTwk + maxTiu + maxTkp}</span>
          {" · "}
          PG: <span className="num" style={{ fontWeight: 600 }}>{pgTwk + pgTiu + pgTkp}</span>
        </span>
      </div>
    </div>
  );
}
