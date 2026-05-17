"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { XPBar } from "@/components/ui/XPBar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { LevelBadge } from "@/components/ui/LevelBadge";

export default function GamificationShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold text-emerald-400 tracking-[0.15em] uppercase mb-3">
            Gamifikasi
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold text-white tracking-tight leading-tight mb-4">
            Belajar terasa seperti{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              naik level
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-[520px] mx-auto">
            Sistem XP, streak, dan level badge bikin kamu konsisten latihan setiap hari.
          </p>
        </motion.div>

        {/* Showcase cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard glow="green" className="h-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400" aria-hidden="true">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white">Experience Points</span>
                </div>
                <XPBar current={720} max={1000} level={7} />
                <p className="text-xs text-gray-500 mt-1">
                  Selesaikan tryout untuk mendapat XP dan naik level
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard glow="orange" className="h-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400" aria-hidden="true">
                      <path d="M12 23c-4.97 0-8-3.03-8-7 0-2.14.89-4.09 2.33-5.51A6.98 6.98 0 0 0 9 5c0-.55.05-1.09.14-1.62A9.97 9.97 0 0 1 12 1c.89 1.56 1.5 3.28 1.5 5.12 0 1.37-.38 2.65-1.04 3.74A4.5 4.5 0 0 1 16 6.5c1.83 2.08 4 4.5 4 8.5 0 3.97-3.03 8-8 8z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white">Daily Streak</span>
                </div>
                <div className="flex items-center gap-4">
                  <StreakBadge count={12} status="active" />
                  <div className="flex gap-1">
                    {["S", "S", "R", "K", "J", "S", "M"].map((day, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          i < 5
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-white/[0.03] text-gray-600 border border-white/5"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Jaga streak harianmu untuk bonus XP ekstra
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Level Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard glow="purple" className="h-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white">Level & Rank</span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <LevelBadge level={12} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Naik rank dari Novice sampai Legend
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
