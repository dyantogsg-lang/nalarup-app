import { type ReactNode } from "react";

interface SectionCardProps {
  /** Optional section title */
  title?: string;
  /** Card content */
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Whether to apply hover effect (default false) */
  hoverable?: boolean;
  /** Padding size preset */
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/**
 * SectionCard — card wrapper with consistent styling.
 * Wraps content sections with the glass-card pattern.
 */
export function SectionCard({
  title,
  children,
  className = "",
  hoverable = false,
  padding = "md",
}: SectionCardProps) {
  return (
    <section
      className={`glass-card ${paddingMap[padding]} ${hoverable ? "" : "hover:bg-[var(--bg-card)] hover:border-[var(--border)]"} ${className}`}
      aria-label={title}
    >
      {title && (
        <h2
          className="text-[0.68rem] font-bold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
