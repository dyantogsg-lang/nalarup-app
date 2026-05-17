"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ROUTES } from "@/lib/constants/routes";
import { Button3D } from "@/components/ui/Button3D";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/8 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-violet-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.03em] leading-[1.1] mb-5">
            Mulai persiapan hari ini,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              gratis.
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10 max-w-[500px] mx-auto">
            Daftar sekarang, tryout pertama selesai dalam 100 menit, dan kamu langsung tahu
            posisimu vs passing grade SKD.
          </p>

          <Button3D variant="green" size="lg" href={ROUTES.register}>
            Coba Tryout Gratis
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button3D>

          <p className="mt-6 text-xs text-gray-600">
            Tidak perlu kartu kredit · Semua paket open access · Bisa diulang bebas
          </p>
        </motion.div>
      </div>
    </section>
  );
}
