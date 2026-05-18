'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const QUOTES = [
  { text: 'Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.', author: 'Colin Powell' },
  { text: 'Tidak ada jalan pintas menuju tempat yang layak dituju.', author: 'Beverly Sills' },
  { text: 'Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang kamu lakukan.', author: 'Steve Jobs' },
  { text: 'Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.', author: 'Nelson Mandela' },
  { text: 'Jangan takut gagal. Takutlah untuk tidak mencoba.', author: 'Pepatah Indonesia' },
  { text: 'Berakit-rakit ke hulu, berenang-renang ke tepian. Bersakit-sakit dahulu, bersenang-senang kemudian.', author: 'Peribahasa Indonesia' },
  { text: 'Masa depan milik mereka yang percaya pada keindahan mimpi-mimpi mereka.', author: 'Eleanor Roosevelt' },
  { text: 'Bukan tentang seberapa keras kamu dipukul, tapi seberapa keras kamu bisa bertahan dan terus maju.', author: 'Rocky Balboa' },
  { text: 'Ilmu itu lebih baik daripada harta. Ilmu menjaga engkau, sedangkan harta engkau yang menjaganya.', author: 'Ali bin Abi Thalib' },
  { text: 'Orang yang berhenti belajar akan menjadi pemilik masa lalu. Orang yang terus belajar akan menjadi pemilik masa depan.', author: 'Mario Teguh' },
  { text: 'Kegagalan adalah bumbu kehidupan. Tanpanya, kesuksesan tidak akan terasa manis.', author: 'Pepatah Indonesia' },
  { text: 'Disiplin adalah jembatan antara tujuan dan pencapaian.', author: 'Jim Rohn' },
  { text: 'Sedikit demi sedikit, lama-lama menjadi bukit.', author: 'Peribahasa Indonesia' },
  { text: 'Keberhasilan bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci keberhasilan.', author: 'Albert Schweitzer' },
  { text: 'Waktu terbaik untuk menanam pohon adalah 20 tahun lalu. Waktu terbaik kedua adalah sekarang.', author: 'Pepatah Tiongkok' },
  { text: 'Jangan menunggu. Waktunya tidak akan pernah tepat.', author: 'Napoleon Hill' },
  { text: 'Guru terbaik dalam hidup adalah pengalaman. Pelajaran terbaik datang dari kegagalan.', author: 'Pepatah Indonesia' },
  { text: 'Belajar tanpa berpikir itu tidaklah berguna, tapi berpikir tanpa belajar itu sangatlah berbahaya.', author: 'Konfusius' },
  { text: 'Setiap orang yang sukses pernah gagal. Tapi tidak setiap orang yang gagal mau bangkit lagi.', author: 'Anonim' },
  { text: 'Usaha tidak akan mengkhianati hasil.', author: 'Pepatah Jepang' },
  { text: 'Perjalanan seribu mil dimulai dari satu langkah.', author: 'Lao Tzu' },
  { text: 'Kunci kesuksesan adalah memulai sebelum kamu siap.', author: 'Marie Forleo' },
  { text: 'Jatuh berdiri lagi, kalah mencoba lagi, gagal bangkit lagi. Sampai Tuhan berkata: waktunya menang.', author: 'Anonim' },
  { text: 'Orang boleh pandai setinggi langit, tapi selama ia tidak menulis, ia akan hilang dari masyarakat.', author: 'Pramoedya Ananta Toer' },
];

const INTERVAL_MS = 4000;

export default function MotivationCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % QUOTES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20"
      aria-label="Motivasi harian"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center mb-8">
        <span className="text-xs text-[var(--violet)] font-bold tracking-[0.1em] uppercase block mb-3">
          Motivasi Harian
        </span>
      </div>

      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-6 sm:px-12 py-10 sm:py-14 min-h-[180px] flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle gradient accent */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ background: 'linear-gradient(135deg, var(--blue), var(--violet))' }}
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-[1] text-center max-w-[640px]"
          >
            <p className="text-[var(--text-primary)] text-base sm:text-lg italic leading-relaxed m-0 mb-4">
              &ldquo;{QUOTES[current].text}&rdquo;
            </p>
            <span className="text-sm text-[var(--text-muted)] font-medium">
              — {QUOTES[current].author}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="relative z-[1] flex items-center justify-center gap-1.5 mt-8" aria-hidden="true">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 border-0 p-0 cursor-pointer ${
                i === current
                  ? 'bg-[var(--blue)] w-4'
                  : 'bg-[var(--border)] hover:bg-[var(--text-dim)]'
              }`}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
