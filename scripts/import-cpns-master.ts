/**
 * NalarUp — Import Master CPNS 500+ soal
 * 
 * Reads scripts/cpns-soal-master.json (529 soal real CPNS 2018-2026)
 * and creates production-ready tryout packages:
 * 
 *   - 3x SKD Simulasi Penuh (110 soal, 100 menit, format CPNS BKN asli)
 *   - 6x Practice TWK/TIU (15 soal, 15 menit)
 *   - 2x Practice TKP (15 soal, 20 menit)
 *   - 1x SKD Quick Test (30 soal, 30 menit, easy)
 * 
 * Run: npx tsx --env-file=.env.local scripts/import-cpns-master.ts
 *
 * IDEMPOTENT: TRUNCATE content tables, full re-seed. Tidak menyentuh
 * profiles/attempts/auth.
 */

import fs from "fs";
import path from "path";
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

interface MasterOption {
  label: string;
  text: string;
  isCorrect: boolean;
  scoreValue: number;
}

interface MasterQuestion {
  questionText: string;
  subtest: "TWK" | "TIU" | "TKP" | "SKB";
  scoringType: "single_correct" | "weighted_options";
  difficulty: "easy" | "medium" | "hard";
  topicId: string | null;
  categoryId: string | null;
  explanation: string;
  explanationShort: string | null;
  sourceNote: string;
  options: MasterOption[];
}

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "skd", name: "SKD", description: "Seleksi Kompetensi Dasar CPNS — TWK, TIU, TKP.", sortOrder: 1 },
  { slug: "twk", name: "TWK", description: "Tes Wawasan Kebangsaan.", sortOrder: 2 },
  { slug: "tiu", name: "TIU", description: "Tes Intelegensia Umum.", sortOrder: 3 },
  { slug: "tkp", name: "TKP", description: "Tes Karakteristik Pribadi.", sortOrder: 4 },
  { slug: "pppk", name: "PPPK", description: "Pegawai Pemerintah dengan Perjanjian Kerja.", sortOrder: 5 },
  { slug: "skb", name: "SKB", description: "Seleksi Kompetensi Bidang.", sortOrder: 6 },
];

// ─── Topics ──────────────────────────────────────────────────────────────────

const TOPICS: { slug: string; name: string; subtest: "TWK" | "TIU" | "TKP"; categorySlug: string }[] = [
  // TWK
  { slug: "pancasila", name: "Pancasila", subtest: "TWK", categorySlug: "twk" },
  { slug: "uud-1945", name: "UUD 1945", subtest: "TWK", categorySlug: "twk" },
  { slug: "bhinneka-tunggal-ika", name: "Bhinneka Tunggal Ika", subtest: "TWK", categorySlug: "twk" },
  { slug: "nkri", name: "NKRI", subtest: "TWK", categorySlug: "twk" },
  { slug: "sejarah-indonesia", name: "Sejarah Indonesia", subtest: "TWK", categorySlug: "twk" },
  { slug: "bela-negara", name: "Bela Negara", subtest: "TWK", categorySlug: "twk" },
  { slug: "sistem-pemerintahan", name: "Sistem Pemerintahan", subtest: "TWK", categorySlug: "twk" },
  // TIU
  { slug: "verbal-analogi", name: "Verbal Analogi", subtest: "TIU", categorySlug: "tiu" },
  { slug: "verbal-sinonim-antonim", name: "Verbal Sinonim/Antonim", subtest: "TIU", categorySlug: "tiu" },
  { slug: "verbal-silogisme", name: "Verbal Silogisme", subtest: "TIU", categorySlug: "tiu" },
  { slug: "numerik-deret", name: "Numerik Deret", subtest: "TIU", categorySlug: "tiu" },
  { slug: "numerik-aritmatika", name: "Numerik Aritmatika", subtest: "TIU", categorySlug: "tiu" },
  { slug: "numerik-soal-cerita", name: "Numerik Soal Cerita", subtest: "TIU", categorySlug: "tiu" },
  { slug: "figural", name: "Figural", subtest: "TIU", categorySlug: "tiu" },
  // TKP
  { slug: "pelayanan-publik", name: "Pelayanan Publik", subtest: "TKP", categorySlug: "tkp" },
  { slug: "integritas", name: "Integritas", subtest: "TKP", categorySlug: "tkp" },
  { slug: "profesionalisme", name: "Profesionalisme", subtest: "TKP", categorySlug: "tkp" },
  { slug: "jejaring-kerja", name: "Jejaring Kerja", subtest: "TKP", categorySlug: "tkp" },
  { slug: "sosial-budaya", name: "Sosial Budaya", subtest: "TKP", categorySlug: "tkp" },
  { slug: "teknologi-informasi", name: "Teknologi Informasi", subtest: "TKP", categorySlug: "tkp" },
  { slug: "anti-radikalisme", name: "Anti Radikalisme", subtest: "TKP", categorySlug: "tkp" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferTopicSlug(q: MasterQuestion): string {
  const sn = (q.sourceNote || "").toLowerCase();
  const text = (q.questionText || "").toLowerCase();
  const blob = `${sn} ${text}`;

  // TWK
  if (q.subtest === "TWK") {
    if (/pancasila|sila/.test(blob)) return "pancasila";
    if (/uud|amandemen|pasal/.test(blob)) return "uud-1945";
    if (/bhinneka|sutasoma/.test(blob)) return "bhinneka-tunggal-ika";
    if (/sejarah|proklam|sumpah pemuda|sriwijaya|majapahit|pahlawan|pemilu/.test(blob)) return "sejarah-indonesia";
    if (/bela negara|wajib militer|psdn/.test(blob)) return "bela-negara";
    if (/sistem pemerintahan|trias|presiden|dpr|mpr|mk|ma|kpu|bpk/.test(blob)) return "sistem-pemerintahan";
    return "nkri";
  }
  // TIU
  if (q.subtest === "TIU") {
    if (/analogi|=\s*\.\.\.|:\s*[A-Z]/i.test(q.questionText)) return "verbal-analogi";
    if (/sinonim|antonim/.test(blob)) return "verbal-sinonim-antonim";
    if (/silogisme|semua|sebagian|kesimpulan|maka/.test(blob)) return "verbal-silogisme";
    if (/deret|huruf|angka/.test(blob)) return "numerik-deret";
    if (/cerita|menempuh|kecepatan|umur|pekerja|hari|jam/.test(blob)) return "numerik-soal-cerita";
    if (/figural|gambar|pola/.test(blob)) return "figural";
    return "numerik-aritmatika";
  }
  // TKP
  if (q.subtest === "TKP") {
    if (/integritas|gratifikasi|jujur|manipulasi|sumpah/.test(blob)) return "integritas";
    if (/pelayanan|masyarakat|warga|loket|antri/.test(blob)) return "pelayanan-publik";
    if (/jejaring|kolaborasi|tim|rekan/.test(blob)) return "jejaring-kerja";
    if (/sosial|budaya|daerah|adat|bahasa daerah/.test(blob)) return "sosial-budaya";
    if (/teknologi|sistem digital|aplikasi|komputer|wfh|wfa|virus|email/.test(blob)) return "teknologi-informasi";
    if (/radikal|ekstrem|terorism/.test(blob)) return "anti-radikalisme";
    return "profesionalisme";
  }
  return "pancasila";
}

function shuffle<T>(arr: T[], seed = 42): T[] {
  // Deterministic shuffle for reproducibility
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("▶ NalarUp Master Import — 500+ soal CPNS");

  // Load master JSON
  const masterPath = path.join(__dirname, "cpns-soal-master.json");
  const raw = JSON.parse(fs.readFileSync(masterPath, "utf-8")) as MasterQuestion[];
  console.log(`  · loaded ${raw.length} soal dari master`);

  const byTopic = new Map<string, MasterQuestion[]>();
  for (const q of raw) {
    const slug = inferTopicSlug(q);
    if (!byTopic.has(slug)) byTopic.set(slug, []);
    byTopic.get(slug)!.push(q);
  }
  console.log(`  · distributed across ${byTopic.size} topics`);

  const bySubtest = {
    TWK: shuffle(raw.filter((q) => q.subtest === "TWK"), 1001),
    TIU: shuffle(raw.filter((q) => q.subtest === "TIU"), 1002),
    TKP: shuffle(raw.filter((q) => q.subtest === "TKP"), 1003),
  };
  console.log(`  · TWK ${bySubtest.TWK.length} | TIU ${bySubtest.TIU.length} | TKP ${bySubtest.TKP.length}`);

  // Reset content tables
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

  // Categories
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

  // Topics
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

  // Questions + options (batch insert)
  console.log("  · seeding questions + options …");
  const questionIds: string[] = [];
  const questionIdBySubtest = { TWK: [] as string[], TIU: [] as string[], TKP: [] as string[] };

  for (let i = 0; i < raw.length; i++) {
    const q = raw[i];
    const topicSlug = inferTopicSlug(q);
    const topic = topicBySlug.get(topicSlug);
    const catSlug = q.subtest.toLowerCase();
    const cat = catBySlug.get(catSlug);

    const [row] = await db
      .insert(questions)
      .values({
        categoryId: cat?.id ?? null,
        topicId: topic?.id ?? null,
        subtest: q.subtest,
        questionText: q.questionText,
        questionType: "single_choice",
        scoringType: q.scoringType,
        difficulty: q.difficulty,
        explanation: q.explanation,
        explanationShort: q.explanationShort,
        sourceNote: q.sourceNote,
        status: "published",
      })
      .returning();

    questionIds.push(row.id);
    if (q.subtest === "TWK" || q.subtest === "TIU" || q.subtest === "TKP") {
      questionIdBySubtest[q.subtest].push(row.id);
    }

    await db.insert(questionOptions).values(
      q.options.map((o, idx) => ({
        questionId: row.id,
        optionLabel: o.label,
        optionText: o.text,
        isCorrect: o.isCorrect,
        scoreValue: o.scoreValue,
        sortOrder: idx,
      }))
    );

    if ((i + 1) % 50 === 0) console.log(`    · ${i + 1}/${raw.length} soal …`);
  }
  console.log(`    ✓ ${raw.length} questions inserted`);

  // Map raw question -> id (by index in shuffled bySubtest)
  // Re-build from raw insertion order
  const idByQuestionText = new Map<string, string>();
  for (let i = 0; i < raw.length; i++) {
    idByQuestionText.set(raw[i].questionText, questionIds[i]);
  }

  // ─── Build Packages ────────────────────────────────────────────────────
  // SKD CPNS asli format: 110 soal/100 menit (TWK 30 + TIU 35 + TKP 45)
  // Passing grade BKN 2024: TWK 65, TIU 80, TKP 166, total 311
  // Bottleneck saat ini: TKP 171 -> 3 simulasi penuh, sisa untuk practice

  const packages: Array<{
    title: string;
    slug: string;
    description: string;
    mode: "simulation" | "practice";
    durationMinutes: number;
    difficulty: "easy" | "medium" | "hard";
    categorySlug: string;
    showRanking?: boolean;
    passingGrade?: { total?: number; twk?: number; tiu?: number; tkp?: number };
    targetSafeScore?: number;
    composition: { subtest: "TWK" | "TIU" | "TKP"; count: number; passingGrade?: number }[];
    questionIds: string[];
  }> = [];

  // Track consumed to avoid duplicates across packages
  let twkCursor = 0;
  let tiuCursor = 0;
  let tkpCursor = 0;
  const TWK = bySubtest.TWK.map((q) => idByQuestionText.get(q.questionText)!).filter(Boolean);
  const TIU = bySubtest.TIU.map((q) => idByQuestionText.get(q.questionText)!).filter(Boolean);
  const TKP = bySubtest.TKP.map((q) => idByQuestionText.get(q.questionText)!).filter(Boolean);

  function takeTWK(n: number) { const r = TWK.slice(twkCursor, twkCursor + n); twkCursor += n; return r; }
  function takeTIU(n: number) { const r = TIU.slice(tiuCursor, tiuCursor + n); tiuCursor += n; return r; }
  function takeTKP(n: number) { const r = TKP.slice(tkpCursor, tkpCursor + n); tkpCursor += n; return r; }

  // 1. SKD Quick Test (warm-up)
  packages.push({
    title: "SKD Quick Test — Warm Up",
    slug: "skd-quick-test",
    description: "Tes singkat 30 soal (TWK 10, TIU 10, TKP 10) dalam 30 menit. Cocok untuk mengukur kemampuan awal sebelum simulasi penuh CPNS.",
    mode: "simulation",
    durationMinutes: 30,
    difficulty: "easy",
    categorySlug: "skd",
    showRanking: true,
    passingGrade: { total: 95, twk: 25, tiu: 30, tkp: 40 },
    targetSafeScore: 130,
    composition: [
      { subtest: "TWK", count: 10, passingGrade: 25 },
      { subtest: "TIU", count: 10, passingGrade: 30 },
      { subtest: "TKP", count: 10, passingGrade: 40 },
    ],
    questionIds: [...takeTWK(10), ...takeTIU(10), ...takeTKP(10)],
  });

  // 2-5. SKD Simulasi Penuh (4 paket, format BKN asli 110 soal / 100 menit)
  // Total budget: TWK 30*4=120 (sisa 49), TIU 35*4=140 (sisa 29), TKP 45*4=180 (sisa 381)
  for (let i = 1; i <= 4; i++) {
    packages.push({
      title: `SKD CPNS Simulasi Penuh — Paket ${i}`,
      slug: `skd-simulasi-penuh-${i}`,
      description: `Simulasi SKD CPNS lengkap format BKN asli: 110 soal (TWK 30, TIU 35, TKP 45) dalam 100 menit. Passing grade resmi: TWK 65, TIU 80, TKP 166, total 311. Latihan sesungguhnya untuk persiapan ujian CPNS.`,
      mode: "simulation",
      durationMinutes: 100,
      difficulty: "hard",
      categorySlug: "skd",
      showRanking: true,
      passingGrade: { total: 311, twk: 65, tiu: 80, tkp: 166 },
      targetSafeScore: 430,
      composition: [
        { subtest: "TWK", count: 30, passingGrade: 65 },
        { subtest: "TIU", count: 35, passingGrade: 80 },
        { subtest: "TKP", count: 45, passingGrade: 166 },
      ],
      questionIds: [...takeTWK(30), ...takeTIU(35), ...takeTKP(45)],
    });
  }

  // 7-9. Practice TWK (3 paket, sisa 49 TWK setelah SKD = 3 × 15)
  const twkPracticeCount = Math.min(3, Math.floor((TWK.length - twkCursor) / 15));
  for (let i = 1; i <= twkPracticeCount; i++) {
    packages.push({
      title: `Practice TWK — Set ${i}`,
      slug: `practice-twk-${i}`,
      description: `Latihan fokus TWK: Pancasila, UUD 1945, Bhinneka, NKRI, Sejarah, Bela Negara. 15 soal, durasi 15 menit.`,
      mode: "practice",
      durationMinutes: 15,
      difficulty: i === 1 ? "easy" : i === 2 ? "medium" : "hard",
      categorySlug: "twk",
      composition: [{ subtest: "TWK", count: 15 }],
      questionIds: takeTWK(15),
    });
  }

  // 10. Practice TIU (1 paket, sisa 29 TIU)
  if (TIU.length - tiuCursor >= 15) {
    packages.push({
      title: `Practice TIU — Set 1`,
      slug: `practice-tiu-1`,
      description: `Latihan fokus TIU: verbal (analogi, sinonim, silogisme), numerik (deret, aritmatika, soal cerita), figural. 15 soal, durasi 15 menit.`,
      mode: "practice",
      durationMinutes: 15,
      difficulty: "medium",
      categorySlug: "tiu",
      composition: [{ subtest: "TIU", count: 15 }],
      questionIds: takeTIU(15),
    });
  }

  // 11+. Practice TKP — gunakan max sisa TKP, batasi maksimal 20 paket
  const tkpPracticeCount = Math.min(20, Math.floor((TKP.length - tkpCursor) / 15));
  for (let i = 1; i <= tkpPracticeCount; i++) {
    packages.push({
      title: `Practice TKP — Set ${i}`,
      slug: `practice-tkp-${i}`,
      description: `Latihan fokus TKP: Pelayanan Publik, Integritas, Profesionalisme, Jejaring Kerja, Sosbud, IT, Anti Radikalisme. Scoring 1-5 per opsi. 15 soal, durasi 20 menit.`,
      mode: "practice",
      durationMinutes: 20,
      difficulty: i <= 4 ? "easy" : i <= 8 ? "medium" : "hard",
      categorySlug: "tkp",
      composition: [{ subtest: "TKP", count: 15 }],
      questionIds: takeTKP(15),
    });
  }

  console.log(`  · prepared ${packages.length} packages`);
  console.log(`    used: TWK ${twkCursor}/${TWK.length}, TIU ${tiuCursor}/${TIU.length}, TKP ${tkpCursor}/${TKP.length}`);

  // Insert packages
  console.log("  · seeding packages …");
  for (const pkg of packages) {
    const cat = catBySlug.get(pkg.categorySlug);
    if (!cat) throw new Error(`category ${pkg.categorySlug} missing`);

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
        totalQuestions: pkg.questionIds.length,
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
      pkg.composition.map((s, idx) => ({
        packageId: pkgRow.id,
        subtest: s.subtest,
        questionCount: s.count,
        passingGrade: s.passingGrade ?? null,
        sortOrder: idx,
      }))
    );

    await db.insert(packageQuestions).values(
      pkg.questionIds.map((qid, idx) => ({
        packageId: pkgRow.id,
        questionId: qid,
        orderNumber: idx + 1,
      }))
    );

    console.log(`    ✓ ${pkg.slug} (${pkg.questionIds.length} soal, ${pkg.durationMinutes} mnt)`);
  }

  console.log("\n✓ Import complete");
  console.log(`  Total: ${raw.length} soal, ${packages.length} paket tryout`);
  console.log(`  Subtest: TWK ${bySubtest.TWK.length} | TIU ${bySubtest.TIU.length} | TKP ${bySubtest.TKP.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Import failed:", err);
  process.exit(1);
});
