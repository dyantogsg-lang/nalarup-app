/**
 * AI Quality Flag — auto-detect soal yang mencurigakan
 * untuk fokus review.
 */

interface OptionLite {
  text: string;
  isCorrect: boolean;
  scoreValue: number;
}

interface QuestionLite {
  questionText: string;
  subtest: string;
  scoringType: string;
  explanation: string | null;
  options: OptionLite[];
}

export interface QualityFlag {
  level: "ok" | "warning" | "danger";
  reasons: string[];
}

/**
 * Analisis statis soal — tanpa LLM, pakai heuristik aja.
 * Ini buat surface soal yang BERPOTENSI salah, bukan vonis salah.
 */
export function analyzeQuality(q: QuestionLite): QualityFlag {
  const reasons: string[] = [];

  // 1. Universal checks
  if (!q.questionText || q.questionText.length < 15) {
    reasons.push("Teks soal terlalu pendek");
  }
  if (!q.explanation || q.explanation.length < 20) {
    reasons.push("Pembahasan terlalu pendek/kosong");
  }
  if (q.options.length < 4 || q.options.length > 5) {
    reasons.push(`Jumlah opsi tidak standar (${q.options.length})`);
  }

  // Duplicate option text
  const texts = q.options.map((o) => o.text.toLowerCase().trim());
  if (new Set(texts).size !== texts.length) {
    reasons.push("Ada opsi dengan teks duplikat");
  }

  // Empty option
  if (q.options.some((o) => !o.text || o.text.trim().length < 2)) {
    reasons.push("Ada opsi kosong / terlalu pendek");
  }

  // 2. Subtest-specific
  if (q.subtest === "TWK" || q.subtest === "TIU") {
    // Single correct: harus tepat 1 isCorrect=true
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      reasons.push(`Single correct: ${correctCount} jawaban benar (harus 1)`);
    }
  }

  if (q.subtest === "TKP") {
    // Weighted: tepat 1 opsi nilai 5, semua isCorrect=false
    const fives = q.options.filter((o) => o.scoreValue === 5).length;
    if (fives !== 1) {
      reasons.push(`TKP: ${fives} opsi bernilai 5 (harus 1)`);
    }
    if (q.options.some((o) => o.isCorrect)) {
      reasons.push("TKP: tidak boleh ada isCorrect=true");
    }

    // Score distribution: harus 1-5 unik
    const scores = q.options.map((o) => o.scoreValue).sort();
    const expectedScores = q.options.length === 5 ? [1, 2, 3, 4, 5] : null;
    if (expectedScores && JSON.stringify(scores) !== JSON.stringify(expectedScores)) {
      reasons.push(`TKP: distribusi skor tidak ideal (${scores.join(",")} vs 1-5)`);
    }
  }

  // 3. TIU-specific: cek aritmatika sederhana
  if (q.subtest === "TIU") {
    const tiuFlag = checkTIUMath(q);
    if (tiuFlag) reasons.push(tiuFlag);
  }

  // 4. TWK-specific: warning untuk fact-heavy questions
  if (q.subtest === "TWK") {
    const hasFactClaim =
      /tahun \d{4}|tanggal \d+|pasal \d+|UU\s*(No\.?\s*)?\d+|\b\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/i.test(
        q.questionText
      );
    if (hasFactClaim) {
      reasons.push("⚠ Mengandung klaim faktual (tahun/pasal/UU) — perlu fact-check");
    }
  }

  // Determine level
  let level: QualityFlag["level"] = "ok";
  if (reasons.length > 0) {
    const hasDanger = reasons.some(
      (r) =>
        r.includes("duplikat") ||
        r.includes("harus 1") ||
        r.includes("kosong") ||
        r.includes("tidak ideal") ||
        r.includes("tidak boleh") ||
        r.includes("Aritmatika")
    );
    level = hasDanger ? "danger" : "warning";
  }

  return { level, reasons };
}

/**
 * Cek soal TIU yang berisi aritmatika sederhana.
 * Heuristik: cari pola "X + Y = ?", "deret X, Y, Z, ?", dst.
 */
function checkTIUMath(q: QuestionLite): string | null {
  const text = q.questionText.toLowerCase();

  // Pola: deret aritmatika sederhana "2, 4, 6, 8, ?" atau "..."
  const seqMatch = q.questionText.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s]+(?:\.\.\.|…|\?)/);
  if (seqMatch) {
    const nums = [seqMatch[1], seqMatch[2], seqMatch[3], seqMatch[4]].map(Number);
    const diffs = [nums[1] - nums[0], nums[2] - nums[1], nums[3] - nums[2]];
    // Aritmatika konstan
    if (diffs[0] === diffs[1] && diffs[1] === diffs[2]) {
      const expected = nums[3] + diffs[0];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt) {
        const optNum = parseInt(correctOpt.text.replace(/\D/g, ""), 10);
        if (!isNaN(optNum) && optNum !== expected) {
          return `Aritmatika TIU: deret ${nums.join(",")} → expected ${expected}, jawaban=${optNum}`;
        }
      }
    }
    // Geometri
    if (nums[0] !== 0 && nums[1] / nums[0] === nums[2] / nums[1] && nums[2] / nums[1] === nums[3] / nums[2]) {
      const ratio = nums[1] / nums[0];
      const expected = nums[3] * ratio;
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt) {
        const optNum = parseInt(correctOpt.text.replace(/\D/g, ""), 10);
        if (!isNaN(optNum) && optNum !== expected) {
          return `Aritmatika TIU geometri: deret ${nums.join(",")} → expected ${expected}, jawaban=${optNum}`;
        }
      }
    }
  }

  // Pola "X + Y = ?" atau "X * Y = ?"
  const arithMatch = q.questionText.match(/(\d+)\s*([+\-×x*\/÷:])\s*(\d+)\s*=\s*\?/);
  if (arithMatch) {
    const a = Number(arithMatch[1]);
    const op = arithMatch[2];
    const b = Number(arithMatch[3]);
    let expected: number | null = null;
    if (op === "+") expected = a + b;
    else if (op === "-") expected = a - b;
    else if (op === "×" || op === "x" || op === "*") expected = a * b;
    else if (op === "/" || op === "÷" || op === ":") expected = b !== 0 ? a / b : null;

    if (expected !== null) {
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt) {
        const optNum = parseFloat(correctOpt.text.replace(/[^\d.,-]/g, "").replace(",", "."));
        if (!isNaN(optNum) && Math.abs(optNum - expected) > 0.001) {
          return `Aritmatika TIU: ${a}${op}${b} = ${expected}, jawaban=${optNum}`;
        }
      }
    }
  }

  return null;
}
