import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { questions, questionOptions, profiles, topics } from "@/lib/db/schema";

export interface ReviewQueueItem {
  id: string;
  questionText: string;
  subtest: string;
  scoringType: string;
  difficulty: string;
  explanation: string | null;
  explanationShort: string | null;
  sourceNote: string | null;
  topicName: string | null;
  status: string;
  verified: boolean;
  reviewedAt: Date | null;
  reviewedByName: string | null;
  reviewNotes: string | null;
  createdAt: Date;
  options: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
    scoreValue: number;
  }[];
}

export interface ReviewQueueStats {
  total: number;
  verified: number;
  unverified: number;
  archived: number;
  bySubtest: { TWK: number; TIU: number; TKP: number; SKB: number };
}

export async function getReviewQueueStats(): Promise<ReviewQueueStats> {
  const rows = await db
    .select({
      subtest: questions.subtest,
      verified: questions.verified,
      status: questions.status,
    })
    .from(questions);

  const stats: ReviewQueueStats = {
    total: 0,
    verified: 0,
    unverified: 0,
    archived: 0,
    bySubtest: { TWK: 0, TIU: 0, TKP: 0, SKB: 0 },
  };

  for (const r of rows) {
    if (r.status === "archived") {
      stats.archived++;
      continue;
    }
    stats.total++;
    if (r.verified) stats.verified++;
    else {
      stats.unverified++;
      if (r.subtest === "TWK") stats.bySubtest.TWK++;
      else if (r.subtest === "TIU") stats.bySubtest.TIU++;
      else if (r.subtest === "TKP") stats.bySubtest.TKP++;
      else if (r.subtest === "SKB") stats.bySubtest.SKB++;
    }
  }
  return stats;
}

export async function listReviewQueue(filters: {
  subtest?: string;
  verified?: "all" | "yes" | "no";
  limit?: number;
  offset?: number;
}): Promise<ReviewQueueItem[]> {
  const conditions = [];
  if (filters.subtest && filters.subtest !== "all") {
    conditions.push(eq(questions.subtest, filters.subtest as "TWK"));
  }
  if (filters.verified === "yes") conditions.push(eq(questions.verified, true));
  else if (filters.verified === "no") conditions.push(eq(questions.verified, false));

  // exclude archived from review queue
  conditions.push(sql`${questions.status} != 'archived'`);

  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      subtest: questions.subtest,
      scoringType: questions.scoringType,
      difficulty: questions.difficulty,
      explanation: questions.explanation,
      explanationShort: questions.explanationShort,
      sourceNote: questions.sourceNote,
      status: questions.status,
      verified: questions.verified,
      reviewedAt: questions.reviewedAt,
      reviewNotes: questions.reviewNotes,
      reviewedById: questions.reviewedBy,
      topicId: questions.topicId,
      createdAt: questions.createdAt,
    })
    .from(questions)
    .where(where)
    .orderBy(desc(questions.createdAt))
    .limit(filters.limit ?? 30)
    .offset(filters.offset ?? 0);

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const reviewerIds = rows.map((r) => r.reviewedById).filter((x): x is string => !!x);
  const topicIds = rows.map((r) => r.topicId).filter((x): x is string => !!x);

  const [opts, reviewers, topicRows] = await Promise.all([
    db
      .select()
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, ids))
      .orderBy(questionOptions.sortOrder),
    reviewerIds.length
      ? db
          .select({ id: profiles.id, fullName: profiles.fullName })
          .from(profiles)
          .where(inArray(profiles.id, reviewerIds))
      : Promise.resolve([]),
    topicIds.length
      ? db
          .select({ id: topics.id, name: topics.name })
          .from(topics)
          .where(inArray(topics.id, topicIds))
      : Promise.resolve([]),
  ]);

  const optsByQ = new Map<string, typeof opts>();
  for (const o of opts) {
    if (!optsByQ.has(o.questionId)) optsByQ.set(o.questionId, []);
    optsByQ.get(o.questionId)!.push(o);
  }
  const reviewerMap = new Map(reviewers.map((r) => [r.id, r.fullName]));
  const topicMap = new Map(topicRows.map((t) => [t.id, t.name]));

  return rows.map((r) => ({
    id: r.id,
    questionText: r.questionText,
    subtest: r.subtest,
    scoringType: r.scoringType,
    difficulty: r.difficulty,
    explanation: r.explanation,
    explanationShort: r.explanationShort,
    sourceNote: r.sourceNote,
    status: r.status,
    verified: r.verified,
    reviewedAt: r.reviewedAt,
    reviewedByName: r.reviewedById ? reviewerMap.get(r.reviewedById) ?? null : null,
    reviewNotes: r.reviewNotes,
    topicName: r.topicId ? topicMap.get(r.topicId) ?? null : null,
    createdAt: r.createdAt,
    options: (optsByQ.get(r.id) ?? []).map((o) => ({
      id: o.id,
      label: o.optionLabel,
      text: o.optionText,
      isCorrect: o.isCorrect,
      scoreValue: o.scoreValue,
    })),
  }));
}
