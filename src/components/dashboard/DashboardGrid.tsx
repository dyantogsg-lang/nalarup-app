"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardGridProps {
  children: ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * DashboardGrid — Client wrapper that provides staggered entrance animations
 * for the game HUD dashboard bento grid items.
 */
export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(140px,auto)]"
    >
      {children}
    </motion.div>
  );
}

/**
 * DashboardItem — Animated bento grid item wrapper.
 */
export function DashboardItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * HUDTopBar — Animated top status bar (level + XP + streak + username).
 */
export function HUDTopBar({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-6"
    >
      {children}
    </motion.div>
  );
}
