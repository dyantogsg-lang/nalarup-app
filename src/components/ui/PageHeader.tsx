import { type ReactNode } from "react";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Optional right-side action slot */
  action?: ReactNode;
  /** Use gradient text on title (default true) */
  gradient?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * PageHeader — gradient header with title + subtitle.
 * Used across all app pages for consistent page headings.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  gradient = true,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 ${className}`}>
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${gradient ? "gradient-text" : ""}`}
          style={!gradient ? { color: "var(--text-primary)" } : undefined}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}
