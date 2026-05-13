import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
  unique,
  check,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const packageModeEnum = pgEnum("package_mode", [
  "simulation",
  "practice",
]);
export const packageStatusEnum = pgEnum("package_status", [
  "draft",
  "review",
  "published",
  "archived",
]);
export const questionTypeEnum = pgEnum("question_type", ["single_choice"]);
export const questionStatusEnum = pgEnum("question_status", [
  "draft",
  "reviewed",
  "published",
  "archived",
]);
export const subtestTypeEnum = pgEnum("subtest_type", [
  "TWK",
  "TIU",
  "TKP",
  "SKB",
]);
export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "easy",
  "medium",
  "hard",
]);
export const scoringTypeEnum = pgEnum("scoring_type", [
  "single_correct",
  "weighted_options",
]);
export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "expired",
  "cancelled",
]);
export const answerSyncStatusEnum = pgEnum("answer_sync_status", [
  "synced",
  "pending",
  "failed",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewing",
  "resolved",
  "rejected",
]);

// ─── profiles ────────────────────────────────────────────────────────────────

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    targetExam: text("target_exam"),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    onboardingGoal: text("onboarding_goal"),
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastActivityDate: date("last_activity_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("profiles_role_idx").on(t.role),
    index("profiles_email_idx").on(t.email),
  ]
);

// ─── categories ──────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── tryout_packages ─────────────────────────────────────────────────────────

export const tryoutPackages = pgTable(
  "tryout_packages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    mode: packageModeEnum("mode").notNull().default("simulation"),
    status: packageStatusEnum("status").notNull().default("draft"),
    durationMinutes: integer("duration_minutes").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    difficulty: difficultyLevelEnum("difficulty").notNull().default("easy"),
    isOpenAccess: boolean("is_open_access").notNull().default(true),
    passingGradeTotal: integer("passing_grade_total"),
    passingGradeTwk: integer("passing_grade_twk"),
    passingGradeTiu: integer("passing_grade_tiu"),
    passingGradeTkp: integer("passing_grade_tkp"),
    targetSafeScore: integer("target_safe_score"),
    showRanking: boolean("show_ranking").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("tryout_packages_status_idx").on(t.status),
    index("tryout_packages_category_idx").on(t.categoryId),
    index("tryout_packages_mode_idx").on(t.mode),
    index("tryout_packages_open_idx").on(t.isOpenAccess),
    check("duration_positive", sql`${t.durationMinutes} > 0`),
    check("total_questions_positive", sql`${t.totalQuestions} > 0`),
  ]
);

// ─── package_subtests ────────────────────────────────────────────────────────

export const packageSubtests = pgTable(
  "package_subtests",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    packageId: uuid("package_id")
      .notNull()
      .references(() => tryoutPackages.id, { onDelete: "cascade" }),
    subtest: subtestTypeEnum("subtest").notNull(),
    questionCount: integer("question_count").notNull(),
    passingGrade: integer("passing_grade"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("unique_package_subtest").on(t.packageId, t.subtest),
    check("question_count_positive", sql`${t.questionCount} > 0`),
  ]
);

// ─── topics ──────────────────────────────────────────────────────────────────

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  subtest: subtestTypeEnum("subtest"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentTopicId: uuid("parent_topic_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── questions ───────────────────────────────────────────────────────────────

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    topicId: uuid("topic_id").references(() => topics.id, {
      onDelete: "set null",
    }),
    subtest: subtestTypeEnum("subtest").notNull(),
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type")
      .notNull()
      .default("single_choice"),
    scoringType: scoringTypeEnum("scoring_type")
      .notNull()
      .default("single_correct"),
    difficulty: difficultyLevelEnum("difficulty").notNull().default("medium"),
    explanation: text("explanation"),
    explanationShort: text("explanation_short"),
    sourceNote: text("source_note"),
    status: questionStatusEnum("status").notNull().default("draft"),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("questions_subtest_idx").on(t.subtest),
    index("questions_status_idx").on(t.status),
    index("questions_topic_idx").on(t.topicId),
  ]
);

// ─── question_options ────────────────────────────────────────────────────────

export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    optionLabel: text("option_label").notNull(), // A, B, C, D, E
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    scoreValue: integer("score_value").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("question_options_question_idx").on(t.questionId),
    unique("unique_question_option_label").on(t.questionId, t.optionLabel),
  ]
);

// ─── package_questions ───────────────────────────────────────────────────────

export const packageQuestions = pgTable(
  "package_questions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    packageId: uuid("package_id")
      .notNull()
      .references(() => tryoutPackages.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    orderNumber: integer("order_number").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("unique_package_question").on(t.packageId, t.questionId),
    unique("unique_package_order").on(t.packageId, t.orderNumber),
    index("package_questions_package_idx").on(t.packageId),
  ]
);

// ─── attempts ────────────────────────────────────────────────────────────────

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    packageId: uuid("package_id")
      .notNull()
      .references(() => tryoutPackages.id, { onDelete: "cascade" }),
    status: attemptStatusEnum("status").notNull().default("in_progress"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    totalScore: integer("total_score"),
    twkScore: integer("twk_score"),
    tiuScore: integer("tiu_score"),
    tkpScore: integer("tkp_score"),
    skbScore: integer("skb_score"),
    correctCount: integer("correct_count"),
    wrongCount: integer("wrong_count"),
    emptyCount: integer("empty_count"),
    doubtfulCount: integer("doubtful_count"),
    isPassed: boolean("is_passed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("attempts_user_idx").on(t.userId),
    index("attempts_package_idx").on(t.packageId),
    index("attempts_status_idx").on(t.status),
    index("attempts_user_package_idx").on(t.userId, t.packageId),
  ]
);

// ─── attempt_answers ─────────────────────────────────────────────────────────

export const attemptAnswers = pgTable(
  "attempt_answers",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    selectedOptionId: uuid("selected_option_id").references(
      () => questionOptions.id,
      { onDelete: "set null" }
    ),
    isMarkedDoubtful: boolean("is_marked_doubtful").notNull().default(false),
    syncStatus: answerSyncStatusEnum("sync_status").notNull().default("synced"),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("unique_attempt_question").on(t.attemptId, t.questionId),
    index("attempt_answers_attempt_idx").on(t.attemptId),
  ]
);

// ─── attempt_topic_stats ─────────────────────────────────────────────────────

export const attemptTopicStats = pgTable(
  "attempt_topic_stats",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, {
      onDelete: "set null",
    }),
    subtest: subtestTypeEnum("subtest").notNull(),
    totalQuestions: integer("total_questions").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    wrongCount: integer("wrong_count").notNull().default(0),
    emptyCount: integer("empty_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("attempt_topic_stats_attempt_idx").on(t.attemptId)]
);

// ─── saved_questions ─────────────────────────────────────────────────────────

export const savedQuestions = pgTable(
  "saved_questions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("unique_saved_question").on(t.userId, t.questionId)]
);

// ─── question_reports ────────────────────────────────────────────────────────

export const questionReports = pgTable("question_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  attemptId: uuid("attempt_id").references(() => attempts.id, {
    onDelete: "set null",
  }),
  reason: text("reason").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").notNull().default("open"),
  resolvedBy: uuid("resolved_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── learning_recommendations ────────────────────────────────────────────────

export const learningRecommendations = pgTable("learning_recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  attemptId: uuid("attempt_id").references(() => attempts.id, {
    onDelete: "set null",
  }),
  subtest: subtestTypeEnum("subtest"),
  topicId: uuid("topic_id").references(() => topics.id, {
    onDelete: "set null",
  }),
  recommendedPackageId: uuid("recommended_package_id").references(
    () => tryoutPackages.id,
    { onDelete: "set null" }
  ),
  reason: text("reason"),
  priority: integer("priority").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  attempts: many(attempts),
  savedQuestions: many(savedQuestions),
  questionReports: many(questionReports),
  learningRecommendations: many(learningRecommendations),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  packages: many(tryoutPackages),
  questions: many(questions),
  topics: many(topics),
}));

export const tryoutPackagesRelations = relations(
  tryoutPackages,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [tryoutPackages.categoryId],
      references: [categories.id],
    }),
    subtests: many(packageSubtests),
    packageQuestions: many(packageQuestions),
    attempts: many(attempts),
  })
);

export const packageSubtestsRelations = relations(
  packageSubtests,
  ({ one }) => ({
    package: one(tryoutPackages, {
      fields: [packageSubtests.packageId],
      references: [tryoutPackages.id],
    }),
  })
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id],
  }),
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id],
  }),
  options: many(questionOptions),
  packageQuestions: many(packageQuestions),
  attemptAnswers: many(attemptAnswers),
}));

export const questionOptionsRelations = relations(
  questionOptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionOptions.questionId],
      references: [questions.id],
    }),
  })
);

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  user: one(profiles, {
    fields: [attempts.userId],
    references: [profiles.id],
  }),
  package: one(tryoutPackages, {
    fields: [attempts.packageId],
    references: [tryoutPackages.id],
  }),
  answers: many(attemptAnswers),
  topicStats: many(attemptTopicStats),
}));

export const attemptAnswersRelations = relations(
  attemptAnswers,
  ({ one }) => ({
    attempt: one(attempts, {
      fields: [attemptAnswers.attemptId],
      references: [attempts.id],
    }),
    question: one(questions, {
      fields: [attemptAnswers.questionId],
      references: [questions.id],
    }),
    selectedOption: one(questionOptions, {
      fields: [attemptAnswers.selectedOptionId],
      references: [questionOptions.id],
    }),
  })
);
