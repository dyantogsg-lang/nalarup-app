"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  { text: "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.", author: "Colin Powell" },
  { text: "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan kamu bisa mengubah dunia.", author: "Nelson Mandela" },
  { text: "Masa depan milik mereka yang percaya pada keindahan mimpi-mimpi mereka.", author: "Eleanor Roosevelt" },
  { text: "Tidak ada jalan pintas menuju tempat yang layak dituju.", author: "Beverly Sills" },
  { text: "Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang kamu lakukan.", author: "Steve Jobs" },
  { text: "Jangan biarkan apa yang tidak bisa kamu lakukan menghalangi apa yang bisa kamu lakukan.", author: "John Wooden" },
  { text: "Belajar tanpa berpikir itu sia-sia. Berpikir tanpa belajar itu berbahaya.", author: "Konfusius" },
  { text: "Kegagalan adalah bumbu yang memberi rasa pada kesuksesan.", author: "Truman Capote" },
  { text: "Orang yang berhenti belajar akan menjadi pemilik masa lalu. Orang yang terus belajar akan menjadi pemilik masa depan.", author: "Mario Teguh" },
  { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", author: "Jim Rohn" },
  { text: "Kamu tidak harus hebat untuk memulai, tapi kamu harus memulai untuk menjadi hebat.", author: "Zig Ziglar" },
  { text: "Investasi terbaik yang bisa kamu lakukan adalah investasi pada dirimu sendiri.", author: "Warren Buffett" },
  { text: "Keberanian bukan berarti tidak takut, tapi tetap maju meskipun takut.", author: "Nelson Mandela" },
  { text: "Waktu terbaik untuk menanam pohon adalah 20 tahun lalu. Waktu terbaik kedua adalah sekarang.", author: "Pepatah Tiongkok" },
  { text: "Jangan menunggu. Waktunya tidak akan pernah tepat.", author: "Napoleon Hill" },
  { text: "Setiap ahli pernah menjadi pemula.", author: "Helen Hayes" },
  { text: "Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras.", author: "Tim Notke" },
  { text: "Semakin banyak kamu berkeringat dalam latihan, semakin sedikit kamu berdarah dalam pertempuran.", author: "Richard Marcinko" },
  { text: "Pendidikan bukan persiapan untuk hidup; pendidikan adalah hidup itu sendiri.", author: "John Dewey" },
  { text: "Rahasia untuk maju adalah memulai.", author: "Mark Twain" },
  { text: "Jangan pernah menyerah. Hal-hal besar membutuhkan waktu.", author: "Anonim" },
  { text: "Ilmu itu lebih baik daripada harta. Ilmu menjaga engkau, sedangkan harta engkau yang menjaganya.", author: "Ali bin Abi Thalib" },
  { text: "Orang yang menginginkan sesuatu akan menemukan jalan. Orang yang tidak, akan menemukan alasan.", author: "Jim Rohn" },
  { text: "Batas kemampuanmu hanyalah batas imajinasimu.", author: "Tony Robbins" },
];

export default function MotivationCarousel() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % QUOTES.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  const quote = QUOTES[index];

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-6">
        <span className="text-xs text-[var(--violet)] font-bold tracking-[0.1em] uppercase">
          Motivasi Harian
        </span>
      </div>
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="text-[var(--text-muted)] text-base leading-relaxed italic m-0 mb-4">
            &ldquo;{quote.text}&rdquo;
          </p>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            — {quote.author}
          </span>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1 mt-6">
          {QUOTES.slice(0, 12).map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setFade(true); }}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i === index % 12 ? "var(--violet)" : "var(--border)",
                transform: i === index % 12 ? "scale(1.4)" : "scale(1)",
              }}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
