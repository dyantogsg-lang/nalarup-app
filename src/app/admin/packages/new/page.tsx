import { listAllCategories } from "@/lib/admin/packageQueries";
import { upsertPackage, type PackageFormInput } from "@/lib/admin/packageActions";
import { PackageForm } from "@/components/admin/PackageForm";

export default async function NewPackagePage() {
  const cats = await listAllCategories();

  const onSubmit = async (input: PackageFormInput) => {
    "use server";
    return upsertPackage(input);
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.25rem" }}>
        Paket Baru
      </h1>
      <p style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
        Isi informasi dasar. Setelah dibuat, kamu bisa meng-assign soal dan publish.
      </p>
      <PackageForm categories={cats} onSubmit={onSubmit} />
    </div>
  );
}
