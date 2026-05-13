import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { getAttemptReview } from "@/lib/results/queries";
import { reportQuestion, toggleSavedQuestion } from "@/lib/results/actions";
import { ReviewClient } from "@/components/results/ReviewClient";

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function ReviewPage({ params }: Props) {
  const { attemptId } = await params;
  const { profile } = await requireUser();

  const data = await getAttemptReview(attemptId, profile.id);
  if (!data) notFound();

  const onToggleSave = async (questionId: string) => {
    "use server";
    return toggleSavedQuestion(questionId);
  };
  const onReport = async (input: {
    questionId: string;
    attemptId: string;
    reason: string;
    description?: string;
  }) => {
    "use server";
    return reportQuestion(input);
  };

  return (
    <ReviewClient
      attempt={data.attempt}
      questions={data.questions}
      onToggleSave={onToggleSave}
      onReport={onReport}
    />
  );
}
