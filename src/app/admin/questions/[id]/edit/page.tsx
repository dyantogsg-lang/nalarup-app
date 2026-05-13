import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAdminQuestionById,
  listAllTopics,
  validateQuestionForPublish,
} from "@/lib/admin/questionQueries";
import { listAllCategories } from "@/lib/admin/packageQueries";
import {
  deleteQuestion,
  setQuestionStatus,
  upsertQuestion,
  type QuestionFormInput,
} from "@/lib/admin/questionActions";
import { QuestionForm } from "@/components/admin/QuestionForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: Props) {
  const { id } = await params;
  const q = await getAdminQuestionById(id);
  if (!q) notFound();

  const [topics, cats] = await Promise.all([listAllTopics(), listAllCategories()]);
  const v = validateQuestionForPublish(q);

  const onSubmit = async (input: QuestionFormInput) => {
    "use server";
    return upsertQuestion({ ...input, id });
  };
  const onSetStatus = async (qid: string, status: "draft" | "reviewed" | "published" | "archived") => {
    "use server";
    return setQuestionStatus(qid, status);
  };
  const onDelete = async (qid: string) => {
    "use server";
    await deleteQuestion(qid);
  };

  return (
    <div>
      <Link href="/admin/questions" style={{ color: "#60A5FA", fontSize: "0.8rem", textDecoration: "none" }}>
        ← Bank Soal
      </Link>
      <h1
        style={{
          fontSize: "1.3rem",
          fontWeight: 600,
          color: "#F1F5F9",
          marginTop: "0.4rem",
          marginBottom: "0.25rem",
        }}
      >
        Edit Soal
      </h1>
      <div style={{ color: "#64748B", fontSize: "0.78rem", marginBottom: "1rem" }}>
        Status: <strong style={{ color: "#CBD5E1" }}>{q.status}</strong>
      </div>

      {q.status !== "published" && (
        <div
          className="glass-card"
          style={{
            padding: "0.85rem 1.1rem",
            marginBottom: "1rem",
            background: v.ok ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
            borderColor: v.ok ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)",
          }}
        >
          <div
            style={{
              color: v.ok ? "#6EE7B7" : "#FCD34D",
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: v.ok ? 0 : "0.4rem",
            }}
          >
            {v.ok ? "✓ Siap dipublish." : "Belum siap publish:"}
          </div>
          {!v.ok && (
            <ul style={{ margin: 0, padding: "0 0 0 1.2rem", color: "#FBBF24", fontSize: "0.78rem" }}>
              {v.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <QuestionForm
        initial={{
          id: q.id,
          questionText: q.questionText,
          subtest: q.subtest,
          scoringType: q.scoringType,
          difficulty: q.difficulty,
          topicId: q.topicId,
          categoryId: q.categoryId,
          explanation: q.explanation,
          explanationShort: q.explanationShort,
          sourceNote: q.sourceNote,
          status: q.status,
          options: q.options.map((o) => ({
            label: o.label,
            text: o.text,
            isCorrect: o.isCorrect,
            scoreValue: o.scoreValue,
            sortOrder: o.sortOrder,
          })),
        }}
        topics={topics.map((t) => ({ id: t.id, name: t.name, subtest: t.subtest }))}
        categories={cats}
        onSubmit={onSubmit}
        onSetStatus={onSetStatus}
        onDelete={onDelete}
      />
    </div>
  );
}
