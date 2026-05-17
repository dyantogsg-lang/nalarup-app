"use client";

interface ProgressRingProps {
  /** Current value (0–max) */
  value: number | null;
  /** Maximum value (default 100) */
  max?: number;
  /** Ring size in px (default 108) */
  size?: number;
  /** Stroke width in px (default 8) */
  strokeWidth?: number;
  /** Stroke color — CSS color string */
  color?: string;
  /** Optional passing-grade threshold (0–max) to show a marker */
  passingGrade?: number;
  /** Label shown below the value inside the ring */
  subLabel?: string;
  /** Additional className on the wrapper */
  className?: string;
}

/**
 * ProgressRing — circular SVG progress indicator.
 * Used in dashboard, results, and history pages.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 108,
  strokeWidth = 8,
  color = "var(--blue)",
  passingGrade,
  subLabel,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const percent = value != null ? Math.min(value / max, 1) : 0;
  const dashOffset = circumference * (1 - percent);

  // Passing grade marker offset
  const pgPercent = passingGrade != null ? Math.min(passingGrade / max, 1) : null;
  const pgDashOffset = pgPercent != null ? circumference * (1 - pgPercent) : null;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value ?? undefined}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={value != null ? `${value} of ${max}` : "No data"}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          className="progress-ring-track"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />

        {/* Passing grade marker */}
        {pgDashOffset != null && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={2}
            stroke="rgba(34,197,94,0.25)"
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={pgDashOffset}
            strokeLinecap="round"
          />
        )}

        {/* Score fill */}
        <circle
          className="progress-ring-fill"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={value != null ? dashOffset : circumference}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span
          className="font-bold leading-none"
          style={{
            fontSize: `${size * 0.014}rem`,
            color: "var(--text-primary)",
          }}
        >
          {value ?? "—"}
        </span>
        {subLabel && value != null && (
          <span
            className="font-medium"
            style={{
              fontSize: `${size * 0.0056}rem`,
              color: "var(--text-dim)",
            }}
          >
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
