"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const TESTIMONIALS = [
  {
    name: "Rina S.",
    role: "Lolos CPNS 2025 — Kemenkeu",
    text: "Awalnya skor TWK saya di bawah passing grade. Setelah 3 minggu pakai NalarUp, gap-nya hilang dan saya lolos di attempt kedua.",
    glow: "green" as const,
  },
  {
    name: "Andi P.",
    role: "Lolos CPNS 2025 — Kemendikbud",
    text: "Fitur analisis kelemahan sangat membantu. Saya jadi tahu harus fokus di mana tanpa buang waktu di materi yang sudah dikuasai.",
    glow: "blue" as const,
  },
  {
    name: "Dian M.",
    role: "Lolos PPPK 2025 — Guru",
    text: "Simulasinya realistis banget, mirip CAT BKN asli. Pas hari H saya sudah terbiasa dengan tekanan timer dan navigasi soal.",
    glow: "purple" as const,
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimoni" className="relative py-20 sm:py-28" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold text-amber-400 tracking-[0.15em] uppercase mb-3">
            Testimoni
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold text-white tracking-tight leading-tight mb-4">
            Cerita mereka yang sudah{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              berhasil
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-[480px] mx-auto">
            Ribuan peserta sudah merasakan manfaat latihan terarah dengan NalarUp.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard glow={t.glow} className="h-full flex flex-col">
                {/* Quote icon */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white/10 mb-4 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M11 7H7a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H6a1 1 0 0 0 0 2h1a4 4 0 0 0 4-4v-9zm10 0h-4a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a1 1 0 0 0 0 2h1a4 4 0 0 0 4-4v-9z" />
                </svg>

                {/* Text */}
                <p className="text-sm text-gray-300 leading-relaxed flex-1 mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="border-t border-white/10 pt-4 mt-auto">
                  <span className="block text-sm font-semibold text-white">
                    {t.name}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {t.role}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
