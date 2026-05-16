import { readFileSync, writeFileSync, appendFileSync } from 'fs';

const questions = JSON.parse(readFileSync('/tmp/nalarup_all_questions.json', 'utf8'));
const issues = [];
let checked = 0;

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  appendFileSync('/tmp/nalarup_validate_progress.log', `[${ts}] ${msg}\n`);
}

log(`Starting validation of ${questions.length} questions`);

// === VALIDATORS ===

// 1. Structural checks (all soal)
function validateStructure(q) {
  const errs = [];
  const opts = q.options;
  
  // Must have 4-5 options
  if (opts.length < 4 || opts.length > 5) {
    errs.push(`Jumlah opsi: ${opts.length} (expected 4-5)`);
  }
  
  // single_correct: exactly 1 correct answer
  if (q.scoring_type === 'single_correct') {
    const correctCount = opts.filter(o => o.is_correct).length;
    if (correctCount !== 1) {
      errs.push(`Jawaban benar: ${correctCount} (expected 1)`);
    }
  }
  
  // weighted_options (TKP): all must have score_value
  if (q.scoring_type === 'weighted_options') {
    const noScore = opts.filter(o => o.score_value === null || o.score_value === undefined);
    if (noScore.length > 0) {
      errs.push(`${noScore.length} opsi tanpa score_value`);
    }
    // TKP scores should be 1-5 unique
    const scores = opts.map(o => o.score_value).sort();
    const expected = [1, 2, 3, 4, 5];
    if (opts.length === 5 && JSON.stringify(scores) !== JSON.stringify(expected)) {
      errs.push(`TKP scores tidak 1-5 unik: [${scores}]`);
    }
  }
  
  // Empty option text
  const emptyOpts = opts.filter(o => !o.text || o.text.trim() === '');
  if (emptyOpts.length > 0) {
    errs.push(`${emptyOpts.length} opsi kosong`);
  }
  
  // Empty explanation
  if (!q.explanation || q.explanation.trim().length < 10) {
    errs.push(`Pembahasan terlalu pendek/kosong`);
  }
  
  return errs;
}

// 2. Math equation validator (TIU: ax + b = c)
function validateEquation(q) {
  const text = q.question_text;
  // Pattern: Nx + M = K or Nx - M = K
  const match = text.match(/(\d+)x\s*([+-])\s*(\d+)\s*=\s*(\d+)/);
  if (!match) return [];
  
  const a = parseInt(match[1]);
  const op = match[2];
  const b = parseInt(match[3]);
  const c = parseInt(match[4]);
  
  let expected;
  if (op === '+') expected = (c - b) / a;
  else expected = (c + b) / a;
  
  if (!Number.isInteger(expected)) {
    return [`Persamaan ${a}x ${op} ${b} = ${c} → x = ${expected} (bukan integer)`];
  }
  
  // Check if correct answer matches
  const correctOpt = q.options.find(o => o.is_correct);
  if (!correctOpt) return [];
  
  const correctVal = parseFloat(correctOpt.text);
  if (!isNaN(correctVal) && correctVal !== expected) {
    return [`JAWABAN SALAH: ${a}x ${op} ${b} = ${c} → x seharusnya ${expected}, jawaban: ${correctVal}`];
  }
  
  return [];
}

// 3. Sequence/deret validator
function validateSequence(q) {
  const text = q.question_text;
  // Pattern: numbers separated by commas, ending with ...
  const match = text.match(/([\d,\s]+),\s*\.{3}/);
  if (!match) return [];
  
  const nums = match[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  if (nums.length < 4) return [];
  
  // Try common patterns
  const diffs = [];
  for (let i = 1; i < nums.length; i++) diffs.push(nums[i] - nums[i - 1]);
  
  // Arithmetic: constant diff
  const isArithmetic = diffs.every(d => d === diffs[0]);
  if (isArithmetic) {
    const nextVal = nums[nums.length - 1] + diffs[0];
    const correctOpt = q.options.find(o => o.is_correct);
    if (correctOpt) {
      const correctVal = parseFloat(correctOpt.text);
      if (!isNaN(correctVal) && correctVal !== nextVal) {
        return [`DERET ARITMATIKA SALAH: [${nums}] d=${diffs[0]}, next=${nextVal}, jawaban=${correctVal}`];
      }
    }
    return [];
  }
  
  // Quadratic: diff of diffs constant
  const diffs2 = [];
  for (let i = 1; i < diffs.length; i++) diffs2.push(diffs[i] - diffs[i - 1]);
  const isQuadratic = diffs2.length >= 2 && diffs2.every(d => d === diffs2[0]);
  if (isQuadratic) {
    const nextDiff = diffs[diffs.length - 1] + diffs2[0];
    const nextVal = nums[nums.length - 1] + nextDiff;
    const correctOpt = q.options.find(o => o.is_correct);
    if (correctOpt) {
      const correctVal = parseFloat(correctOpt.text);
      if (!isNaN(correctVal) && correctVal !== nextVal) {
        return [`DERET KUADRATIK SALAH: [${nums}] next=${nextVal}, jawaban=${correctVal}`];
      }
    }
    return [];
  }
  
  // Geometric: constant ratio
  const ratios = [];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i - 1] !== 0) ratios.push(nums[i] / nums[i - 1]);
  }
  const isGeometric = ratios.length >= 2 && ratios.every(r => Math.abs(r - ratios[0]) < 0.001);
  if (isGeometric) {
    const nextVal = Math.round(nums[nums.length - 1] * ratios[0]);
    const correctOpt = q.options.find(o => o.is_correct);
    if (correctOpt) {
      const correctVal = parseFloat(correctOpt.text);
      if (!isNaN(correctVal) && correctVal !== nextVal) {
        return [`DERET GEOMETRI SALAH: [${nums}] r=${ratios[0]}, next=${nextVal}, jawaban=${correctVal}`];
      }
    }
  }
  
  return [];
}

// 4. KPK/FPB validator
function validateKpkFpb(q) {
  const text = q.question_text;
  
  // KPK
  const kpkMatch = text.match(/KPK\s*(?:bilangan\s*)?(?:dari\s*)?(\d+)(?:\s*,\s*|\s+dan\s+)(\d+)(?:(?:\s*,\s*|\s+dan\s+)(\d+))?/i);
  if (kpkMatch) {
    const nums = [parseInt(kpkMatch[1]), parseInt(kpkMatch[2])];
    if (kpkMatch[3]) nums.push(parseInt(kpkMatch[3]));
    
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => (a * b) / gcd(a, b);
    const expected = nums.reduce((a, b) => lcm(a, b));
    
    const correctOpt = q.options.find(o => o.is_correct);
    if (correctOpt) {
      const correctVal = parseFloat(correctOpt.text);
      if (!isNaN(correctVal) && correctVal !== expected) {
        return [`KPK SALAH: KPK(${nums}) = ${expected}, jawaban: ${correctVal}`];
      }
    }
    return [];
  }
  
  // FPB
  const fpbMatch = text.match(/FPB\s*(?:bilangan\s*)?(?:dari\s*)?(\d+)(?:\s*,\s*|\s+dan\s+)(\d+)(?:(?:\s*,\s*|\s+dan\s+)(\d+))?/i);
  if (fpbMatch) {
    const nums = [parseInt(fpbMatch[1]), parseInt(fpbMatch[2])];
    if (fpbMatch[3]) nums.push(parseInt(fpbMatch[3]));
    
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const expected = nums.reduce((a, b) => gcd(a, b));
    
    const correctOpt = q.options.find(o => o.is_correct);
    if (correctOpt) {
      const correctVal = parseFloat(correctOpt.text);
      if (!isNaN(correctVal) && correctVal !== expected) {
        return [`FPB SALAH: FPB(${nums}) = ${expected}, jawaban: ${correctVal}`];
      }
    }
  }
  
  return [];
}

// 5. Percentage validator
function validatePercentage(q) {
  const text = q.question_text;
  const match = text.match(/(\d+)%\s*dari\s*(?:sebuah|suatu)\s*bilangan\s*(?:adalah|=)\s*(\d+)/i);
  if (!match) return [];
  
  const pct = parseInt(match[1]);
  const result = parseInt(match[2]);
  const expected = (result * 100) / pct;
  
  const correctOpt = q.options.find(o => o.is_correct);
  if (correctOpt) {
    const correctVal = parseFloat(correctOpt.text.replace(/[^\d.]/g, ''));
    if (!isNaN(correctVal) && correctVal !== expected) {
      return [`PERSENTASE SALAH: ${pct}% dari X = ${result} → X = ${expected}, jawaban: ${correctVal}`];
    }
  }
  return [];
}

// 6. Simple geometry (segitiga)
function validateGeometry(q) {
  const text = q.question_text;
  const match = text.match(/alas\s*(\d+)\s*cm.*tinggi\s*(\d+)\s*cm/i);
  if (!match) return [];
  
  const base = parseInt(match[1]);
  const height = parseInt(match[2]);
  const expected = (base * height) / 2;
  
  const correctOpt = q.options.find(o => o.is_correct);
  if (correctOpt) {
    const correctVal = parseFloat(correctOpt.text.replace(/[^\d.]/g, ''));
    if (!isNaN(correctVal) && correctVal !== expected) {
      return [`LUAS SEGITIGA SALAH: (${base}×${height})/2 = ${expected}, jawaban: ${correctVal}`];
    }
  }
  return [];
}

// 7. Explanation consistency check
function validateExplanationConsistency(q) {
  const errs = [];
  const correctOpt = q.options.find(o => o.is_correct);
  if (!correctOpt || !q.explanation) return [];
  
  // Check if explanation mentions the correct label
  const label = correctOpt.label;
  if (!q.explanation.includes(label + '.') && !q.explanation.includes(label + ' ') && !q.explanation.includes(`jawaban ${label}`) && !q.explanation.toLowerCase().includes(`benar adalah ${label.toLowerCase()}`)) {
    // Soft check - maybe explanation mentions the text instead
    if (!q.explanation.includes(correctOpt.text.slice(0, 20))) {
      // Don't flag this as hard error, just note
    }
  }
  
  // Check if explanation says different letter than actual correct
  const explMatch = q.explanation.match(/(?:jawaban|benar)\s*(?:yang benar\s*)?(?:adalah|yaitu)?\s*([A-E])\b/i);
  if (explMatch) {
    const explLabel = explMatch[1].toUpperCase();
    if (explLabel !== label) {
      errs.push(`PEMBAHASAN KONTRADIKSI: pembahasan bilang "${explLabel}" tapi jawaban benar = "${label}"`);
    }
  }
  
  return errs;
}

// === RUN VALIDATION ===
const BATCH_SIZE = 200;
let batchNum = 0;

for (let i = 0; i < questions.length; i += BATCH_SIZE) {
  batchNum++;
  const batch = questions.slice(i, i + BATCH_SIZE);
  
  for (const q of batch) {
    const qIssues = [];
    
    // Structural
    qIssues.push(...validateStructure(q));
    
    // Type-specific (TIU)
    if (q.subtest === 'TIU') {
      qIssues.push(...validateEquation(q));
      qIssues.push(...validateSequence(q));
      qIssues.push(...validateKpkFpb(q));
      qIssues.push(...validatePercentage(q));
      qIssues.push(...validateGeometry(q));
    }
    
    // Explanation consistency (all)
    qIssues.push(...validateExplanationConsistency(q));
    
    if (qIssues.length > 0) {
      issues.push({
        id: q.id,
        subtest: q.subtest,
        question: q.question_text.slice(0, 100),
        issues: qIssues,
        severity: qIssues.some(i => i.startsWith('JAWABAN SALAH') || i.startsWith('DERET') || i.startsWith('KPK') || i.startsWith('FPB') || i.startsWith('PERSENTASE') || i.startsWith('LUAS') || i.startsWith('PEMBAHASAN KONTRADIKSI')) ? 'HIGH' : 'LOW',
      });
    }
    checked++;
  }
  
  log(`Batch ${batchNum}: checked ${checked}/${questions.length}, issues found: ${issues.length}`);
}

// Save results
writeFileSync('/tmp/nalarup_validation_results.json', JSON.stringify(issues, null, 2));

// Summary
const high = issues.filter(i => i.severity === 'HIGH');
const low = issues.filter(i => i.severity === 'LOW');

const summary = `
=== VALIDATION COMPLETE ===
Total checked: ${checked}
Total issues: ${issues.length}
HIGH severity (jawaban salah/kontradiksi): ${high.length}
LOW severity (struktural): ${low.length}

=== HIGH SEVERITY ISSUES ===
${high.map(h => `[${h.subtest}] ${h.question}\n  → ${h.issues.join('; ')}`).join('\n\n')}
`;

writeFileSync('/tmp/nalarup_validation_summary.txt', summary);
log('DONE - results saved');
console.log(summary);
