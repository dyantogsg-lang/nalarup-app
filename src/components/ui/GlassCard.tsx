import { type ReactNode } from "react";

type GlowColor = "green" | "purple" | "orange" | "blue";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: GlowColor;
  hoverable?: boolean;
}

const glowMap: Record<GlowColor, string> = {
  green: "shadow-[0_0_24px_rgba(34,197,94,0.15)] border-emerald-500/20",
  purple: "shadow-[0_0_24px_rgba(124,58,237,0.15)] border-violet-500/20",
  orange: "shadow-[0_0_24px_rgba(245,158,11,0.15)] border-amber-500/20",
  blue: "shadow-[0_0_24px_rgba(59,130,246,0.15)] border-blue-500/20",
};

const glowHoverMap: Record<GlowColor, string> = {
  green: "hover:shadow-[0_0_32px_rgba(34,197,94,0.25)] hover:border-emerald-500/40",
  purple: "hover:shadow-[0_0_32px_rgba(124,58,237,0.25)] hover:border-violet-500/40",
  orange: "hover:shadow-[0_0_32px_rgba(245,158,11,0.25)] hover:border-amber-500/40",
  blue: "hover:shadow-[0_0_32px_rgba(59,130,246,0.25)] hover:border-blue-500/40",
};

/**
 * GlassCard — Frosted glass card with backdrop-blur, animated border gradient, hover lift.
 */
export function GlassCard({
  children,
  className = "",
  glow,
  hoverable = false,
}: GlassCardProps) {
  const base = [
    "relative rounded-2xl border border-white/10",
    "bg-white/[0.03] backdrop-blur-xl",
    "p-6 transition-all duration-300 ease-out",
  ].join(" ");

  const glowClass = glow ? glowMap[glow] : "";
  const hoverGlow = glow && hoverable ? glowHoverMap[glow] : "";
  const hoverLift = hoverable
    ? "hover:-translate-y-1 hover:bg-white/[0.06] cursor-pointer"
    : "";

  return (
    <div
      role="region"
      className={`${base} ${glowClass} ${hoverGlow} ${hoverLift} ${className}`}
    >
      {/* Animated gradient border overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
