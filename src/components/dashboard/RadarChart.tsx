"use client";

/**
 * SVG Radar Chart — performance per subtes (TWK, TIU, TKP)
 * Pure CSS/SVG, no external dependencies
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
  // Max values per subtes for normalization
  const maxTwk = 150;
  const maxTiu = 175;
  const maxTkp = 175;

  // Normalize to 0-1
  const normTwk = Math.min(twk / maxTwk, 1);
  const normTiu = Math.min(tiu / maxTiu, 1);
  const normTkp = Math.min(tkp / maxTkp, 1);

  // Passing grade normalized
  const normPgTwk = Math.min(pgTwk / maxTwk, 1);
  const normPgTiu = Math.min(pgTiu / maxTiu, 1);
  const normPgTkp = Math.min(pgTkp / maxTkp, 1);

  // Chart geometry
  const cx = 120;
  const cy = 120;
  const radius = 90;
  const levels = 4;

  // 3 axes at 120° apart, starting from top
  const angles = [-90, 30, 150].map((d) => (d * Math.PI) / 180);

  function getPoint(angle: number, value: number): [number, number] {
    return [
      cx + radius * value * Math.cos(angle),
      cy + radius * value * Math.sin(angle),
    ];
  }

  // Grid lines (concentric triangles)
  const gridPaths = Array.from({ length: levels }, (_, i) => {
    const scale = (i + 1) / levels;
    const points = angles.map((a) => getPoint(a, scale));
    return points.map((p) => p.join(",")).join(" ");
  });

  // Data polygon
  const dataPoints = [
    getPoint(angles[0], normTwk),
    getPoint(angles[1], normTiu),
    getPoint(angles[2], normTkp),
  ];
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ");

  // Passing grade polygon
  const pgPoints = [
    getPoint(angles[0], normPgTwk),
    getPoint(angles[1], normPgTiu),
    getPoint(angles[2], normPgTkp),
  ];
  const pgPath = pgPoints.map((p) => p.join(",")).join(" ");

  // Axis labels
  const labels = [
    { text: "TWK", pos: getPoint(angles[0], 1.18), value: twk },
    { text: "TIU", pos: getPoint(angles[1], 1.18), value: tiu },
    { text: "TKP", pos: getPoint(angles[2], 1.18), value: tkp },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        style={{ overflow: "visible" }}
        aria-label="Radar chart performa subtes"
      >
        {/* Grid */}
        {gridPaths.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity={0.6}
          />
        ))}

        {/* Axis lines */}
        {angles.map((a, i) => {
          const [ex, ey] = getPoint(a, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={ex}
              y2={ey}
              stroke="var(--border)"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}

        {/* Passing grade polygon */}
        <polygon
          points={pgPath}
          fill="rgba(245,158,11,0.06)"
          stroke="var(--amber)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity={0.7}
        />

        {/* Data polygon */}
        <polygon
          points={dataPath}
          fill="rgba(37,99,235,0.12)"
          stroke="var(--blue)"
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="var(--blue)"
            stroke="var(--bg-card)"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {labels.map((l, i) => (
          <g key={i}>
            <text
              x={l.pos[0]}
              y={l.pos[1] - 6}
              textAnchor="middle"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                fill: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {l.text}
            </text>
            <text
              x={l.pos[0]}
              y={l.pos[1] + 8}
              textAnchor="middle"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                fill: "var(--blue)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {l.value}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div style={{ width: 12, height: 3, borderRadius: 2, background: "var(--blue)" }} />
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>Skor kamu</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div style={{ width: 12, height: 3, borderRadius: 2, background: "var(--amber)", opacity: 0.7 }} />
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>Passing grade</span>
        </div>
      </div>
    </div>
  );
}
