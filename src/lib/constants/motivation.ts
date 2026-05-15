/**
 * Motivational quote bank — tone: warm, grounded, action-oriented.
 * Bahasa Indonesia. Pakai untuk: auth panel, landing page, dashboard.
 *
 * Aturan menulis:
 * - Maksimal 14 kata supaya enak dibaca cepat.
 * - Hindari klise berlebihan ("kejarlah mimpi").
 * - Fokus ke aksi nyata (latihan, ulang, perbaiki, naik bertahap).
 * - Tanpa nama orang, tanpa angka palsu — bukan testimoni.
 */

export type Motivation = {
  id: string;
  text: string;
  /** Sub-line opsional sebagai konteks/penegasan singkat. */
  hint?: string;
  /** Aksen warna pakai CSS var token. */
  accent: "blue" | "violet" | "green" | "amber" | "pink" | "teal";
};

export const MOTIVATIONS: Motivation[] = [
  {
    id: "m01",
    text: "Skor naik bukan dari latihan banyak, tapi dari latihan yang tepat sasaran.",
    hint: "Cari satu subtes paling bocor, perbaiki dulu.",
    accent: "blue",
  },
  {
    id: "m02",
    text: "Setiap soal salah hari ini adalah satu peluang naik skor besok.",
    hint: "Review pembahasan lebih penting daripada nambah tryout.",
    accent: "violet",
  },
  {
    id: "m03",
    text: "Konsisten 30 menit setiap hari ngalahin maraton 5 jam sekali seminggu.",
    hint: "Bangun ritme dulu, kecepatan akan menyusul.",
    accent: "green",
  },
  {
    id: "m04",
    text: "Passing grade bukan target akhir — itu garis aman supaya kamu lega.",
    hint: "Kejar lebih, biar tidak tergantung tipisnya selisih.",
    accent: "amber",
  },
  {
    id: "m05",
    text: "Tryout pertama selalu terasa berat. Tryout kelima mulai terasa familiar.",
    hint: "Yang berubah bukan soalnya — tapi kamu yang siap.",
    accent: "pink",
  },
  {
    id: "m06",
    text: "Tahu kelemahan kamu adalah setengah dari skor yang akan kamu dapat.",
    hint: "Analisis dulu, latihan kemudian.",
    accent: "teal",
  },
  {
    id: "m07",
    text: "Jangan ulang full tryout kalau cuma satu subtes yang bocor.",
    hint: "Latihan pendek 15–20 menit sering lebih efektif.",
    accent: "blue",
  },
  {
    id: "m08",
    text: "Pelan tapi benar lebih baik daripada cepat tapi sering revisi jawaban.",
    hint: "Bangun akurasi dulu, baru kejar kecepatan.",
    accent: "violet",
  },
  {
    id: "m09",
    text: "Skor kemarin bukan langit-langit kamu — itu cuma titik mulai hari ini.",
    accent: "green",
  },
  {
    id: "m10",
    text: "Yang bikin lulus bukan jam belajar, tapi keputusan untuk mulai sekarang.",
    accent: "amber",
  },
  {
    id: "m11",
    text: "Soal yang sama akan datang lagi — pastikan kali ini kamu tidak bingung.",
    hint: "Bookmark soal sulit, ulangi sampai otomatis.",
    accent: "pink",
  },
  {
    id: "m12",
    text: "Persaingan CASN ketat, tapi kamu cuma perlu mengalahkan versi kemarin.",
    accent: "teal",
  },
  {
    id: "m13",
    text: "Jangan tunggu mood — tryout-mu hari ini cukup 100 menit lalu kamu tahu posisi.",
    accent: "blue",
  },
  {
    id: "m14",
    text: "TKP itu soal logika kerja, bukan tebakan. Pelajari pola, bukan hafal jawaban.",
    accent: "violet",
  },
];

/** Pilih kutipan harian — deterministic berdasarkan tanggal lokal. */
export function pickDailyMotivation(date: Date = new Date()): Motivation {
  // Hari dalam Julian-day-ish, biar berganti tepat tengah malam lokal.
  const dayKey = Math.floor(
    (date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  const idx = ((dayKey % MOTIVATIONS.length) + MOTIVATIONS.length) % MOTIVATIONS.length;
  return MOTIVATIONS[idx];
}

/** Token warna terpetakan ke CSS variables yang sudah ada di globals.css. */
export function accentColor(accent: Motivation["accent"]): {
  text: string;
  bg: string;
  border: string;
} {
  switch (accent) {
    case "blue":   return { text: "var(--blue)",   bg: "var(--blue-subtle)",   border: "rgba(37,99,235,0.25)" };
    case "violet": return { text: "var(--violet)", bg: "var(--violet-subtle)", border: "rgba(124,58,237,0.25)" };
    case "green":  return { text: "var(--green)",  bg: "var(--green-subtle)",  border: "rgba(34,197,94,0.25)" };
    case "amber":  return { text: "var(--amber)",  bg: "var(--amber-subtle)",  border: "rgba(245,158,11,0.25)" };
    case "pink":   return { text: "var(--pink)",   bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.25)" };
    case "teal":   return { text: "var(--teal)",   bg: "rgba(20,184,166,0.10)",  border: "rgba(20,184,166,0.25)" };
  }
}
