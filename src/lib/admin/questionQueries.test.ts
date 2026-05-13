import { describe, it, expect } from "vitest";
import { validateQuestionForPublish } from "@/lib/admin/questionQueries";
import type { AdminQuestionDetail } from "@/lib/admin/questionQueries";

function makeQ(
  overrides: Partial<AdminQuestionDetail> = {}
): AdminQuestionDetail {
  return {
    id: "q1",
    questionText: "Teks soal contoh?",
    subtest: "TWK",
    scoringType: "single_correct",
    difficulty: "medium",
    status: "draft",
    topicId: null,
    categoryId: null,
    explanation: null,
    explanationShort: null,
    sourceNote: null,
    options: [
      { id: "a", label: "A", text: "A", isCorrect: false, scoreValue: 0, sortOrder: 0 },
      { id: "b", label: "B", text: "B", isCorrect: true, scoreValue: 5, sortOrder: 1 },
      { id: "c", label: "C", text: "C", isCorrect: false, scoreValue: 0, sortOrder: 2 },
      { id: "d", label: "D", text: "D", isCorrect: false, scoreValue: 0, sortOrder: 3 },
    ],
    ...overrides,
  };
}

describe("validateQuestionForPublish", () => {
  it("passes a well-formed single_correct question", () => {
    const v = validateQuestionForPublish(makeQ());
    expect(v.ok).toBe(true);
    expect(v.errors).toHaveLength(0);
  });

  it("fails when question text empty", () => {
    const v = validateQuestionForPublish(makeQ({ questionText: "   " }));
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/kosong/i);
  });

  it("fails when fewer than 2 options", () => {
    const v = validateQuestionForPublish(
      makeQ({
        options: [
          { id: "a", label: "A", text: "A", isCorrect: true, scoreValue: 5, sortOrder: 0 },
        ],
      })
    );
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/2 opsi/);
  });

  it("fails when single_correct has zero or multiple corrects", () => {
    const zero = validateQuestionForPublish(
      makeQ({
        options: makeQ().options.map((o) => ({ ...o, isCorrect: false })),
      })
    );
    expect(zero.ok).toBe(false);

    const multi = validateQuestionForPublish(
      makeQ({
        options: makeQ().options.map((o) => ({ ...o, isCorrect: true })),
      })
    );
    expect(multi.ok).toBe(false);
    expect(multi.errors.join(" ")).toMatch(/single correct/i);
  });

  it("requires weighted_options to include a score 5 option", () => {
    const v = validateQuestionForPublish(
      makeQ({
        scoringType: "weighted_options",
        options: [
          { id: "a", label: "A", text: "A", isCorrect: false, scoreValue: 1, sortOrder: 0 },
          { id: "b", label: "B", text: "B", isCorrect: false, scoreValue: 2, sortOrder: 1 },
          { id: "c", label: "C", text: "C", isCorrect: false, scoreValue: 3, sortOrder: 2 },
          { id: "d", label: "D", text: "D", isCorrect: false, scoreValue: 4, sortOrder: 3 },
        ],
      })
    );
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/score_value 5/);
  });

  it("rejects weighted score outside 1-5", () => {
    const v = validateQuestionForPublish(
      makeQ({
        scoringType: "weighted_options",
        options: [
          { id: "a", label: "A", text: "A", isCorrect: false, scoreValue: 0, sortOrder: 0 },
          { id: "b", label: "B", text: "B", isCorrect: false, scoreValue: 5, sortOrder: 1 },
        ],
      })
    );
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/1-5/);
  });

  it("rejects duplicate labels", () => {
    const v = validateQuestionForPublish(
      makeQ({
        options: [
          { id: "a", label: "A", text: "A", isCorrect: false, scoreValue: 0, sortOrder: 0 },
          { id: "a2", label: "A", text: "A2", isCorrect: true, scoreValue: 5, sortOrder: 1 },
        ],
      })
    );
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/duplikat/i);
  });
});
