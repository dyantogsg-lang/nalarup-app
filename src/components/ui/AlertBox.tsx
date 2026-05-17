import { type ReactNode } from "react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertBoxProps {
  /** Alert variant determines color and icon */
  variant?: AlertVariant;
  /** Alert message content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  error: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    text: "var(--danger)",
    icon: "⚠",
  },
  success: {
    bg: "var(--green-subtle)",
    border: "rgba(34,197,94,0.3)",
    text: "var(--green)",
    icon: "✓",
  },
  warning: {
    bg: "var(--amber-subtle)",
    border: "rgba(245,158,11,0.3)",
    text: "var(--amber)",
    icon: "⚠",
  },
  info: {
    bg: "var(--blue-subtle)",
    border: "rgba(37,99,235,0.3)",
    text: "var(--blue)",
    icon: "ℹ",
  },
};

/**
 * AlertBox — error/success/warning/info alert.
 * Used in login, register, and form pages.
 */
export function AlertBox({
  variant = "error",
  children,
  className = "",
}: AlertBoxProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${className}`}
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.text,
      }}
    >
      <span aria-hidden="true" className="flex-shrink-0 text-base leading-5">
        {styles.icon}
      </span>
      <span className="leading-5">{children}</span>
    </div>
  );
}
