import { listAllTopics } from "@/lib/admin/questionQueries";
import { listAllCategories } from "@/lib/admin/packageQueries";
import { upsertQuestion, type QuestionFormInput } from "@/lib/admin/questionActions";
import { QuestionForm } from "@/components/admin/QuestionForm";

export default async function NewQuestionPage() {
  const [topics, cats] = await Promise.all([listAllTopics(), listAllCategories()]);

  const onSubmit = async (input: QuestionFormInput) => {
    "use server";
    return upsertQuestion(input);
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.25rem" }}>
        Soal Baru
      </h1>
      <p style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
        Tulis soal, tambahkan opsi dan pembahasan, lalu publish setelah direview.
      </p>
      <QuestionForm
        topics={topics.map((t) => ({ id: t.id, name: t.name, subtest: t.subtest }))}
        categories={cats}
        onSubmit={onSubmit}
      />
    </div>
  );
}
