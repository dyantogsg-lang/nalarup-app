export const COPY = {
  loading: {
    default: "Menyiapkan latihan kamu...",
    slow: "Koneksi agak lambat. Kami masih mencoba memuat data latihanmu.",
    auth: "Mengecek sesi masuk...",
    catalog: "Memuat paket tryout...",
  },
  empty: {
    catalog: "Paket tryout belum tersedia.",
    catalogSub: "Tim NalarUp sedang menyiapkan paket latihan. Coba lagi nanti.",
    filterResult: "Tidak ada paket yang cocok dengan filter ini.",
    filterResultSub: "Coba hapus beberapa filter atau gunakan kata kunci lain.",
    historyNew:
      "Belum ada riwayat tryout. Mulai tryout pertamamu untuk melihat skor, passing grade, pembahasan, dan rekomendasi latihan berikutnya.",
    historyOnboarded:
      "Kamu sudah siap mulai. Kerjakan satu tryout pertama agar NalarUp bisa membaca kelemahan dan memberi rekomendasi latihan.",
    recommendation:
      "Rekomendasi akan muncul setelah kamu mengerjakan tryout pertama.",
    packageUnavailable: "Paket ini belum tersedia.",
    packageUnavailableSub:
      "Paket mungkin sedang diperbarui atau belum dipublikasikan.",
  },
  cta: {
    startFirstTryout: "Mulai Tryout SKD Pertama",
    viewCatalog: "Lihat Katalog",
    continueTryout: "Lanjutkan Tryout",
    retryTryout: "Ulangi Tryout",
    startTryout: "Mulai Tryout",
    startRecommended: "Mulai Tryout Rekomendasi",
    resetFilter: "Reset filter",
    refresh: "Refresh",
    tryAgain: "Coba lagi",
    backToCatalog: "Kembali ke Katalog",
    reviewWrong: "Bahas soal salah",
    loginAgain: "Masuk lagi",
  },
  session: {
    expired:
      "Sesi kamu sudah berakhir. Masuk lagi untuk melanjutkan latihan.",
  },
  offline: {
    warning:
      "Koneksi terputus. Jawaban tetap disimpan sementara di perangkat ini dan akan dikirim saat koneksi kembali.",
    sync: "Coba sinkronkan",
  },
  activeAttempt: {
    banner:
      "Kamu masih punya tryout yang sedang berjalan. Waktu tetap berjalan sejak kamu mulai.",
  },
  exam: {
    rules: [
      "Timer berjalan setelah kamu mulai.",
      "Jawaban tersimpan otomatis.",
      "Jawaban bisa diubah sebelum submit.",
      "Ujian otomatis submit saat waktu habis.",
      "Pembahasan muncul setelah submit.",
    ],
    readyModal: {
      title: "Siap memulai?",
      warningTimer: "Timer tidak berhenti setelah dimulai.",
      warningConnection: "Pastikan koneksi stabil.",
      cta: "Mulai Sekarang",
    },
  },
  publish: {
    errorQuestionCount:
      "Paket belum bisa dipublish karena jumlah soal belum sesuai.",
    errorUnreviewed: "Ada soal yang belum direview.",
    errorSubtest: "Komposisi subtes belum lengkap.",
  },
} as const;
