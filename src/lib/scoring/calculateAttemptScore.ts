export type SubtestType = "TWK" | "TIU" | "TKP" | "SKB";

export interface QuestionForScoring {
  id: string;
  subtest: SubtestType;
  scoringType: "single_correct" | "weighted_options";
  topicId: string | null;
}

export interface OptionForScoring {
  id: string;
  questionId: string;
  isCorrect: boolean;
  scoreValue: number;
}

export interface AnswerForScoring {
  questionId: string;
  selectedOptionId: string | null;
  isMarkedDoubtful: boolean;
}

export interface PassingGrades {
  total?: number | null;
  twk?: number | null;
  tiu?: number | null;
  tkp?: number | null;
  skb?: number | null;
}

export interface TopicStat {
  topicId: string | null;
  subtest: SubtestType;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
}

export interface AttemptScore {
  totalScore: number;
  subtestScores: Partial<Record<SubtestType, number>>;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  doubtfulCount: number;
  isPassed: boolean;
  safeScoreGap: number | null;
  topicStats: TopicStat[];
}

export function calculateAttemptScore(
  questions: QuestionForScoring[],
  optionsMap: Map<string, OptionForScoring[]>, // questionId -> options
  answers: AnswerForScoring[],
  passingGrades: PassingGrades,
  targetSafeScore?: number | null
): AttemptScore {
  const answerMap = new Map<string, AnswerForScoring>();
  for (const a of answers) {
    answerMap.set(a.questionId, a);
  }

  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;
  let doubtfulCount = 0;

  const subtestScores: Partial<Record<SubtestType, number>> = {};
  const topicStatsMap = new Map<string, TopicStat>();

  for (const q of questions) {
    const answer = answerMap.get(q.id);
    const options = optionsMap.get(q.id) ?? [];

    if (answer?.isMarkedDoubtful) doubtfulCount++;

    let questionScore = 0;
    let isCorrect = false;
    let isEmpty = !answer?.selectedOptionId;

    if (!isEmpty) {
      const selectedOption = options.find(
        (o) => o.id === answer!.selectedOptionId
      );

      if (selectedOption) {
        if (q.scoringType === "single_correct") {
          if (selectedOption.isCorrect) {
            questionScore = 5;
            isCorrect = true;
          } else {
            questionScore = 0;
          }
        } else if (q.scoringType === "weighted_options") {
          // TKP: use the option's score_value directly
          questionScore = selectedOption.scoreValue;
          // For TKP, "correct" means highest score option (5)
          isCorrect = selectedOption.scoreValue === 5;
        }
      } else {
        isEmpty = true;
      }
    }

    totalScore += questionScore;

    if (!subtestScores[q.subtest]) subtestScores[q.subtest] = 0;
    subtestScores[q.subtest]! += questionScore;

    if (isEmpty) {
      emptyCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }

    // Topic stats
    const topicKey = `${q.topicId ?? "unknown"}_${q.subtest}`;
    if (!topicStatsMap.has(topicKey)) {
      topicStatsMap.set(topicKey, {
        topicId: q.topicId,
        subtest: q.subtest,
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        emptyCount: 0,
      });
    }
    const stat = topicStatsMap.get(topicKey)!;
    stat.totalQuestions++;
    if (isEmpty) stat.emptyCount++;
    else if (isCorrect) stat.correctCount++;
    else stat.wrongCount++;
  }

  // Check passing grade
  let isPassed = true;

  if (passingGrades.total != null && totalScore < passingGrades.total) {
    isPassed = false;
  }
  if (
    passingGrades.twk != null &&
    subtestScores.TWK != null &&
    subtestScores.TWK < passingGrades.twk
  ) {
    isPassed = false;
  }
  if (
    passingGrades.tiu != null &&
    subtestScores.TIU != null &&
    subtestScores.TIU < passingGrades.tiu
  ) {
    isPassed = false;
  }
  if (
    passingGrades.tkp != null &&
    subtestScores.TKP != null &&
    subtestScores.TKP < passingGrades.tkp
  ) {
    isPassed = false;
  }
  if (
    passingGrades.skb != null &&
    subtestScores.SKB != null &&
    subtestScores.SKB < passingGrades.skb
  ) {
    isPassed = false;
  }

  // Safe score gap
  let safeScoreGap: number | null = null;
  if (targetSafeScore != null) {
    safeScoreGap = totalScore - targetSafeScore;
  }

  // Sort topic stats by wrong count desc
  const topicStats = Array.from(topicStatsMap.values()).sort(
    (a, b) => b.wrongCount - a.wrongCount
  );

  return {
    totalScore,
    subtestScores,
    correctCount,
    wrongCount,
    emptyCount,
    doubtfulCount,
    isPassed,
    safeScoreGap,
    topicStats,
  };
}
