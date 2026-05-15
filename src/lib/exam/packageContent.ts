/**
 * Cached package payload — questions + options.
 *
 * Opt #4 — heavy read-side cache.
 *
 * Yang di-cache: struktur soal & opsi (id, urutan, teks soal, label opsi).
 * Yang TIDAK di-cache: jawaban user (per-attempt), karena itu mutable & private.
 *
 * Cache invalidation pakai tag `package-content:{packageId}`.
 * Admin actions yang ubah konten paket → revalidateTag.
 *
 * Dampak konkret saat 3.000 user buka tryout serentak:
 *  - Tanpa cache: 3.000 × 2 query (questions + options) = 6.000 query.
 *  - Dengan cache: ±N paket × 2 query (cold) → setelah panas, 0 query DB.
 *  - Egress drop drastis: payload soal tidak lewat DB lagi.
 */

import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { packageQuestions, questionOptions, questions } from "@/lib/db/schema";
import type { ExamQuestion } from "@/lib/exam/queries";

export const PACKAGE_CONTENT_CACHE_TAG = (packageId: string) =>
  `package-content:${packageId}`;

/**
 * Fetch all questions + options for a package, cached at the edge.
 * Revalidate after 1 hour by default; admin mutations revalidateTag immediately.
 */
export const getPackageContent = (packageId: string) =>
  unstable_cache(
    async (): Promise<ExamQuestion[]> => {
      const qRows = await db
        .select({
          id: questions.id,
          subtest: questions.subtest,
          questionText: questions.questionText,
          scoringType: questions.scoringType,
          orderNumber: packageQuestions.orderNumber,
        })
        .from(packageQuestions)
        .innerJoin(questions, eq(packageQuestions.questionId, questions.id))
        .where(eq(packageQuestions.packageId, packageId))
        .orderBy(asc(packageQuestions.orderNumber));

      const optRows = await db
        .select({
          id: questionOptions.id,
          questionId: questionOptions.questionId,
          optionLabel: questionOptions.optionLabel,
          optionText: questionOptions.optionText,
          sortOrder: questionOptions.sortOrder,
        })
        .from(questionOptions)
        .innerJoin(questions, eq(questionOptions.questionId, questions.id))
        .innerJoin(packageQuestions, eq(packageQuestions.questionId, questions.id))
        .where(eq(packageQuestions.packageId, packageId))
        .orderBy(asc(questionOptions.sortOrder));

      const optsByQ = new Map<string, ExamQuestion["options"]>();
      for (const o of optRows) {
        const list = optsByQ.get(o.questionId) ?? [];
        list.push({ id: o.id, label: o.optionLabel, text: o.optionText });
        optsByQ.set(o.questionId, list);
      }

      return qRows.map((q) => ({
        id: q.id,
        orderNumber: q.orderNumber,
        subtest: q.subtest,
        questionText: q.questionText,
        scoringType: q.scoringType,
        options: optsByQ.get(q.id) ?? [],
      }));
    },
    ["package-content", packageId],
    {
      tags: [PACKAGE_CONTENT_CACHE_TAG(packageId)],
      // 1 jam — hampir tidak pernah expired natural karena admin
      // edit memicu revalidateTag eksplisit.
      revalidate: 3600,
    },
  )();
