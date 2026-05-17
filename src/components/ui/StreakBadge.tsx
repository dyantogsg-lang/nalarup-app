"use client";

import { motion } from "framer-motion";

type StreakStatus = "active" | "at-risk" | "broken";

interface StreakBadgeProps {
  count: number;
  status: StreakStatus;
}

const statusConfig: Record<
  StreakStatus,
  { color: string; bg: string; glow: string; label: string }
> = {
  active: {
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    label: "Active streak",
  },
  "at-risk": {
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    glow: "shadow-[0_0_8px_rgba(249,115,22,0.2)]",
    label: "Streak at risk",
  },
  broken: {
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    glow: "",
    label: "Streak broken",
  },
};

/**
 * StreakBadge — Flame icon with streak count, animated pulse when active.
 */
export function StreakBadge({ count, status }: StreakBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-white/10 ${config.bg} ${config.glow}`}
      animate={
        status === "active"
          ? { scale: [1, 1.05, 1] }
          : status === "at-risk"
            ? { scale: [1, 1.02, 1] }
            : {}
      }
      transition={
        status === "active"
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : status === "at-risk"
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : {}
      }
      role="status"
      aria-label={`${config.label}: ${count} days`}
    >
      {/* Flame icon */}
      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={config.color}
        animate={
          status === "active" ? { y: [0, -1, 0] } : {}
        }
        transition={
          status === "active"
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
        aria-hidden="true"
      >
        <path d="M12 23c-4.97 0-8-3.03-8-7 0-2.14.89-4.09 2.33-5.51A6.98 6.98 0 0 0 9 5c0-.55.05-1.09.14-1.62A9.97 9.97 0 0 1 12 1c.89 1.56 1.5 3.28 1.5 5.12 0 1.37-.38 2.65-1.04 3.74A4.5 4.5 0 0 1 16 6.5c1.83 2.08 4 4.5 4 8.5 0 3.97-3.03 8-8 8z" />
      </motion.svg>

      {/* Count */}
      <span className={`text-sm font-bold ${config.color}`}>{count}</span>
    </motion.div>
  );
}
