import { requireUser } from "@/lib/auth/requireUser";
import {
  listCategories,
  listPackages,
  type PackageDifficulty,
  type PackageMode,
} from "@/lib/packages/queries";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { PackageCard } from "@/components/catalog/PackageCard";
import { COPY } from "@/lib/constants/copy";

interface Props {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    mode?: string;
    diff?: string;
  }>;
}

export default async function TryoutsPage({ searchParams }: Props) {
  const { profile } = await requireUser();
  const sp = await searchParams;

  const cats = await listCategories();
  const packages = await listPackages({
    userId: profile.id,
    search: sp.q,
    categorySlug: sp.cat,
    mode: (sp.mode as PackageMode) ?? undefined,
    difficulty: (sp.diff as PackageDifficulty) ?? undefined,
  });

  const activeFilters = [sp.q, sp.cat, sp.mode, sp.diff].filter(
    (v) => v && v !== "all"
  ).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#F1F5F9",
            marginBottom: "0.25rem",
          }}
        >
          Katalog Tryout
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
          Pilih paket tryout sesuai target latihan. Semua paket open access.
        </p>
      </div>

      {/* Filters */}
      <CatalogFilters categories={cats} />

      {/* Result count */}
      <div
        style={{
          color: "#64748B",
          fontSize: "0.78rem",
          marginBottom: "1rem",
        }}
      >
        {packages.length} paket ditemukan
        {activeFilters > 0 && ` (filter aktif: ${activeFilters})`}
      </div>

      {/* Grid */}
      {packages.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔎</div>
          <h3
            style={{
              color: "#F1F5F9",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.4rem",
            }}
          >
            {activeFilters > 0 ? COPY.empty.filterResult : COPY.empty.catalog}
          </h3>
          <p style={{ color: "#64748B", fontSize: "0.825rem" }}>
            {activeFilters > 0
              ? COPY.empty.filterResultSub
              : COPY.empty.catalogSub}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}
    </div>
  );
}
