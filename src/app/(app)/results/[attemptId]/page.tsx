import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { getAttemptResult } from "@/lib/results/queries";
import { ROUTES } from "@/lib/constants/routes";
import { COPY } from "@/lib/constants/copy";
import { GlassCard, ProgressRing, StatCard, Button3D, AlertBox } from "@/components/ui";
import { ResultsClient } from "@/components/results/ResultsClient";

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { attemptId } = await params;
  const { profile } = await requireUser();
  const data = await getAttemptResult(attemptId, profile.id);

  if (!data) notFound();
  const { attempt, pkg, subtestBreakdown, topicWeakness } = data;

  if (attempt.status !== "submitted") {
    notFound();
  }

  const passing = pkg.passingGradeTotal;
  const target = pkg.targetSafeScore;
  const totalScore = attempt.totalScore ?? 0;

  const safeGap = target != null ? target - totalScore : null;
  const passingGap = passing != null ? passing - totalScore : null;
  const totalQ = attempt.correctCount! + attempt.wrongCount! + attempt.emptyCount!;
  const accuracy = totalQ > 0 ? Math.round(((attempt.correctCount ?? 0) / totalQ) * 100) : 0;

  // Top 3 weakness with wrong > 0
  const weakest = topicWeakness.filter((t) => t.wrongCount > 0).slice(0, 3);

  // Weakest subtest for contextual recommendation
  const weakestSubtest = subtestBreakdown.length > 0
    ? subtestBreakdown.reduce((a, b) => {
        const aGap = a.passingGrade != null ? a.passingGrade - a.score : 0;
        const bGap = b.passingGrade != null ? b.passingGrade - b.score : 0;
        return bGap > aGap ? b : a;
      })
    : null;

  // Score percentage for the main ring
  const scoreMax = target ?? passing ?? 500;
  const ringColor = attempt.isPassed ? "var(--green)" : "var(--danger)";

  return (
    <ResultsClient
      totalScore={totalScore}
      scoreMax={scoreMax}
      ringColor={ringColor}
      isPassed={attempt.isPassed ?? false}
      passing={passing}
      target={target}
      safeGap={safeGap}
      passingGap={passingGap}
      correctCount={attempt.correctCount ?? 0}
      wrongCount={attempt.wrongCount ?? 0}
      emptyCount={attempt.emptyCount ?? 0}
      accuracy={accuracy}
      subtestBreakdown={subtestBreakdown}
      weakest={weakest}
      weakestSubtest={weakestSubtest}
      packageTitle={pkg.title}
      packageSlug={pkg.slug}
      attemptId={attempt.id}
    />
  );
}
