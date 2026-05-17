"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  className?: string;
}

/**
 * XPBar — Horizontal XP progress bar with animated fill, level indicator, glow effect.
 */
export function XPBar({ current, max, level, className = "" }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`Level ${level}: ${current} of ${max} XP`}
    >
      {/* Level indicator */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400">
        {level}
      </div>

      {/* Bar container */}
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/[0.06] border border-white/10">
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/40 blur-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          {/* Shimmer */}
          <div
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
              animation: "shimmer 2s infinite",
            }}
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* XP text */}
      <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
        {current}/{max}
      </span>
    </div>
  );
}
