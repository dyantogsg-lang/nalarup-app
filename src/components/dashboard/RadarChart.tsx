"use client";

/**
 * Performance Radar Chart — hexagonal style with gradient fill & glow
 * Visualizes TWK, TIU, TKP scores vs passing grade
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

  // Normalize to 0-1
  const normTwk = Math.min(twk / maxTwk, 1);
  const normTiu = Math.min(tiu / maxTiu, 1);
  const normTkp = Math.min(tkp / maxTkp, 1);

  const normPgTwk = Math.min(pgTwk / maxTwk, 1);
  const normPgTiu = Math.min(pgTiu / maxTiu, 1);
  const normPgTkp = Math.min(pgTkp / maxTkp, 1);

  // Chart geometry — 6 axes for hexagonal grid, 3 data points
  const cx = 130;
  const cy = 130;
  const radius = 95;
  const levels = 5;

  // 6 axes for hex grid (every 60°)
  const hexAngles = [0, 1, 2, 3, 4, 5].map((i) => ((i * 60 - 90) * Math.PI) / 180);
  // 3 data axes at 120° apart
  const dataAngles = [-90, 30, 150].map((d) => (d * Math.PI) / 180);

  function getPoint(angle: number, value: number): [number, number] {
    return [
      cx + radius * value * Math.cos(angle),
      cy + radius * value * Math.sin(angle),
    ];
  }

  // Hexagonal grid levels
  const gridPaths = Array.from({ length: levels }, (_, i) => {
    const scale = (i + 1) / levels;
    const points = hexAngles.map((a) => getPoint(a, scale));
    return points.map((p) => `${p[0]},${p[1]}`).join(" ");
  });

  // Data polygon (smooth path)
  const dataPoints = [
    getPoint(dataAngles[0], normTwk),
    getPoint(dataAngles[1], normTiu),
    getPoint(dataAngles[2], normTkp),
  ];

  // Create smooth curved path through data points
  function smoothPolygon(points: [number, number][]): string {
    const n = points.length;
    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < n; i++) {
      const curr = points[i];
      const next = points[(i + 1) % n];
      const cpx = (curr[0] + next[0]) / 2;
      const cpy = (curr[1] + next[1]) / 2;
      d += ` Q ${curr[0]},${curr[1]} ${cpx},${cpy}`;
    }
    d += " Z";
    return d;
  }

  const dataPath = smoothPolygon(dataPoints);

  // Passing grade polygon
  const pgPoints: [number, number][] = [
    getPoint(dataAngles[0], normPgTwk),
    getPoint(dataAngles[1], normPgTiu),
    getPoint(dataAngles[2], normPgTkp),
  ];
  const pgPath = smoothPolygon(pgPoints);

  // Labels with score and percentage
  const subtests = [
    { text: "TWK", angle: dataAngles[0], value: twk, max: maxTwk, pg: pgTwk },
    { text: "TIU", angle: dataAngles[1], value: tiu, max: maxTiu, pg: pgTiu },
    { text: "TKP", angle: dataAngles[2], value: tkp, max: maxTkp, pg: pgTkp },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <svg
        width="100%"
        height="auto"
        viewBox="0 0 260 260"
        style={{ maxWidth: 260, overflow: "visible" }}
        aria-label="Radar chart performa subtes TWK, TIU, TKP"
        role="img"
      >
        <defs>
          {/* Gradient fill for data area */}
          <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.08" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Dot glow */}
          <filter id="dot-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle — subtle */}
        <circle cx={cx} cy={cy} r={radius + 2} fill="var(--bg-card2)" opacity="0.3" />

        {/* Hexagonal grid */}
        {gridPaths.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--border)"
            strokeWidth={i === levels - 1 ? "1.2" : "0.6"}
            opacity={i === levels - 1 ? 0.5 : 0.3}
          />
        ))}

        {/* Axis lines — only 3 data axes */}
        {dataAngles.map((a, i) => {
          const [ex, ey] = getPoint(a, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={ex}
              y2={ey}
              stroke="var(--border)"
              strokeWidth="0.8"
              opacity={0.5}
            />
          );
        })}

        {/* Passing grade area */}
        <path
          d={pgPath}
          fill="rgba(245,158,11,0.04)"
          stroke="var(--amber)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          opacity={0.6}
        />

        {/* Data area with gradient + glow */}
        <path
          d={dataPath}
          fill="url(#radar-gradient)"
          stroke="var(--blue)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#radar-glow)"
          style={{ transition: "d 0.6s ease" }}
        />

        {/* Data points with glow */}
        {dataPoints.map(([x, y], i) => (
          <g key={i} filter="url(#dot-glow)">
            <circle
              cx={x}
              cy={y}
              r="5"
              fill="var(--blue)"
              stroke="var(--bg-card)"
              strokeWidth="2.5"
            />
          </g>
        ))}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2.5" fill="var(--border)" opacity="0.5" />

        {/* Labels */}
        {subtests.map((s, i) => {
          const labelPos = getPoint(s.angle, 1.28);
          const isPassed = s.value >= s.pg;
          return (
            <g key={i}>
              {/* Label background pill */}
              <rect
                x={labelPos[0] - 24}
                y={labelPos[1] - 18}
                width="48"
                height="36"
                rx="8"
                fill="var(--bg-card)"
                stroke="var(--border)"
                strokeWidth="0.8"
                opacity="0.9"
              />
              {/* Subtest name */}
              <text
                x={labelPos[0]}
                y={labelPos[1] - 5}
                textAnchor="middle"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  fill: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.03em",
                }}
              >
                {s.text}
              </text>
              {/* Score value */}
              <text
                x={labelPos[0]}
                y={labelPos[1] + 10}
                textAnchor="middle"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  fill: isPassed ? "var(--green)" : "var(--blue)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.value}
              </text>
            </g>
          );
        })}

        {/* Level labels (percentage) */}
        {[20, 40, 60, 80, 100].map((pct, i) => {
          const scale = (i + 1) / levels;
          const [lx, ly] = getPoint(hexAngles[5], scale);
          return (
            <text
              key={i}
              x={lx + 8}
              y={ly + 3}
              style={{
                fontSize: "7px",
                fill: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
              }}
            >
              {pct}%
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "1.25rem",
        marginTop: "0.75rem",
        padding: "0.5rem 0.75rem",
        background: "var(--bg-card2)",
        borderRadius: "0.5rem",
        border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--blue)",
            boxShadow: "0 0 6px rgba(37,99,235,0.4)",
          }} />
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Skor kamu</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div style={{
            width: 10,
            height: 3,
            borderRadius: 2,
            background: "var(--amber)",
            opacity: 0.7,
          }} />
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Passing grade</span>
        </div>
      </div>
    </div>
  );
}
