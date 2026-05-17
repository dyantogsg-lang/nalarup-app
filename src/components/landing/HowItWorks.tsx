"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const HOW_STEPS = [
  {
    n: "01",
    title: "Pilih paket tryout",
    desc: "Mulai dari paket SKD penuh atau practice subtes terfokus. Semua open access.",
    color: "emerald",
  },
  {
    n: "02",
    title: "Kerjakan simulasi",
    desc: "Timer berjalan, soal & navigasi mirip CAT BKN. Autosave setiap jawaban.",
    color: "blue",
  },
  {
    n: "03",
    title: "Lihat skor & gap",
    desc: "Dapat skor per subtes, status passing grade, dan posisi vs target safe score.",
    color: "violet",
  },
  {
    n: "04",
    title: "Latihan terarah",
    desc: "Ikuti rekomendasi berdasarkan kelemahan, lalu tryout ulang sampai aman.",
    color: "amber",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="cara-kerja" className="relative py-20 sm:py-28" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold text-blue-400 tracking-[0.15em] uppercase mb-3">
            Cara Kerja
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold text-white tracking-tight leading-tight mb-4">
            Loop yang{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              menaikkan skor
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-[500px] mx-auto">
            Empat langkah, diulang sampai posisi aman. Tanpa gimmick, tanpa paywall.
          </p>
        </motion.div>

        {/* Steps — horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-4 gap-5 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="min-w-[260px] lg:min-w-0 snap-center"
            >
              <GlassCard className="h-full relative overflow-hidden">
                {/* Big number watermark */}
                <span
                  className="absolute -top-3 -right-1 text-[5rem] font-extrabold text-white/[0.03] leading-none pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {step.n}
                </span>

                {/* Step number badge */}
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-${step.color}-500/20 border border-${step.color}-500/30 mb-4`}>
                  <span className={`text-xs font-bold text-${step.color}-400`}>{step.n}</span>
                </div>

                {/* Connector line (not on last) */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-gradient-to-r from-white/20 to-transparent" aria-hidden="true" />
                )}

                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed m-0">
                  {step.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
