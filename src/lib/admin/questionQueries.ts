import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  questions,
  questionOptions,
  topics,
  categories,
} from "@/lib/db/schema";

export interface AdminQuestionListItem {
  id: string;
  questionText: string;
  subtest: "TWK" | "TIU" | "TKP" | "SKB";
  scoringType: "single_correct" | "weighted_options";
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "reviewed" | "published" | "archived";
  topicName: string | null;
  categoryName: string | null;
  optionCount: number;
  updatedAt: Date;
}

export async function listAdminQuestions(filter: {
  search?: string;
  subtest?: string;
  status?: string;
}): Promise<AdminQuestionListItem[]> {
  const whereParts = [];
  if (filter.search) {
    whereParts.push(ilike(questions.questionText, `%${filter.search}%`));
  }
  if (filter.subtest && filter.subtest !== "all") {
    whereParts.push(eq(questions.subtest, filter.subtest as "TWK"));
  }
  if (filter.status && filter.status !== "all") {
    whereParts.push(eq(questions.status, filter.status as "draft"));
  }

  return db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      subtest: questions.subtest,
      scoringType: questions.scoringType,
      difficulty: questions.difficulty,
      status: questions.status,
      topicName: topics.name,
      categoryName: categories.name,
      optionCount: sql<number>`(
        SELECT count(*)::int FROM ${questionOptions}
        WHERE ${questionOptions.questionId} = ${questions.id}
      )`,
      updatedAt: questions.updatedAt,
    })
    .from(questions)
    .leftJoin(topics, eq(questions.topicId, topics.id))
    .leftJoin(categories, eq(questions.categoryId, categories.id))
    .where(whereParts.length ? and(...whereParts) : undefined)
    .orderBy(desc(questions.updatedAt));
}

export interface AdminQuestionDetail {
  id: string;
  questionText: string;
  subtest: "TWK" | "TIU" | "TKP" | "SKB";
  scoringType: "single_correct" | "weighted_options";
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "reviewed" | "published" | "archived";
  topicId: string | null;
  categoryId: string | null;
  explanation: string | null;
  explanationShort: string | null;
  sourceNote: string | null;
  options: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
    scoreValue: number;
    sortOrder: number;
  }[];
}

export async function getAdminQuestionById(
  id: string
): Promise<AdminQuestionDetail | null> {
  const [q] = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  if (!q) return null;
  const opts = await db
    .select()
    .from(questionOptions)
    .where(eq(questionOptions.questionId, id))
    .orderBy(asc(questionOptions.sortOrder));
  return {
    id: q.id,
    questionText: q.questionText,
    subtest: q.subtest,
    scoringType: q.scoringType,
    difficulty: q.difficulty,
    status: q.status,
    topicId: q.topicId,
    categoryId: q.categoryId,
    explanation: q.explanation,
    explanationShort: q.explanationShort,
    sourceNote: q.sourceNote,
    options: opts.map((o) => ({
      id: o.id,
      label: o.optionLabel,
      text: o.optionText,
      isCorrect: o.isCorrect,
      scoreValue: o.scoreValue,
      sortOrder: o.sortOrder,
    })),
  };
}

export async function listAllTopics() {
  return db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
      subtest: topics.subtest,
    })
    .from(topics)
    .orderBy(asc(topics.name));
}

export function validateQuestionForPublish(q: AdminQuestionDetail): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!q.questionText.trim()) errors.push("Teks soal kosong.");
  if (q.options.length < 2) errors.push("Minimal 2 opsi diperlukan.");
  if (q.scoringType === "single_correct") {
    const corrects = q.options.filter((o) => o.isCorrect).length;
    if (corrects !== 1) errors.push(`Single correct harus tepat 1 jawaban benar (saat ini ${corrects}).`);
  } else {
    if (!q.options.some((o) => o.scoreValue === 5)) {
      errors.push("Weighted options harus punya 1 opsi score_value 5.");
    }
    const allInRange = q.options.every((o) => o.scoreValue >= 1 && o.scoreValue <= 5);
    if (!allInRange) errors.push("Score value setiap opsi harus 1-5.");
  }
  // Unique labels
  const labels = q.options.map((o) => o.label.toUpperCase());
  if (new Set(labels).size !== labels.length) {
    errors.push("Label opsi tidak boleh duplikat.");
  }
  return { ok: errors.length === 0, errors };
}

// Helper used by upsert action
export { questions, questionOptions } from "@/lib/db/schema";
export const orQuery = or;
