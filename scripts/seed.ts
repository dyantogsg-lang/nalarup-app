/**
 * NalarUp seed
 * Phase B — seed categories, topics, 50 soal SKD dummy, 5 paket tryout MVP.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed.ts
 *
 * Idempotent: bersihkan tabel non-user (categories, topics, questions,
 * question_options, tryout_packages, package_subtests, package_questions),
 * lalu insert ulang. Tidak menyentuh profiles / attempts / auth.
 */

import { db } from "../src/lib/db";
import {
  categories,
  topics,
  questions,
  questionOptions,
  tryoutPackages,
  packageSubtests,
  packageQuestions,
} from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

type Subtest = "TWK" | "TIU" | "TKP";
type Difficulty = "easy" | "medium" | "hard";

interface SeedOption {
  label: string;
  text: string;
  isCorrect?: boolean;
  scoreValue?: number; // TKP
}

interface SeedQuestion {
  key: string; // internal key for package mapping
  subtest: Subtest;
  topicSlug: string;
  questionText: string;
  difficulty: Difficulty;
  scoringType: "single_correct" | "weighted_options";
  explanation: string;
  explanationShort?: string;
  options: SeedOption[];
}

interface SeedPackage {
  title: string;
  slug: string;
  description: string;
  mode: "simulation" | "practice";
  durationMinutes: number;
  difficulty: Difficulty;
  passingGrade?: {
    total?: number;
    twk?: number;
    tiu?: number;
    tkp?: number;
  };
  targetSafeScore?: number;
  categorySlug: string;
  showRanking?: boolean;
  subtestComposition: { subtest: Subtest; count: number; passingGrade?: number }[];
  questionKeys: string[];
}

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "skd", name: "SKD", description: "Seleksi Kompetensi Dasar CPNS.", sortOrder: 1 },
  { slug: "twk", name: "TWK", description: "Tes Wawasan Kebangsaan.", sortOrder: 2 },
  { slug: "tiu", name: "TIU", description: "Tes Intelegensia Umum.", sortOrder: 3 },
  { slug: "tkp", name: "TKP", description: "Tes Karakteristik Pribadi.", sortOrder: 4 },
  { slug: "pppk", name: "PPPK", description: "Pegawai Pemerintah dengan Perjanjian Kerja.", sortOrder: 5 },
  { slug: "skb", name: "SKB", description: "Seleksi Kompetensi Bidang.", sortOrder: 6 },
];

// ─── Topics ──────────────────────────────────────────────────────────────────

const TOPICS: { slug: string; name: string; subtest: Subtest; categorySlug: string }[] = [
  // TWK
  { slug: "pancasila", name: "Pancasila", subtest: "TWK", categorySlug: "twk" },
  { slug: "uud-1945", name: "UUD 1945", subtest: "TWK", categorySlug: "twk" },
  { slug: "bhinneka-tunggal-ika", name: "Bhinneka Tunggal Ika", subtest: "TWK", categorySlug: "twk" },
  { slug: "nkri", name: "NKRI", subtest: "TWK", categorySlug: "twk" },
  { slug: "sejarah-indonesia", name: "Sejarah Indonesia", subtest: "TWK", categorySlug: "twk" },
  // TIU
  { slug: "verbal-analogi", name: "Verbal Analogi", subtest: "TIU", categorySlug: "tiu" },
  { slug: "numerik-deret", name: "Numerik Deret", subtest: "TIU", categorySlug: "tiu" },
  { slug: "numerik-aritmatika", name: "Numerik Aritmatika", subtest: "TIU", categorySlug: "tiu" },
  { slug: "logika-silogisme", name: "Logika Silogisme", subtest: "TIU", categorySlug: "tiu" },
  { slug: "figural", name: "Figural", subtest: "TIU", categorySlug: "tiu" },
  // TKP
  { slug: "pelayanan-publik", name: "Pelayanan Publik", subtest: "TKP", categorySlug: "tkp" },
  { slug: "integritas", name: "Integritas", subtest: "TKP", categorySlug: "tkp" },
  { slug: "kerjasama", name: "Kerjasama", subtest: "TKP", categorySlug: "tkp" },
  { slug: "teknologi-informasi", name: "Teknologi Informasi", subtest: "TKP", categorySlug: "tkp" },
  { slug: "jejaring-kerja", name: "Jejaring Kerja", subtest: "TKP", categorySlug: "tkp" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mc = (
  opts: { label: string; text: string; correct?: boolean }[]
): SeedOption[] =>
  opts.map((o) => ({ label: o.label, text: o.text, isCorrect: !!o.correct }));

const tkp = (
  opts: { label: string; text: string; score: 1 | 2 | 3 | 4 | 5 }[]
): SeedOption[] =>
  opts.map((o) => ({ label: o.label, text: o.text, scoreValue: o.score }));

// ─── Questions ───────────────────────────────────────────────────────────────
// 15 TWK, 20 TIU, 15 TKP = 50 soal SKD.

const QUESTIONS: SeedQuestion[] = [
  // ─── TWK (15) ─────────────────────────────────────────────────────────────
  {
    key: "TWK-01",
    subtest: "TWK",
    topicSlug: "pancasila",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Pancasila sebagai dasar negara disahkan pada tanggal ...",
    explanation: "Pancasila disahkan sebagai dasar negara pada 18 Agustus 1945 dalam sidang PPKI, bersamaan dengan pengesahan UUD 1945.",
    explanationShort: "Disahkan PPKI 18 Agustus 1945.",
    options: mc([
      { label: "A", text: "1 Juni 1945" },
      { label: "B", text: "17 Agustus 1945" },
      { label: "C", text: "18 Agustus 1945", correct: true },
      { label: "D", text: "22 Juni 1945" },
      { label: "E", text: "27 Desember 1949" },
    ]),
  },
  {
    key: "TWK-02",
    subtest: "TWK",
    topicSlug: "pancasila",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Sila keempat Pancasila mengandung nilai utama ...",
    explanation: "Sila keempat menekankan kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan — nilai utama: musyawarah untuk mufakat.",
    explanationShort: "Musyawarah mufakat.",
    options: mc([
      { label: "A", text: "Ketuhanan" },
      { label: "B", text: "Kemanusiaan" },
      { label: "C", text: "Persatuan" },
      { label: "D", text: "Musyawarah mufakat", correct: true },
      { label: "E", text: "Keadilan sosial" },
    ]),
  },
  {
    key: "TWK-03",
    subtest: "TWK",
    topicSlug: "uud-1945",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Pasal berapa UUD 1945 yang mengatur tentang bentuk negara Indonesia?",
    explanation: "Pasal 1 ayat (1) UUD 1945 menyatakan Negara Indonesia ialah Negara Kesatuan yang berbentuk Republik.",
    options: mc([
      { label: "A", text: "Pasal 1 ayat (1)", correct: true },
      { label: "B", text: "Pasal 2 ayat (1)" },
      { label: "C", text: "Pasal 3 ayat (1)" },
      { label: "D", text: "Pasal 27 ayat (1)" },
      { label: "E", text: "Pasal 33 ayat (1)" },
    ]),
  },
  {
    key: "TWK-04",
    subtest: "TWK",
    topicSlug: "uud-1945",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Lembaga yang berwenang menguji undang-undang terhadap UUD 1945 adalah ...",
    explanation: "Mahkamah Konstitusi (MK) memiliki kewenangan menguji UU terhadap UUD 1945 berdasarkan Pasal 24C UUD 1945.",
    options: mc([
      { label: "A", text: "Mahkamah Agung" },
      { label: "B", text: "Mahkamah Konstitusi", correct: true },
      { label: "C", text: "Komisi Yudisial" },
      { label: "D", text: "DPR" },
      { label: "E", text: "Presiden" },
    ]),
  },
  {
    key: "TWK-05",
    subtest: "TWK",
    topicSlug: "bhinneka-tunggal-ika",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Semboyan Bhinneka Tunggal Ika terdapat dalam kitab ...",
    explanation: "Semboyan Bhinneka Tunggal Ika berasal dari kitab Sutasoma karya Mpu Tantular pada zaman Majapahit.",
    options: mc([
      { label: "A", text: "Negarakertagama" },
      { label: "B", text: "Sutasoma", correct: true },
      { label: "C", text: "Arjunawiwaha" },
      { label: "D", text: "Ramayana" },
      { label: "E", text: "Pararaton" },
    ]),
  },
  {
    key: "TWK-06",
    subtest: "TWK",
    topicSlug: "bhinneka-tunggal-ika",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Inti makna Bhinneka Tunggal Ika adalah ...",
    explanation: "Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu — mengakui keberagaman dalam persatuan.",
    options: mc([
      { label: "A", text: "Semua sama rata" },
      { label: "B", text: "Berbeda-beda tetapi tetap satu", correct: true },
      { label: "C", text: "Satu untuk semua" },
      { label: "D", text: "Satu jiwa satu tujuan" },
      { label: "E", text: "Bersatu kita teguh" },
    ]),
  },
  {
    key: "TWK-07",
    subtest: "TWK",
    topicSlug: "nkri",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Bentuk negara Indonesia berdasarkan Pasal 1 ayat (1) UUD 1945 adalah ...",
    explanation: "Pasal 1 ayat (1) UUD 1945: Negara Indonesia adalah Negara Kesatuan yang berbentuk Republik.",
    options: mc([
      { label: "A", text: "Negara federal republik" },
      { label: "B", text: "Negara kesatuan republik", correct: true },
      { label: "C", text: "Negara serikat" },
      { label: "D", text: "Negara kerajaan" },
      { label: "E", text: "Negara konfederasi" },
    ]),
  },
  {
    key: "TWK-08",
    subtest: "TWK",
    topicSlug: "nkri",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Salah satu tujuan negara Indonesia yang tercantum dalam Pembukaan UUD 1945 alinea keempat adalah ...",
    explanation: "Pembukaan UUD 1945 alinea 4 menyebutkan empat tujuan negara, salah satunya: memajukan kesejahteraan umum.",
    options: mc([
      { label: "A", text: "Memajukan kesejahteraan umum", correct: true },
      { label: "B", text: "Meningkatkan pertumbuhan ekonomi" },
      { label: "C", text: "Membangun infrastruktur" },
      { label: "D", text: "Memperkuat pertahanan" },
      { label: "E", text: "Menjaga kedaulatan" },
    ]),
  },
  {
    key: "TWK-09",
    subtest: "TWK",
    topicSlug: "sejarah-indonesia",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Proklamator kemerdekaan Republik Indonesia adalah ...",
    explanation: "Teks Proklamasi dibacakan Soekarno didampingi Mohammad Hatta pada 17 Agustus 1945. Keduanya dikenal sebagai dwitunggal proklamator.",
    options: mc([
      { label: "A", text: "Soekarno dan Soeharto" },
      { label: "B", text: "Soekarno dan Mohammad Hatta", correct: true },
      { label: "C", text: "Soekarno dan Sjahrir" },
      { label: "D", text: "Mohammad Hatta dan Sjahrir" },
      { label: "E", text: "Soekarno dan Tan Malaka" },
    ]),
  },
  {
    key: "TWK-10",
    subtest: "TWK",
    topicSlug: "sejarah-indonesia",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Peristiwa Rengasdengklok terjadi pada tanggal ...",
    explanation: "Peristiwa Rengasdengklok terjadi pada 16 Agustus 1945, ketika golongan muda membawa Soekarno-Hatta ke Rengasdengklok untuk mendesak proklamasi.",
    options: mc([
      { label: "A", text: "15 Agustus 1945" },
      { label: "B", text: "16 Agustus 1945", correct: true },
      { label: "C", text: "17 Agustus 1945" },
      { label: "D", text: "18 Agustus 1945" },
      { label: "E", text: "14 Agustus 1945" },
    ]),
  },
  {
    key: "TWK-11",
    subtest: "TWK",
    topicSlug: "pancasila",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Sila kedua Pancasila berbunyi ...",
    explanation: "Sila kedua: Kemanusiaan yang adil dan beradab.",
    options: mc([
      { label: "A", text: "Ketuhanan Yang Maha Esa" },
      { label: "B", text: "Kemanusiaan yang adil dan beradab", correct: true },
      { label: "C", text: "Persatuan Indonesia" },
      { label: "D", text: "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan" },
      { label: "E", text: "Keadilan sosial bagi seluruh rakyat Indonesia" },
    ]),
  },
  {
    key: "TWK-12",
    subtest: "TWK",
    topicSlug: "uud-1945",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Amandemen UUD 1945 telah dilakukan sebanyak ...",
    explanation: "UUD 1945 telah diamandemen sebanyak empat kali pada tahun 1999, 2000, 2001, dan 2002.",
    options: mc([
      { label: "A", text: "Dua kali" },
      { label: "B", text: "Tiga kali" },
      { label: "C", text: "Empat kali", correct: true },
      { label: "D", text: "Lima kali" },
      { label: "E", text: "Enam kali" },
    ]),
  },
  {
    key: "TWK-13",
    subtest: "TWK",
    topicSlug: "nkri",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Bahasa persatuan Indonesia diresmikan melalui ...",
    explanation: "Bahasa Indonesia diangkat sebagai bahasa persatuan dalam Sumpah Pemuda 28 Oktober 1928.",
    options: mc([
      { label: "A", text: "Proklamasi 1945" },
      { label: "B", text: "Sumpah Pemuda 1928", correct: true },
      { label: "C", text: "Kongres Bahasa 1938" },
      { label: "D", text: "Budi Utomo 1908" },
      { label: "E", text: "Kongres Pemuda I 1926" },
    ]),
  },
  {
    key: "TWK-14",
    subtest: "TWK",
    topicSlug: "bhinneka-tunggal-ika",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Bhinneka Tunggal Ika dicantumkan sebagai semboyan negara pada lambang Garuda Pancasila. Kalimat lengkapnya dalam kitab Sutasoma adalah ...",
    explanation: "Kalimat lengkapnya: 'Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa' yang berarti berbeda-beda tetap satu, tak ada kebenaran yang mendua.",
    options: mc([
      { label: "A", text: "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa", correct: true },
      { label: "B", text: "Tut Wuri Handayani" },
      { label: "C", text: "Rawe-rawe Rantas Malang-malang Putung" },
      { label: "D", text: "Jer Basuki Mawa Beya" },
      { label: "E", text: "Sutasoma Purwa" },
    ]),
  },
  {
    key: "TWK-15",
    subtest: "TWK",
    topicSlug: "sejarah-indonesia",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "BPUPKI dibentuk oleh pemerintah pendudukan Jepang pada tahun ...",
    explanation: "BPUPKI (Dokuritsu Junbi Cosakai) dibentuk pada 1 Maret 1945 dan diresmikan 29 April 1945.",
    options: mc([
      { label: "A", text: "1942" },
      { label: "B", text: "1943" },
      { label: "C", text: "1944" },
      { label: "D", text: "1945", correct: true },
      { label: "E", text: "1946" },
    ]),
  },

  // ─── TIU (20) ─────────────────────────────────────────────────────────────
  {
    key: "TIU-01",
    subtest: "TIU",
    topicSlug: "verbal-analogi",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "DOKTER : RUMAH SAKIT = GURU : ...",
    explanation: "Dokter bekerja di rumah sakit; guru bekerja di sekolah. Analoginya tempat kerja.",
    options: mc([
      { label: "A", text: "Buku" },
      { label: "B", text: "Sekolah", correct: true },
      { label: "C", text: "Murid" },
      { label: "D", text: "Pelajaran" },
      { label: "E", text: "Kantor" },
    ]),
  },
  {
    key: "TIU-02",
    subtest: "TIU",
    topicSlug: "verbal-analogi",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "KOMPOR : API = ... : ...",
    explanation: "Kompor menghasilkan api. Pilih pasangan dengan relasi 'menghasilkan'. Lampu menghasilkan cahaya.",
    options: mc([
      { label: "A", text: "Lampu : Cahaya", correct: true },
      { label: "B", text: "Piring : Makan" },
      { label: "C", text: "Sepatu : Kaki" },
      { label: "D", text: "Buku : Tulisan" },
      { label: "E", text: "Mobil : Ban" },
    ]),
  },
  {
    key: "TIU-03",
    subtest: "TIU",
    topicSlug: "numerik-deret",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Lanjutan deret: 2, 4, 6, 8, 10, ...",
    explanation: "Deret aritmatika dengan beda 2. Suku berikutnya = 10 + 2 = 12.",
    options: mc([
      { label: "A", text: "11" },
      { label: "B", text: "12", correct: true },
      { label: "C", text: "13" },
      { label: "D", text: "14" },
      { label: "E", text: "16" },
    ]),
  },
  {
    key: "TIU-04",
    subtest: "TIU",
    topicSlug: "numerik-deret",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Lanjutan deret: 3, 6, 12, 24, 48, ...",
    explanation: "Setiap suku dikalikan 2. 48 × 2 = 96.",
    options: mc([
      { label: "A", text: "72" },
      { label: "B", text: "84" },
      { label: "C", text: "96", correct: true },
      { label: "D", text: "100" },
      { label: "E", text: "108" },
    ]),
  },
  {
    key: "TIU-05",
    subtest: "TIU",
    topicSlug: "numerik-deret",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Lanjutan deret: 1, 1, 2, 3, 5, 8, 13, ...",
    explanation: "Deret Fibonacci — suku berikutnya = jumlah dua suku sebelumnya. 8 + 13 = 21.",
    options: mc([
      { label: "A", text: "18" },
      { label: "B", text: "19" },
      { label: "C", text: "20" },
      { label: "D", text: "21", correct: true },
      { label: "E", text: "22" },
    ]),
  },
  {
    key: "TIU-06",
    subtest: "TIU",
    topicSlug: "numerik-aritmatika",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Jika 3x + 5 = 20, maka nilai x adalah ...",
    explanation: "3x + 5 = 20 → 3x = 15 → x = 5.",
    options: mc([
      { label: "A", text: "3" },
      { label: "B", text: "4" },
      { label: "C", text: "5", correct: true },
      { label: "D", text: "6" },
      { label: "E", text: "7" },
    ]),
  },
  {
    key: "TIU-07",
    subtest: "TIU",
    topicSlug: "numerik-aritmatika",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Sebuah barang dijual dengan diskon 20% menjadi Rp80.000. Harga semula barang tersebut adalah ...",
    explanation: "Harga jual = 80% × harga semula. 80.000 / 0.8 = 100.000.",
    options: mc([
      { label: "A", text: "Rp96.000" },
      { label: "B", text: "Rp100.000", correct: true },
      { label: "C", text: "Rp110.000" },
      { label: "D", text: "Rp120.000" },
      { label: "E", text: "Rp125.000" },
    ]),
  },
  {
    key: "TIU-08",
    subtest: "TIU",
    topicSlug: "numerik-aritmatika",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Rata-rata dari 5 bilangan adalah 12. Jika ditambah satu bilangan baru, rata-ratanya menjadi 13. Bilangan yang ditambahkan adalah ...",
    explanation: "Total 5 bilangan = 60. Total 6 bilangan = 13 × 6 = 78. Bilangan baru = 78 - 60 = 18.",
    options: mc([
      { label: "A", text: "14" },
      { label: "B", text: "16" },
      { label: "C", text: "18", correct: true },
      { label: "D", text: "20" },
      { label: "E", text: "22" },
    ]),
  },
  {
    key: "TIU-09",
    subtest: "TIU",
    topicSlug: "numerik-aritmatika",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Sebuah mobil menempuh jarak 180 km dalam 3 jam. Kecepatan rata-ratanya adalah ...",
    explanation: "Kecepatan = jarak / waktu = 180 / 3 = 60 km/jam.",
    options: mc([
      { label: "A", text: "50 km/jam" },
      { label: "B", text: "55 km/jam" },
      { label: "C", text: "60 km/jam", correct: true },
      { label: "D", text: "65 km/jam" },
      { label: "E", text: "70 km/jam" },
    ]),
  },
  {
    key: "TIU-10",
    subtest: "TIU",
    topicSlug: "logika-silogisme",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Semua mahasiswa rajin belajar. Budi adalah mahasiswa. Kesimpulannya ...",
    explanation: "Silogisme kategoris: semua M adalah P, S adalah M, maka S adalah P. Budi rajin belajar.",
    options: mc([
      { label: "A", text: "Budi mungkin rajin belajar" },
      { label: "B", text: "Budi rajin belajar", correct: true },
      { label: "C", text: "Budi pandai" },
      { label: "D", text: "Budi lulus" },
      { label: "E", text: "Tidak dapat disimpulkan" },
    ]),
  },
  {
    key: "TIU-11",
    subtest: "TIU",
    topicSlug: "logika-silogisme",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Jika hujan, jalan basah. Saat ini jalan tidak basah. Kesimpulannya ...",
    explanation: "Modus tollens: p → q, ¬q, maka ¬p. Tidak hujan.",
    options: mc([
      { label: "A", text: "Hujan" },
      { label: "B", text: "Tidak hujan", correct: true },
      { label: "C", text: "Mungkin hujan" },
      { label: "D", text: "Jalan kering" },
      { label: "E", text: "Tidak dapat disimpulkan" },
    ]),
  },
  {
    key: "TIU-12",
    subtest: "TIU",
    topicSlug: "verbal-analogi",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "PADI : BERAS = TEBU : ...",
    explanation: "Padi diolah menjadi beras; tebu diolah menjadi gula.",
    options: mc([
      { label: "A", text: "Manis" },
      { label: "B", text: "Gula", correct: true },
      { label: "C", text: "Batang" },
      { label: "D", text: "Sawah" },
      { label: "E", text: "Pabrik" },
    ]),
  },
  {
    key: "TIU-13",
    subtest: "TIU",
    topicSlug: "numerik-deret",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Lanjutan deret: 100, 95, 85, 70, 50, ...",
    explanation: "Selisih antar suku: 5, 10, 15, 20, 25 (kelipatan 5). Suku berikutnya = 50 - 25 = 25.",
    options: mc([
      { label: "A", text: "25", correct: true },
      { label: "B", text: "30" },
      { label: "C", text: "35" },
      { label: "D", text: "40" },
      { label: "E", text: "45" },
    ]),
  },
  {
    key: "TIU-14",
    subtest: "TIU",
    topicSlug: "figural",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Manakah pola yang tidak sejenis: lingkaran, segitiga, persegi, kubus, trapesium?",
    explanation: "Kubus adalah bangun ruang 3D; lainnya adalah bangun datar 2D.",
    options: mc([
      { label: "A", text: "Lingkaran" },
      { label: "B", text: "Segitiga" },
      { label: "C", text: "Persegi" },
      { label: "D", text: "Kubus", correct: true },
      { label: "E", text: "Trapesium" },
    ]),
  },
  {
    key: "TIU-15",
    subtest: "TIU",
    topicSlug: "figural",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Sebuah kubus memiliki berapa rusuk?",
    explanation: "Kubus memiliki 12 rusuk, 8 titik sudut, dan 6 sisi.",
    options: mc([
      { label: "A", text: "6" },
      { label: "B", text: "8" },
      { label: "C", text: "10" },
      { label: "D", text: "12", correct: true },
      { label: "E", text: "14" },
    ]),
  },
  {
    key: "TIU-16",
    subtest: "TIU",
    topicSlug: "numerik-aritmatika",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Perbandingan umur A dan B adalah 3 : 5. Jika selisih umur mereka 10 tahun, maka umur A adalah ...",
    explanation: "Selisih rasio = 5 - 3 = 2 bagian = 10 tahun → 1 bagian = 5 tahun. Umur A = 3 × 5 = 15.",
    options: mc([
      { label: "A", text: "10" },
      { label: "B", text: "12" },
      { label: "C", text: "15", correct: true },
      { label: "D", text: "18" },
      { label: "E", text: "20" },
    ]),
  },
  {
    key: "TIU-17",
    subtest: "TIU",
    topicSlug: "verbal-analogi",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Sinonim dari kata AKURAT adalah ...",
    explanation: "Akurat berarti teliti, tepat, saksama.",
    options: mc([
      { label: "A", text: "Cepat" },
      { label: "B", text: "Tepat", correct: true },
      { label: "C", text: "Lambat" },
      { label: "D", text: "Salah" },
      { label: "E", text: "Kira-kira" },
    ]),
  },
  {
    key: "TIU-18",
    subtest: "TIU",
    topicSlug: "verbal-analogi",
    difficulty: "easy",
    scoringType: "single_correct",
    questionText: "Antonim dari kata EFISIEN adalah ...",
    explanation: "Efisien = tepat/hemat; antonimnya boros.",
    options: mc([
      { label: "A", text: "Hemat" },
      { label: "B", text: "Boros", correct: true },
      { label: "C", text: "Mewah" },
      { label: "D", text: "Cepat" },
      { label: "E", text: "Teratur" },
    ]),
  },
  {
    key: "TIU-19",
    subtest: "TIU",
    topicSlug: "logika-silogisme",
    difficulty: "medium",
    scoringType: "single_correct",
    questionText: "Semua dokter adalah lulusan kedokteran. Sebagian lulusan kedokteran bekerja di rumah sakit. Kesimpulan yang pasti benar ...",
    explanation: "Dari premis, kita tidak bisa memastikan semua dokter bekerja di rumah sakit; hanya tahu semua dokter adalah lulusan kedokteran. Maka kesimpulan pasti: sebagian lulusan kedokteran adalah dokter.",
    options: mc([
      { label: "A", text: "Semua dokter bekerja di rumah sakit" },
      { label: "B", text: "Sebagian lulusan kedokteran adalah dokter", correct: true },
      { label: "C", text: "Semua lulusan kedokteran bekerja di rumah sakit" },
      { label: "D", text: "Tidak ada dokter di rumah sakit" },
      { label: "E", text: "Tidak dapat disimpulkan" },
    ]),
  },
  {
    key: "TIU-20",
    subtest: "TIU",
    topicSlug: "numerik-aritmatika",
    difficulty: "hard",
    scoringType: "single_correct",
    questionText: "Luas persegi panjang 120 cm². Jika panjangnya 15 cm, berapa kelilingnya?",
    explanation: "Lebar = 120 / 15 = 8 cm. Keliling = 2(p + l) = 2(15 + 8) = 46 cm.",
    options: mc([
      { label: "A", text: "38 cm" },
      { label: "B", text: "40 cm" },
      { label: "C", text: "46 cm", correct: true },
      { label: "D", text: "52 cm" },
      { label: "E", text: "60 cm" },
    ]),
  },

  // ─── TKP (15) ─────────────────────────────────────────────────────────────
  {
    key: "TKP-01",
    subtest: "TKP",
    topicSlug: "pelayanan-publik",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Di tempat kerja saya, ada pengunjung yang tampak kebingungan mencari ruangan. Saya sedang dalam perjalanan ke meeting penting. Sikap saya ...",
    explanation:
      "Orientasi pelayanan publik: bantu dulu secara ringkas lalu lanjutkan tugas. Mengabaikan sepenuhnya menurunkan skor.",
    explanationShort: "Bantu singkat, lanjutkan tugas.",
    options: tkp([
      { label: "A", text: "Mengabaikannya karena saya sedang terburu-buru", score: 1 },
      { label: "B", text: "Melirik sebentar lalu berjalan terus", score: 2 },
      { label: "C", text: "Menunjuk arah sekilas dan pergi", score: 3 },
      { label: "D", text: "Menghentikan langkah sebentar, menanyakan tujuannya, lalu memberi arah jelas", score: 5 },
      { label: "E", text: "Mengantarnya ke ruangan meskipun saya sangat terlambat meeting", score: 4 },
    ]),
  },
  {
    key: "TKP-02",
    subtest: "TKP",
    topicSlug: "pelayanan-publik",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Seorang warga datang ke kantor dan marah karena berkasnya lama diproses. Sikap saya sebagai petugas ...",
    explanation: "Pelayanan publik: dengarkan keluhan dengan tenang, beri penjelasan, bantu cari solusi.",
    options: tkp([
      { label: "A", text: "Membentak balik karena saya tidak bersalah", score: 1 },
      { label: "B", text: "Mengabaikannya dan melanjutkan pekerjaan", score: 2 },
      { label: "C", text: "Menyuruh dia menunggu tanpa penjelasan", score: 3 },
      { label: "D", text: "Mendengarkan keluhannya, meminta maaf, lalu memeriksa status berkasnya", score: 5 },
      { label: "E", text: "Menjelaskan prosedur sambil tetap memproses", score: 4 },
    ]),
  },
  {
    key: "TKP-03",
    subtest: "TKP",
    topicSlug: "integritas",
    difficulty: "hard",
    scoringType: "weighted_options",
    questionText:
      "Atasan Anda meminta Anda menandatangani dokumen yang Anda yakini tidak sesuai prosedur. Sikap Anda ...",
    explanation: "Integritas: jangan langsung menandatangani; konfirmasi dulu, jelaskan kekhawatiran, cari jalur formal bila perlu.",
    options: tkp([
      { label: "A", text: "Langsung menandatangani karena itu perintah atasan", score: 1 },
      { label: "B", text: "Menandatangani sambil mengeluh kepada rekan kerja", score: 2 },
      { label: "C", text: "Menolak tanpa memberi alasan", score: 3 },
      { label: "D", text: "Menandatangani dulu, baru mempelajari setelahnya", score: 2 },
      { label: "E", text: "Menyampaikan kekhawatiran dan menanyakan dasar hukumnya sebelum mengambil keputusan", score: 5 },
    ]),
  },
  {
    key: "TKP-04",
    subtest: "TKP",
    topicSlug: "integritas",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Anda menemukan rekan kerja melakukan kecurangan kecil dalam laporan. Sikap Anda ...",
    explanation: "Integritas: jangan diamkan, tetapi hindari langsung lapor ke pimpinan tanpa bicara lebih dulu. Ajak bicara dulu; bila tidak diperbaiki, eskalasi.",
    options: tkp([
      { label: "A", text: "Mendiamkan karena bukan urusan saya", score: 1 },
      { label: "B", text: "Ikut melakukan agar kompak", score: 1 },
      { label: "C", text: "Langsung melaporkan ke atasan tanpa berbicara dengannya", score: 3 },
      { label: "D", text: "Menegur secara baik-baik dan meminta dia memperbaikinya", score: 5 },
      { label: "E", text: "Menceritakan ke rekan lain agar dia malu", score: 2 },
    ]),
  },
  {
    key: "TKP-05",
    subtest: "TKP",
    topicSlug: "kerjasama",
    difficulty: "easy",
    scoringType: "weighted_options",
    questionText:
      "Dalam tim proyek, ada anggota yang kurang berkontribusi. Sikap Anda sebagai anggota tim ...",
    explanation: "Kerjasama: pendekatan dulu, tanyakan kendala, tawarkan bantuan — bukan mengambil alih semua tugas.",
    options: tkp([
      { label: "A", text: "Mengerjakan sendiri semua tugasnya", score: 2 },
      { label: "B", text: "Mengeluh ke atasan langsung", score: 2 },
      { label: "C", text: "Mengabaikan dan mengerjakan bagian saya saja", score: 1 },
      { label: "D", text: "Mengajaknya bicara, menanyakan kendala, lalu membagi ulang tugas secara adil", score: 5 },
      { label: "E", text: "Menegur dia di depan tim", score: 3 },
    ]),
  },
  {
    key: "TKP-06",
    subtest: "TKP",
    topicSlug: "kerjasama",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Anda diminta memimpin tim baru dengan anggota dari berbagai latar belakang. Langkah pertama Anda ...",
    explanation: "Kepemimpinan efektif: kenali anggota dan keahlian masing-masing sebelum membagi tugas.",
    options: tkp([
      { label: "A", text: "Langsung membagi tugas berdasarkan jabatan", score: 2 },
      { label: "B", text: "Menunggu anggota menawarkan diri", score: 1 },
      { label: "C", text: "Mengadakan pertemuan perkenalan dan memetakan keahlian tiap anggota", score: 5 },
      { label: "D", text: "Mengerjakan sebagian besar sendiri untuk memberi contoh", score: 2 },
      { label: "E", text: "Memberi tugas yang sama besar ke semua anggota", score: 3 },
    ]),
  },
  {
    key: "TKP-07",
    subtest: "TKP",
    topicSlug: "teknologi-informasi",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Kantor Anda memperkenalkan aplikasi kerja baru. Sikap Anda ...",
    explanation: "Kemampuan beradaptasi terhadap teknologi: coba pelajari aktif, bukan menolak atau menunggu pasif.",
    options: tkp([
      { label: "A", text: "Menolak karena terbiasa dengan cara lama", score: 1 },
      { label: "B", text: "Menunggu dipaksa barulah menggunakan", score: 2 },
      { label: "C", text: "Menggunakan seadanya tanpa eksplorasi", score: 3 },
      { label: "D", text: "Mempelajari tutorial dan mencoba fitur-fiturnya secara mandiri", score: 5 },
      { label: "E", text: "Meminta teman mengerjakan bagian saya", score: 2 },
    ]),
  },
  {
    key: "TKP-08",
    subtest: "TKP",
    topicSlug: "teknologi-informasi",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Saat bekerja, Anda menemukan cara baru yang lebih efisien untuk menyelesaikan laporan rutin. Sikap Anda ...",
    explanation: "Inisiatif dan knowledge sharing: uji dulu, dokumentasikan, lalu bagikan ke tim setelah yakin hasilnya baik.",
    options: tkp([
      { label: "A", text: "Menggunakannya sendiri tanpa memberi tahu rekan", score: 2 },
      { label: "B", text: "Mengabaikannya dan tetap pakai cara lama", score: 1 },
      { label: "C", text: "Menyampaikan ke atasan tanpa menguji dulu", score: 3 },
      { label: "D", text: "Menguji cara baru tersebut, mendokumentasikan, lalu membagikan ke tim", score: 5 },
      { label: "E", text: "Menjadikannya rahasia pribadi demi reputasi", score: 1 },
    ]),
  },
  {
    key: "TKP-09",
    subtest: "TKP",
    topicSlug: "jejaring-kerja",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Anda diminta berkolaborasi dengan instansi lain yang budayanya berbeda. Sikap Anda ...",
    explanation: "Jejaring kerja: pelajari budaya mitra, bangun komunikasi terbuka, cari titik temu.",
    options: tkp([
      { label: "A", text: "Memaksakan cara kerja instansi saya", score: 1 },
      { label: "B", text: "Menolak kolaborasi karena sulit", score: 1 },
      { label: "C", text: "Menjalani saja tanpa inisiatif", score: 3 },
      { label: "D", text: "Mempelajari gaya kerja mereka dan menyesuaikan pendekatan komunikasi", score: 5 },
      { label: "E", text: "Meminta atasan turun tangan sejak awal", score: 2 },
    ]),
  },
  {
    key: "TKP-10",
    subtest: "TKP",
    topicSlug: "jejaring-kerja",
    difficulty: "easy",
    scoringType: "weighted_options",
    questionText:
      "Dalam sebuah rapat lintas bagian, pendapat Anda tidak diterima. Sikap Anda ...",
    explanation: "Jejaring kerja & emosi: terima keputusan, evaluasi alasan, tetap dukung hasil rapat tanpa mengeluh.",
    options: tkp([
      { label: "A", text: "Kecewa dan tidak mau ikut rapat lagi", score: 1 },
      { label: "B", text: "Menyimpan kekesalan dalam hati", score: 2 },
      { label: "C", text: "Mencoba memahami alasan penolakan dan tetap mendukung hasil rapat", score: 5 },
      { label: "D", text: "Memaksakan pendapat saya lain waktu dengan lebih keras", score: 2 },
      { label: "E", text: "Meminta penjelasan secara personal setelah rapat", score: 4 },
    ]),
  },
  {
    key: "TKP-11",
    subtest: "TKP",
    topicSlug: "pelayanan-publik",
    difficulty: "hard",
    scoringType: "weighted_options",
    questionText:
      "Pada akhir jam kerja, datang pemohon yang belum terlayani. Sikap Anda ...",
    explanation: "Pelayanan publik prima: layani sebisa mungkin hari ini; minimal pastikan dia tidak kembali sia-sia.",
    options: tkp([
      { label: "A", text: "Menyuruhnya datang besok", score: 2 },
      { label: "B", text: "Mengabaikannya karena sudah jam pulang", score: 1 },
      { label: "C", text: "Melayaninya meski harus sedikit lembur", score: 5 },
      { label: "D", text: "Meminta rekan yang masih tinggal untuk menangani", score: 3 },
      { label: "E", text: "Memberi nomor antrean untuk besok tanpa penjelasan", score: 2 },
    ]),
  },
  {
    key: "TKP-12",
    subtest: "TKP",
    topicSlug: "integritas",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Seorang kenalan meminta Anda mempercepat proses administrasinya dengan iming-iming hadiah. Sikap Anda ...",
    explanation: "Integritas: tolak hadiah tegas namun sopan, jelaskan prosedur, perlakukan sama seperti warga lain.",
    options: tkp([
      { label: "A", text: "Menerima karena dia kenalan", score: 1 },
      { label: "B", text: "Menolak hadiah dan menjelaskan prosedur standar", score: 5 },
      { label: "C", text: "Menerima hadiah tapi tidak mempercepat", score: 1 },
      { label: "D", text: "Pura-pura tidak dengar", score: 2 },
      { label: "E", text: "Melaporkan dia ke atasan langsung tanpa teguran", score: 3 },
    ]),
  },
  {
    key: "TKP-13",
    subtest: "TKP",
    topicSlug: "kerjasama",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Dalam rapat tim, ide Anda ditolak. Sikap Anda ...",
    explanation: "Kerjasama dewasa: terima kritik, kaji ulang, tetap kontribusi pada ide yang diterima.",
    options: tkp([
      { label: "A", text: "Keluar rapat dengan kesal", score: 1 },
      { label: "B", text: "Menyimpan dendam", score: 1 },
      { label: "C", text: "Menerima keputusan dan mendukung ide yang terpilih", score: 5 },
      { label: "D", text: "Mengkritik ide pemenang agar terlihat kurang baik", score: 2 },
      { label: "E", text: "Menanyakan alasan penolakan dengan sopan", score: 4 },
    ]),
  },
  {
    key: "TKP-14",
    subtest: "TKP",
    topicSlug: "teknologi-informasi",
    difficulty: "hard",
    scoringType: "weighted_options",
    questionText:
      "Komputer kerja Anda terkena serangan virus. Tindakan pertama Anda ...",
    explanation: "Respons insiden TI: segera laporkan ke unit TI, jangan mematikan sembarangan yang bisa menghilangkan log, jangan lanjutkan pakai seolah-olah normal.",
    options: tkp([
      { label: "A", text: "Mematikan komputer tanpa melapor", score: 2 },
      { label: "B", text: "Mengabaikan dan tetap bekerja", score: 1 },
      { label: "C", text: "Menghubungi tim TI dan mengikuti prosedur penanganan", score: 5 },
      { label: "D", text: "Mencoba menghapus virus sendiri", score: 3 },
      { label: "E", text: "Bertanya ke rekan apakah mereka mengalami hal serupa", score: 3 },
    ]),
  },
  {
    key: "TKP-15",
    subtest: "TKP",
    topicSlug: "jejaring-kerja",
    difficulty: "medium",
    scoringType: "weighted_options",
    questionText:
      "Anda diundang menjadi narasumber di acara instansi lain yang tidak berhubungan langsung dengan unit kerja Anda. Sikap Anda ...",
    explanation: "Jejaring kerja: hadiri setelah meminta izin atasan; ini kesempatan membangun relasi dan reputasi.",
    options: tkp([
      { label: "A", text: "Menolak karena bukan bidang unit saya", score: 2 },
      { label: "B", text: "Menerima tanpa memberi tahu atasan", score: 2 },
      { label: "C", text: "Menerima setelah berkoordinasi dengan atasan dan menyiapkan materi dengan baik", score: 5 },
      { label: "D", text: "Menerima tapi menyuruh orang lain mewakili", score: 2 },
      { label: "E", text: "Menerima hanya jika ada honor", score: 1 },
    ]),
  },
];

// ─── Packages ────────────────────────────────────────────────────────────────

const PACKAGES: SeedPackage[] = [
  {
    title: "SKD CPNS — Paket Perdana",
    slug: "skd-cpns-paket-perdana",
    description:
      "Paket perkenalan SKD CPNS. 30 soal: TWK 10, TIU 10, TKP 10. Durasi 30 menit. Cocok untuk mengukur kemampuan awal sebelum masuk simulasi penuh.",
    mode: "simulation",
    durationMinutes: 30,
    difficulty: "easy",
    passingGrade: { total: 65, twk: 20, tiu: 25, tkp: 30 },
    targetSafeScore: 85,
    categorySlug: "skd",
    showRanking: true,
    subtestComposition: [
      { subtest: "TWK", count: 10, passingGrade: 20 },
      { subtest: "TIU", count: 10, passingGrade: 25 },
      { subtest: "TKP", count: 10, passingGrade: 30 },
    ],
    questionKeys: [
      "TWK-01", "TWK-02", "TWK-03", "TWK-04", "TWK-05",
      "TWK-06", "TWK-07", "TWK-08", "TWK-09", "TWK-10",
      "TIU-01", "TIU-02", "TIU-03", "TIU-04", "TIU-05",
      "TIU-06", "TIU-07", "TIU-08", "TIU-09", "TIU-10",
      "TKP-01", "TKP-02", "TKP-03", "TKP-04", "TKP-05",
      "TKP-06", "TKP-07", "TKP-08", "TKP-09", "TKP-10",
    ],
  },
  {
    title: "TWK Fokus Nasionalisme",
    slug: "twk-fokus-nasionalisme",
    description:
      "Latihan TWK fokus Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, dan Sejarah Indonesia. 15 soal, durasi 15 menit. Mode practice untuk memperdalam materi.",
    mode: "practice",
    durationMinutes: 15,
    difficulty: "medium",
    categorySlug: "twk",
    subtestComposition: [{ subtest: "TWK", count: 15 }],
    questionKeys: [
      "TWK-01", "TWK-02", "TWK-03", "TWK-04", "TWK-05",
      "TWK-06", "TWK-07", "TWK-08", "TWK-09", "TWK-10",
      "TWK-11", "TWK-12", "TWK-13", "TWK-14", "TWK-15",
    ],
  },
  {
    title: "TIU Logika Dasar",
    slug: "tiu-logika-dasar",
    description:
      "Latihan TIU fokus analogi verbal, deret numerik, aritmatika, silogisme, dan figural. 15 soal, durasi 20 menit.",
    mode: "practice",
    durationMinutes: 20,
    difficulty: "medium",
    categorySlug: "tiu",
    subtestComposition: [{ subtest: "TIU", count: 15 }],
    questionKeys: [
      "TIU-01", "TIU-02", "TIU-03", "TIU-04", "TIU-05",
      "TIU-06", "TIU-07", "TIU-08", "TIU-09", "TIU-10",
      "TIU-11", "TIU-12", "TIU-13", "TIU-14", "TIU-15",
    ],
  },
  {
    title: "TKP Pelayanan Publik",
    slug: "tkp-pelayanan-publik",
    description:
      "Latihan TKP seputar pelayanan publik, integritas, kerjasama, teknologi informasi, dan jejaring kerja. 15 soal, durasi 20 menit. Scoring berbobot 1-5.",
    mode: "practice",
    durationMinutes: 20,
    difficulty: "medium",
    categorySlug: "tkp",
    subtestComposition: [{ subtest: "TKP", count: 15 }],
    questionKeys: [
      "TKP-01", "TKP-02", "TKP-03", "TKP-04", "TKP-05",
      "TKP-06", "TKP-07", "TKP-08", "TKP-09", "TKP-10",
      "TKP-11", "TKP-12", "TKP-13", "TKP-14", "TKP-15",
    ],
  },
  {
    title: "Simulasi SKD Full",
    slug: "simulasi-skd-full",
    description:
      "Simulasi SKD lengkap 50 soal (TWK 15, TIU 20, TKP 15). Durasi 60 menit dengan passing grade CPNS. Disediakan sebagai pendekatan ujian sesungguhnya.",
    mode: "simulation",
    durationMinutes: 60,
    difficulty: "hard",
    passingGrade: { total: 311, twk: 65, tiu: 80, tkp: 166 },
    targetSafeScore: 430,
    categorySlug: "skd",
    showRanking: true,
    subtestComposition: [
      { subtest: "TWK", count: 15, passingGrade: 65 },
      { subtest: "TIU", count: 20, passingGrade: 80 },
      { subtest: "TKP", count: 15, passingGrade: 166 },
    ],
    questionKeys: [
      ...Array.from({ length: 15 }, (_, i) => `TWK-${String(i + 1).padStart(2, "0")}`),
      ...Array.from({ length: 20 }, (_, i) => `TIU-${String(i + 1).padStart(2, "0")}`),
      ...Array.from({ length: 15 }, (_, i) => `TKP-${String(i + 1).padStart(2, "0")}`),
    ],
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("▶ NalarUp seed started");

  // 1. Reset content tables (TRUNCATE CASCADE, aman terhadap profiles/attempts)
  console.log("  · resetting content tables …");
  await db.execute(sql`
    TRUNCATE TABLE
      package_questions,
      package_subtests,
      question_options,
      questions,
      topics,
      tryout_packages,
      categories
    RESTART IDENTITY CASCADE
  `);

  // 2. Categories
  console.log("  · seeding categories …");
  const catRows = await db
    .insert(categories)
    .values(CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
    })))
    .returning();
  const catBySlug = new Map(catRows.map((c) => [c.slug, c]));
  console.log(`    ✓ ${catRows.length} categories`);

  // 3. Topics
  console.log("  · seeding topics …");
  const topicRows = await db
    .insert(topics)
    .values(
      TOPICS.map((t) => ({
        name: t.name,
        slug: t.slug,
        subtest: t.subtest,
        categoryId: catBySlug.get(t.categorySlug)!.id,
      }))
    )
    .returning();
  const topicBySlug = new Map(topicRows.map((t) => [t.slug, t]));
  console.log(`    ✓ ${topicRows.length} topics`);

  // 4. Questions + options
  console.log("  · seeding questions + options …");
  const questionBySeedKey = new Map<string, string>(); // key -> id
  for (const q of QUESTIONS) {
    const topic = topicBySlug.get(q.topicSlug);
    if (!topic) throw new Error(`topic ${q.topicSlug} missing`);
    const catSlug = q.subtest.toLowerCase();
    const cat = catBySlug.get(catSlug);

    const [row] = await db
      .insert(questions)
      .values({
        categoryId: cat?.id ?? null,
        topicId: topic.id,
        subtest: q.subtest,
        questionText: q.questionText,
        questionType: "single_choice",
        scoringType: q.scoringType,
        difficulty: q.difficulty,
        explanation: q.explanation,
        explanationShort: q.explanationShort ?? null,
        status: "published",
      })
      .returning();

    questionBySeedKey.set(q.key, row.id);

    await db.insert(questionOptions).values(
      q.options.map((o, idx) => ({
        questionId: row.id,
        optionLabel: o.label,
        optionText: o.text,
        isCorrect: !!o.isCorrect,
        scoreValue: o.scoreValue ?? (o.isCorrect ? 5 : 0),
        sortOrder: idx,
      }))
    );
  }
  console.log(`    ✓ ${QUESTIONS.length} questions`);

  // 5. Packages + subtests + package_questions
  console.log("  · seeding packages …");
  for (const pkg of PACKAGES) {
    const cat = catBySlug.get(pkg.categorySlug);
    if (!cat) throw new Error(`category ${pkg.categorySlug} missing`);
    if (pkg.questionKeys.length !== pkg.subtestComposition.reduce((s, x) => s + x.count, 0)) {
      throw new Error(
        `${pkg.slug}: total questionKeys (${pkg.questionKeys.length}) mismatch with composition`
      );
    }

    const [pkgRow] = await db
      .insert(tryoutPackages)
      .values({
        categoryId: cat.id,
        title: pkg.title,
        slug: pkg.slug,
        description: pkg.description,
        mode: pkg.mode,
        status: "published",
        durationMinutes: pkg.durationMinutes,
        totalQuestions: pkg.questionKeys.length,
        difficulty: pkg.difficulty,
        isOpenAccess: true,
        passingGradeTotal: pkg.passingGrade?.total ?? null,
        passingGradeTwk: pkg.passingGrade?.twk ?? null,
        passingGradeTiu: pkg.passingGrade?.tiu ?? null,
        passingGradeTkp: pkg.passingGrade?.tkp ?? null,
        targetSafeScore: pkg.targetSafeScore ?? null,
        showRanking: !!pkg.showRanking,
        publishedAt: new Date(),
      })
      .returning();

    await db.insert(packageSubtests).values(
      pkg.subtestComposition.map((s, idx) => ({
        packageId: pkgRow.id,
        subtest: s.subtest,
        questionCount: s.count,
        passingGrade: s.passingGrade ?? null,
        sortOrder: idx,
      }))
    );

    await db.insert(packageQuestions).values(
      pkg.questionKeys.map((k, idx) => {
        const qid = questionBySeedKey.get(k);
        if (!qid) throw new Error(`question ${k} missing for package ${pkg.slug}`);
        return { packageId: pkgRow.id, questionId: qid, orderNumber: idx + 1 };
      })
    );

    console.log(`    ✓ ${pkg.slug} (${pkg.questionKeys.length} soal)`);
  }

  console.log("✓ seed done");
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ seed failed:", err);
  process.exit(1);
});
