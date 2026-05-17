"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementToastProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  xp?: number;
  visible?: boolean;
  onClose?: () => void;
}

/**
 * AchievementToast — Animated toast notification for achievements/XP gains.
 */
export function AchievementToast({
  title,
  description,
  icon,
  xp,
  visible = true,
  onClose,
}: AchievementToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live="polite"
          aria-label={`Achievement: ${title}${xp ? ` — +${xp} XP` : ""}`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(34,197,94,0.15)]"
        >
          {/* Icon */}
          {icon && (
            <motion.div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400"
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              aria-hidden="true"
            >
              {icon}
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {title}
            </p>
            {description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>

          {/* XP badge */}
          {xp && (
            <motion.div
              className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            >
              +{xp} XP
            </motion.div>
          )}

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
