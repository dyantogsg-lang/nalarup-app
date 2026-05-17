"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Feature {
  title: string;
  desc: string;
  icon: string;
  glow: "green" | "purple" | "orange" | "blue";
  span?: "1" | "2";
}

const FEATURES: Feature[] = [
  {
    title: "Simulasi CAT BKN",
    desc: "Timer, bobot soal, dan navigasi identik ujian asli. Terbiasa sebelum hari H.",
    icon: "🖥️",
    glow: "blue",
    span: "2",
  },
  {
    title: "Analisis Kelemahan",
    desc: "Breakdown per subtes — tahu persis gap kamu vs passing grade.",
    icon: "🎯",
    glow: "green",
  },
  {
    title: "Pembahasan Lengkap",
    desc: "Lihat alasan jawaban benar/salah setelah tryout selesai.",
    icon: "📖",
    glow: "purple",
  },
  {
    title: "Score Safe Meter",
    desc: "Pantau total skor dan jarakmu dari passing grade SKD secara real-time.",
    icon: "📊",
    glow: "orange",
  },
  {
    title: "Review Soal Salah",
    desc: "Fokus bahas jawaban salah agar sesi belajar lebih efisien.",
    icon: "🔄",
    glow: "purple",
    span: "2",
  },
  {
    title: "Akses Terbuka",
    desc: "Semua paket utama bisa dicoba tanpa paywall atau biaya tersembunyi.",
    icon: "🔓",
    glow: "green",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="fitur" className="relative py-20 sm:py-28" ref={ref}>
      {/* Section header */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-block text-xs font-bold text-violet-400 tracking-[0.15em] uppercase mb-3">
            Fitur Unggulan
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold text-white tracking-tight leading-tight mb-4">
            Bukan sekadar{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              kumpulan soal
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-[560px] mx-auto leading-relaxed">
            Fitur yang dirancang untuk menaikkan skor — analisis kelemahan, simulasi realistis,
            dan latihan terarah.
          </p>
        </motion.div>
      </div>

      {/* Bento Grid */}
      <motion.div
        className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            className={feature.span === "2" ? "sm:col-span-2" : "col-span-1"}
          >
            <GlassCard glow={feature.glow} hoverable className="h-full">
              <div className="flex flex-col h-full">
                {/* Icon with glow */}
                <div className="text-3xl mb-4 w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-1">
                  {feature.desc}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
