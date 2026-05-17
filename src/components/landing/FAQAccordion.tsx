"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    q: "Apakah NalarUp benar-benar gratis?",
    a: "Ya, semua paket tryout dan fitur utama bisa diakses tanpa biaya. Tidak ada paywall, tidak perlu kartu kredit. Kami percaya akses pendidikan harus terbuka untuk semua.",
  },
  {
    q: "Apakah soalnya mirip dengan CAT BKN asli?",
    a: "Simulasi kami dirancang mengikuti format CAT BKN — timer berjalan, bobot soal sesuai, dan sistem penilaian identik. Soal disusun berdasarkan kisi-kisi resmi SKD CPNS.",
  },
  {
    q: "Berapa kali saya bisa mengulang tryout?",
    a: "Tidak ada batasan. Kamu bisa mengulang tryout sebanyak yang kamu mau. Setiap attempt tersimpan sehingga kamu bisa melihat progres dari waktu ke waktu.",
  },
  {
    q: "Apakah ada pembahasan setelah mengerjakan?",
    a: "Tentu. Setelah submit, kamu bisa melihat pembahasan lengkap untuk setiap soal — termasuk penjelasan mengapa jawaban benar dan mengapa opsi lain salah.",
  },
  {
    q: "Bagaimana cara mengetahui kelemahan saya?",
    a: "Setelah tryout selesai, sistem akan menampilkan breakdown skor per subtes (TWK, TIU, TKP) beserta gap terhadap passing grade. Kamu langsung tahu area mana yang perlu diperbaiki.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Kami hanya menyimpan data yang diperlukan untuk akun dan progres belajar. Password di-hash, dan kami tidak membagikan data pribadi ke pihak ketiga.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQ_DATA.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer bg-transparent border-none"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-[var(--text-primary)] text-[0.95rem] leading-snug">
                {item.q}
              </span>
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isOpen
                    ? "bg-[var(--blue-subtle)] text-[var(--blue)] rotate-180"
                    : "bg-[var(--bg-card2)] text-[var(--text-dim)]"
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-all duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 pt-0 text-[var(--text-muted)] text-[0.88rem] leading-relaxed m-0">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
