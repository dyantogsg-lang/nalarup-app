import { type ReactNode } from "react";

type Accent = "blue" | "violet" | "green" | "amber";

interface StatCardProps {
  /** Upper label text */
  label: string;
  /** Main value (number or string) */
  value: ReactNode;
  /** Optional sub-text below value */
  sub?: string;
  /** Color accent for left border */
  accent?: Accent;
  /** Optional icon displayed top-right */
  icon?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * StatCard — icon box + label + value pattern.
 * Used across dashboard, results, history, and profile pages.
 */
export function StatCard({
  label,
  value,
  sub,
  accent = "blue",
  icon,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`glass-card stat-card-${accent} ${className}`}
      role="group"
      aria-label={`${label}: ${value}`}
      style={{ padding: "1.25rem 1.25rem 1.25rem 1.5rem" }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-[0.68rem] font-bold uppercase tracking-wider"
          style={{ color: "var(--text-dim)", letterSpacing: "0.07em" }}
        >
          {label}
        </span>
        {icon && (
          <span className="flex" style={{ color: "var(--text-dim)" }} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div
        className="font-bold leading-none mb-1.5"
        style={{
          fontSize: "1.875rem",
          color: "var(--text-primary)",
          letterSpacing: "-0.025em",
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          className="text-[0.7rem] font-medium"
          style={{ color: "var(--text-dim)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
