import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { loadExam } from "@/lib/exam/queries";
import {
  cancelAttempt,
  saveAnswer,
  submitAttempt,
} from "@/lib/exam/actions";
import { ExamRoom } from "@/components/exam/ExamRoom";
import { ROUTES } from "@/lib/constants/routes";

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function ExamPage({ params }: Props) {
  const { attemptId } = await params;
  const { profile } = await requireUser();

  const data = await loadExam(attemptId, profile.id);
  if (!data) notFound();

  // If already submitted, bounce to result page.
  if (data.attempt.status === "submitted") {
    redirect(ROUTES.result(attemptId));
  }

  // If expired but not yet submitted, finalize then bounce.
  if (data.attempt.status === "expired" || data.attempt.endsAt <= new Date()) {
    // submitAttempt is a server action that redirects internally.
    await submitAttempt(attemptId, "timeout");
  }

  // Non-in_progress (cancelled) → back to catalog.
  if (data.attempt.status !== "in_progress") {
    redirect(ROUTES.tryouts);
  }

  const onSave = async (input: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string | null;
    isMarkedDoubtful: boolean;
  }) => {
    "use server";
    return saveAnswer(input);
  };
  const onSubmit = async (id: string, reason: "user" | "timeout") => {
    "use server";
    await submitAttempt(id, reason);
  };
  const onCancel = async (id: string) => {
    "use server";
    await cancelAttempt(id);
  };

  return (
    <ExamRoom
      attempt={data.attempt}
      questions={data.questions}
      initialAnswers={data.answers}
      onSave={onSave}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
