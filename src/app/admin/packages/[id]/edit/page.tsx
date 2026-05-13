import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAdminPackageById,
  listAllCategories,
  validatePackageForPublish,
} from "@/lib/admin/packageQueries";
import { listAdminQuestions } from "@/lib/admin/questionQueries";
import {
  assignQuestionToPackage,
  deletePackage,
  removeQuestionFromPackage,
  setPackageStatus,
  upsertPackage,
  type PackageFormInput,
} from "@/lib/admin/packageActions";
import { PackageForm } from "@/components/admin/PackageForm";
import { AssignedQuestionsManager } from "@/components/admin/AssignedQuestionsManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params;
  const pkg = await getAdminPackageById(id);
  if (!pkg) notFound();

  const [cats, candidates, validation] = await Promise.all([
    listAllCategories(),
    listAdminQuestions({}),
    validatePackageForPublish(pkg),
  ]);

  const onSubmit = async (input: PackageFormInput) => {
    "use server";
    return upsertPackage({ ...input, id });
  };
  const onSetStatus = async (pid: string, status: "draft" | "review" | "published" | "archived") => {
    "use server";
    return setPackageStatus(pid, status);
  };
  const onDelete = async (pid: string) => {
    "use server";
    await deletePackage(pid);
  };
  const onAssign = async (pid: string, qid: string) => {
    "use server";
    return assignQuestionToPackage(pid, qid);
  };
  const onRemove = async (pid: string, qid: string) => {
    "use server";
    await removeQuestionFromPackage(pid, qid);
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/admin/packages" style={{ color: "#60A5FA", fontSize: "0.8rem", textDecoration: "none" }}>
          ← Paket Tryout
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
          {pkg.title}
        </h1>
        <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
          <code>/{pkg.slug}</code> · status <strong style={{ color: "#CBD5E1" }}>{pkg.status}</strong>
        </div>
      </div>

      {/* Validation summary */}
      {pkg.status !== "published" && (
        <div
          className="glass-card"
          style={{
            padding: "0.9rem 1.1rem",
            marginBottom: "1rem",
            background: validation.ok ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
            borderColor: validation.ok ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)",
          }}
        >
          <div
            style={{
              color: validation.ok ? "#6EE7B7" : "#FCD34D",
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: validation.ok ? 0 : "0.4rem",
            }}
          >
            {validation.ok
              ? "✓ Siap dipublish — seluruh kriteria terpenuhi."
              : "Belum siap publish:"}
          </div>
          {!validation.ok && (
            <ul style={{ margin: 0, padding: "0 0 0 1.2rem", color: "#FBBF24", fontSize: "0.8rem" }}>
              {validation.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: "1rem",
        }}
      >
        <PackageForm
          initial={{
            id: pkg.id,
            title: pkg.title,
            slug: pkg.slug,
            description: pkg.description,
            categoryId: pkg.categoryId,
            mode: pkg.mode,
            difficulty: pkg.difficulty,
            durationMinutes: pkg.durationMinutes,
            totalQuestions: pkg.totalQuestions,
            isOpenAccess: pkg.isOpenAccess,
            passingGradeTotal: pkg.passingGradeTotal,
            passingGradeTwk: pkg.passingGradeTwk,
            passingGradeTiu: pkg.passingGradeTiu,
            passingGradeTkp: pkg.passingGradeTkp,
            targetSafeScore: pkg.targetSafeScore,
            showRanking: pkg.showRanking,
            status: pkg.status,
            subtests: pkg.subtests.map((s) => ({
              subtest: s.subtest,
              questionCount: s.questionCount,
              passingGrade: s.passingGrade,
              sortOrder: s.sortOrder,
            })),
          }}
          categories={cats}
          onSubmit={onSubmit}
          onSetStatus={onSetStatus}
          onDelete={onDelete}
        />

        <section className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "#F1F5F9", fontWeight: 600, marginBottom: "0.15rem" }}>
            Soal ter-assign
          </h3>
          <p style={{ color: "#64748B", fontSize: "0.75rem", marginBottom: "0.9rem" }}>
            Tambahkan atau keluarkan soal dari paket. Urutan ditentukan oleh urutan assign.
          </p>
          <AssignedQuestionsManager
            packageId={pkg.id}
            initialAssigned={pkg.assignedQuestions}
            candidates={candidates.map((c) => ({
              id: c.id,
              questionText: c.questionText,
              subtest: c.subtest,
              status: c.status,
            }))}
            onAssign={onAssign}
            onRemove={onRemove}
          />
        </section>
      </div>
    </div>
  );
}
