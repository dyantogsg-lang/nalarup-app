"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

interface StatsCounterProps {
  stats: StatItem[];
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="relative py-16 sm:py-20 overflow-hidden"
      aria-label="Statistik platform"
    >
      {/* Glow line top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden="true" />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="relative inline-block">
                {/* Glow behind number */}
                <div className="absolute inset-0 blur-2xl bg-emerald-500/10 rounded-full scale-150" aria-hidden="true" />
                <span className="relative num text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white tracking-tight">
                  {isInView ? (
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix || ""}
                    />
                  ) : (
                    "0"
                  )}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Glow line bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" aria-hidden="true" />
    </section>
  );
}
