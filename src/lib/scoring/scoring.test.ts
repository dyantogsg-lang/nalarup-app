import { describe, it, expect } from "vitest";
import {
  calculateAttemptScore,
  type QuestionForScoring,
  type OptionForScoring,
  type AnswerForScoring,
} from "@/lib/scoring/calculateAttemptScore";

function makeOptions(
  questionId: string,
  correctLabel: "A" | "B" | "C" | "D" | "E"
): OptionForScoring[] {
  const labels = ["A", "B", "C", "D", "E"] as const;
  return labels.map((l) => ({
    id: `${questionId}-${l}`,
    questionId,
    isCorrect: l === correctLabel,
    scoreValue: l === correctLabel ? 5 : 0,
  }));
}

function makeTkpOptions(questionId: string, scores: [number, number, number, number, number]): OptionForScoring[] {
  const labels = ["A", "B", "C", "D", "E"] as const;
  return labels.map((l, i) => ({
    id: `${questionId}-${l}`,
    questionId,
    isCorrect: scores[i] === 5,
    scoreValue: scores[i],
  }));
}

describe("calculateAttemptScore", () => {
  it("TWK correct answer = 5 points", () => {
    const q: QuestionForScoring = { id: "q1", subtest: "TWK", scoringType: "single_correct", topicId: "t1" };
    const opts = makeOptions("q1", "B");
    const optMap = new Map([["q1", opts]]);
    const answers: AnswerForScoring[] = [{ questionId: "q1", selectedOptionId: "q1-B", isMarkedDoubtful: false }];
    const score = calculateAttemptScore([q], optMap, answers, {});
    expect(score.totalScore).toBe(5);
    expect(score.correctCount).toBe(1);
    expect(score.wrongCount).toBe(0);
    expect(score.emptyCount).toBe(0);
    expect(score.subtestScores.TWK).toBe(5);
  });

  it("TWK wrong answer = 0 points", () => {
    const q: QuestionForScoring = { id: "q1", subtest: "TWK", scoringType: "single_correct", topicId: "t1" };
    const opts = makeOptions("q1", "B");
    const optMap = new Map([["q1", opts]]);
    const answers: AnswerForScoring[] = [{ questionId: "q1", selectedOptionId: "q1-C", isMarkedDoubtful: false }];
    const score = calculateAttemptScore([q], optMap, answers, {});
    expect(score.totalScore).toBe(0);
    expect(score.wrongCount).toBe(1);
    expect(score.correctCount).toBe(0);
  });

  it("TIU empty = 0 points", () => {
    const q: QuestionForScoring = { id: "q1", subtest: "TIU", scoringType: "single_correct", topicId: null };
    const opts = makeOptions("q1", "A");
    const optMap = new Map([["q1", opts]]);
    const answers: AnswerForScoring[] = [{ questionId: "q1", selectedOptionId: null, isMarkedDoubtful: false }];
    const score = calculateAttemptScore([q], optMap, answers, {});
    expect(score.totalScore).toBe(0);
    expect(score.emptyCount).toBe(1);
  });

  it("TKP weighted score", () => {
    const q: QuestionForScoring = { id: "q1", subtest: "TKP", scoringType: "weighted_options", topicId: null };
    const opts = makeTkpOptions("q1", [1, 2, 3, 4, 5]);
    const optMap = new Map([["q1", opts]]);
    // Select option D (score 4)
    const answers: AnswerForScoring[] = [{ questionId: "q1", selectedOptionId: "q1-D", isMarkedDoubtful: false }];
    const score = calculateAttemptScore([q], optMap, answers, {});
    expect(score.totalScore).toBe(4);
    expect(score.subtestScores.TKP).toBe(4);
  });

  it("passing grade all met = isPassed true", () => {
    const qs: QuestionForScoring[] = [
      { id: "q1", subtest: "TWK", scoringType: "single_correct", topicId: null },
      { id: "q2", subtest: "TIU", scoringType: "single_correct", topicId: null },
    ];
    const optMap = new Map([
      ["q1", makeOptions("q1", "A")],
      ["q2", makeOptions("q2", "A")],
    ]);
    const answers: AnswerForScoring[] = [
      { questionId: "q1", selectedOptionId: "q1-A", isMarkedDoubtful: false },
      { questionId: "q2", selectedOptionId: "q2-A", isMarkedDoubtful: false },
    ];
    const score = calculateAttemptScore(qs, optMap, answers, { twk: 5, tiu: 5 });
    expect(score.isPassed).toBe(true);
  });

  it("passing grade one subtest failed = isPassed false", () => {
    const qs: QuestionForScoring[] = [
      { id: "q1", subtest: "TWK", scoringType: "single_correct", topicId: null },
      { id: "q2", subtest: "TIU", scoringType: "single_correct", topicId: null },
    ];
    const optMap = new Map([
      ["q1", makeOptions("q1", "A")],
      ["q2", makeOptions("q2", "A")],
    ]);
    const answers: AnswerForScoring[] = [
      { questionId: "q1", selectedOptionId: "q1-B", isMarkedDoubtful: false }, // wrong
      { questionId: "q2", selectedOptionId: "q2-A", isMarkedDoubtful: false }, // correct
    ];
    const score = calculateAttemptScore(qs, optMap, answers, { twk: 5, tiu: 5 });
    expect(score.isPassed).toBe(false);
  });

  it("topic stats ordered by wrong count desc", () => {
    const qs: QuestionForScoring[] = [
      { id: "q1", subtest: "TWK", scoringType: "single_correct", topicId: "topic-A" },
      { id: "q2", subtest: "TWK", scoringType: "single_correct", topicId: "topic-B" },
      { id: "q3", subtest: "TWK", scoringType: "single_correct", topicId: "topic-B" },
    ];
    const optMap = new Map([
      ["q1", makeOptions("q1", "A")],
      ["q2", makeOptions("q2", "A")],
      ["q3", makeOptions("q3", "A")],
    ]);
    const answers: AnswerForScoring[] = [
      { questionId: "q1", selectedOptionId: "q1-A", isMarkedDoubtful: false }, // correct
      { questionId: "q2", selectedOptionId: "q2-B", isMarkedDoubtful: false }, // wrong
      { questionId: "q3", selectedOptionId: "q3-B", isMarkedDoubtful: false }, // wrong
    ];
    const score = calculateAttemptScore(qs, optMap, answers, {});
    expect(score.topicStats[0].topicId).toBe("topic-B");
    expect(score.topicStats[0].wrongCount).toBe(2);
  });
});
