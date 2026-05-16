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

  // Stats
  const totalSoal = packages.reduce((sum, p) => sum + p.totalQuestions, 0);
  const totalKategori = cats.length;

  // Featured package (SKD Simulasi Penuh pertama)
  const featuredIdx = packages.findIndex((p) => p.mode === "simulation" && p.totalQuestions >= 100);
  const featured = featuredIdx >= 0 ? packages[featuredIdx] : null;
  const regularPackages = packages.filter((_, i) => i !== featuredIdx);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1rem" }}>
      {/* ===== HEADER ===== */}
      <div style={{
        marginBottom: "1.75rem",
        padding: "2rem 2.25rem",
        background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.03))",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
      }}>
        <h1 style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "0.4rem",
          letterSpacing: "-0.03em",
        }}>
          Katalog Tryout
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0, marginBottom: "1.25rem", lineHeight: 1.6 }}>
          Pilih paket tryout sesuai target latihan. Semua paket open access.
        </p>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {[
            { value: String(packages.length), label: "Paket" },
            { value: totalSoal.toLocaleString("id-ID"), label: "Total Soal" },
            { value: String(totalKategori), label: "Kategori" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
              <span className="num" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <CatalogFilters categories={cats} />

      {/* Result count */}
      <div style={{
        color: "var(--text-muted)",
        fontSize: "0.78rem",
        marginBottom: "1.25rem",
      }}>
        {packages.length} paket ditemukan
        {activeFilters > 0 && ` (filter aktif: ${activeFilters})`}
      </div>

      {/* Grid */}
      {packages.length === 0 ? (
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 style={{
            color: "var(--text-primary)",
            fontSize: "1.05rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}>
            {activeFilters > 0 ? COPY.empty.filterResult : COPY.empty.catalog}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: 360, margin: "0 auto" }}>
            {activeFilters > 0
              ? COPY.empty.filterResultSub
              : COPY.empty.catalogSub}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Featured card */}
          {featured && activeFilters === 0 && (
            <PackageCard pkg={featured} featured />
          )}

          {/* Regular grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}>
            {(activeFilters > 0 ? packages : regularPackages).map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
