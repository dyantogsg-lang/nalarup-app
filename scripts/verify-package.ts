/**
 * Smoke test: verify package detail query.
 * Task 6 of Phase B.
 */
import { db } from "../src/lib/db";
import {
  tryoutPackages,
  packageSubtests,
  packageQuestions,
  questions,
  questionOptions,
  categories,
} from "../src/lib/db/schema";
import { eq, asc } from "drizzle-orm";

async function main() {
  const slug = process.argv[2] ?? "skd-cpns-paket-perdana";
  console.log(`▶ verify package: ${slug}\n`);

  // 1. Package + category
  const [pkg] = await db
    .select({
      id: tryoutPackages.id,
      title: tryoutPackages.title,
      slug: tryoutPackages.slug,
      mode: tryoutPackages.mode,
      durationMinutes: tryoutPackages.durationMinutes,
      totalQuestions: tryoutPackages.totalQuestions,
      difficulty: tryoutPackages.difficulty,
      passingGradeTotal: tryoutPackages.passingGradeTotal,
      targetSafeScore: tryoutPackages.targetSafeScore,
      categoryName: categories.name,
    })
    .from(tryoutPackages)
    .leftJoin(categories, eq(tryoutPackages.categoryId, categories.id))
    .where(eq(tryoutPackages.slug, slug))
    .limit(1);

  if (!pkg) {
    console.error("✗ package not found");
    process.exit(1);
  }

  console.log("Package:");
  console.log(`  title   : ${pkg.title}`);
  console.log(`  category: ${pkg.categoryName}`);
  console.log(`  mode    : ${pkg.mode}`);
  console.log(`  duration: ${pkg.durationMinutes} menit`);
  console.log(`  soal    : ${pkg.totalQuestions}`);
  console.log(`  difficul: ${pkg.difficulty}`);
  console.log(`  pass    : ${pkg.passingGradeTotal ?? "-"}`);
  console.log(`  safe    : ${pkg.targetSafeScore ?? "-"}\n`);

  // 2. Subtest composition
  const subs = await db
    .select()
    .from(packageSubtests)
    .where(eq(packageSubtests.packageId, pkg.id))
    .orderBy(asc(packageSubtests.sortOrder));

  console.log("Komposisi subtest:");
  for (const s of subs) {
    console.log(
      `  ${s.subtest}: ${s.questionCount} soal${
        s.passingGrade ? ` (pass ${s.passingGrade})` : ""
      }`
    );
  }
  console.log();

  // 3. First 3 questions with options
  const qRows = await db
    .select({
      orderNumber: packageQuestions.orderNumber,
      id: questions.id,
      text: questions.questionText,
      subtest: questions.subtest,
      scoringType: questions.scoringType,
      difficulty: questions.difficulty,
    })
    .from(packageQuestions)
    .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
    .where(eq(packageQuestions.packageId, pkg.id))
    .orderBy(asc(packageQuestions.orderNumber))
    .limit(3);

  console.log("Preview 3 soal pertama:");
  for (const q of qRows) {
    console.log(`  #${q.orderNumber} [${q.subtest}/${q.difficulty}] ${q.text.slice(0, 70)}${q.text.length > 70 ? "…" : ""}`);
    const opts = await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, q.id))
      .orderBy(asc(questionOptions.sortOrder));
    for (const o of opts) {
      const tag =
        q.scoringType === "weighted_options"
          ? `[${o.scoreValue}]`
          : o.isCorrect
          ? "[✓]"
          : "[ ]";
      console.log(`      ${tag} ${o.optionLabel}. ${o.optionText.slice(0, 70)}`);
    }
  }

  console.log("\n✓ query ok");
  process.exit(0);
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
