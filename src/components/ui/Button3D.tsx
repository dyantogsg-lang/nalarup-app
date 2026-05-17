import { type ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "green" | "purple" | "orange" | "blue" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface Button3DProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, string> = {
  green: [
    "bg-emerald-500 text-white border-b-[4px] border-b-emerald-700",
    "hover:bg-emerald-400 active:border-b-[1px] active:translate-y-[3px]",
    "shadow-[0_4px_12px_rgba(34,197,94,0.3)]",
  ].join(" "),
  purple: [
    "bg-violet-500 text-white border-b-[4px] border-b-violet-700",
    "hover:bg-violet-400 active:border-b-[1px] active:translate-y-[3px]",
    "shadow-[0_4px_12px_rgba(124,58,237,0.3)]",
  ].join(" "),
  orange: [
    "bg-amber-500 text-white border-b-[4px] border-b-amber-700",
    "hover:bg-amber-400 active:border-b-[1px] active:translate-y-[3px]",
    "shadow-[0_4px_12px_rgba(245,158,11,0.3)]",
  ].join(" "),
  blue: [
    "bg-blue-500 text-white border-b-[4px] border-b-blue-700",
    "hover:bg-blue-400 active:border-b-[1px] active:translate-y-[3px]",
    "shadow-[0_4px_12px_rgba(59,130,246,0.3)]",
  ].join(" "),
  ghost: [
    "bg-white/[0.05] text-[var(--text-primary)] border-b-[4px] border-b-white/10",
    "hover:bg-white/[0.08] active:border-b-[1px] active:translate-y-[3px]",
    "border border-white/10",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-7 py-3.5 text-lg rounded-xl",
};

/**
 * Button3D — Duolingo-style 3D press button with thick bottom border that shifts on press.
 */
export function Button3D({
  children,
  variant = "green",
  size = "md",
  href,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}: Button3DProps) {
  const base = [
    "inline-flex items-center justify-center gap-2 font-semibold",
    "transition-all duration-100 ease-out select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
  ].join(" ");

  const disabledClass = disabled
    ? "opacity-50 pointer-events-none cursor-not-allowed"
    : "cursor-pointer";

  const classes = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledClass} ${className}`;

  const content = loading ? (
    <>
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>Loading...</span>
    </>
  ) : (
    children
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-disabled={disabled}
      aria-busy={loading}
    >
      {content}
    </button>
  );
}
