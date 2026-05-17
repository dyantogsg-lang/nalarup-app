"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CatalogPackage } from "@/lib/packages/queries";
import {
  ctaForAttemptStatus,
  difficultyColor,
  difficultyLabel,
  formatDuration,
  modeColor,
  modeLabel,
} from "@/lib/packages/format";
import { ROUTES } from "@/lib/constants/routes";
import { COPY } from "@/lib/constants/copy";
import { PageHeader, SectionCard, StatCard } from "@/components/ui";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  slug: string;
  name: string;
}

interface Props {
  categories: Category[];
  packages: CatalogPackage[];
}

const MODE_OPTIONS = [
  { value: "all", label: "Semua Mode" },
  { value: "simulation", label: "Simulasi" },
  { value: "practice", label: "Latihan" },
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Semua Level" },
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

const PAGE_SIZE = 12;

// ─── Main Component ─────────────────────────────────────────────────────────

export function TryoutsCatalog({ categories, packages }: Props) {
  const router = useRouter();

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setIsSearching(true);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setDebouncedSearch(value.trim());
        setIsSearching(false);
        setPage(1);
      }, 400);
      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = packages;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      result = result.filter((p) => p.categorySlug === category);
    }

    if (mode !== "all") {
      result = result.filter((p) => p.mode === mode);
    }

    if (difficulty !== "all") {
      result = result.filter((p) => p.difficulty === difficulty);
    }

    return result;
  }, [packages, debouncedSearch, category, mode, difficulty]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const totalSoal = packages.reduce((sum, p) => sum + p.totalQuestions, 0);

  const hasActiveFilter =
    category !== "all" ||
    mode !== "all" ||
    difficulty !== "all" ||
    debouncedSearch.length > 0;

  const resetAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("all");
    setMode("all");
    setDifficulty("all");
    setPage(1);
    setIsSearching(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4">
      {/* Header */}
      <PageHeader
        title="Katalog Tryout"
        subtitle="Pilih paket tryout sesuai target latihan. Semua paket open access."
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Paket" value={packages.length} accent="blue" />
        <StatCard
          label="Total Soal"
          value={totalSoal.toLocaleString("id-ID")}
          accent="violet"
        />
        <StatCard label="Kategori" value={categories.length} accent="green" />
      </div>

      {/* Filters */}
      <SectionCard padding="sm" className="mb-6">
        {/* Search */}
        <div className="relative mb-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-dim)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {isSearching && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Mencari..."
              role="status"
            >
              <div className="w-4 h-4 border-2 border-[var(--text-dim)] border-t-[var(--blue)] rounded-full animate-spin" />
            </div>
          )}
          <input
            type="search"
            placeholder="Cari paket tryout…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Cari paket tryout"
            className="w-full py-3 pl-10 pr-10 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Filter kategori">
          <FilterChip
            label="Semua"
            active={category === "all"}
            onClick={() => { setCategory("all"); setPage(1); }}
          />
          {categories.map((c) => (
            <FilterChip
              key={c.slug}
              label={c.name}
              active={category === c.slug}
              onClick={() => { setCategory(c.slug); setPage(1); }}
            />
          ))}
        </div>

        {/* Mode + difficulty */}
        <div className="flex flex-wrap gap-3 items-center">
          <FilterSelect
            label="Mode"
            value={mode}
            options={MODE_OPTIONS}
            onChange={(v) => { setMode(v); setPage(1); }}
          />
          <FilterSelect
            label="Level"
            value={difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(v) => { setDifficulty(v); setPage(1); }}
          />
          {hasActiveFilter && (
            <button
              onClick={resetAll}
              className="ml-auto px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              ✕ Reset filter
            </button>
          )}
        </div>
      </SectionCard>

      {/* Result count */}
      <div
        className="text-xs mb-4 font-medium"
        style={{ color: "var(--text-muted)" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {filtered.length} paket ditemukan
        {hasActiveFilter && ` · filter aktif`}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilter} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((pkg) => (
              <PackageCardRedesigned key={pkg.id} pkg={pkg} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 mb-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                aria-label="Halaman sebelumnya"
              >
                ←
              </button>
              <span
                className="text-xs font-medium px-3"
                style={{ color: "var(--text-muted)" }}
              >
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                aria-label="Halaman berikutnya"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── PackageCard (no button inside Link) ────────────────────────────────────

function PackageCardRedesigned({ pkg }: { pkg: CatalogPackage }) {
  const router = useRouter();
  const modeC = modeColor(pkg.mode);
  const diffC = difficultyColor(pkg.difficulty);
  const cta = ctaForAttemptStatus(pkg.lastAttemptStatus);
  const hasAttempt = pkg.attemptCount > 0;

  const accent =
    pkg.mode === "simulation"
      ? "var(--danger)"
      : pkg.categoryName?.toLowerCase().includes("twk")
      ? "var(--blue)"
      : pkg.categoryName?.toLowerCase().includes("tiu")
      ? "var(--violet)"
      : pkg.categoryName?.toLowerCase().includes("tkp")
      ? "var(--green)"
      : "var(--blue)";

  return (
    <article
      className="glass-card flex flex-col gap-3 p-4 sm:p-5 transition-all hover:border-[var(--blue)] cursor-pointer"
      style={{ borderLeft: `3px solid ${accent}` }}
      onClick={() => router.push(ROUTES.tryoutDetail(pkg.slug))}
      role="link"
      aria-label={`Tryout: ${pkg.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(ROUTES.tryoutDetail(pkg.slug));
        }
      }}
    >
      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {pkg.categoryName && (
          <Badge bg="var(--bg-card2)" fg="var(--text-primary)" border="var(--border)">
            {pkg.categoryName}
          </Badge>
        )}
        <Badge bg={modeC.bg} fg={modeC.fg} border={modeC.border}>
          {modeLabel(pkg.mode)}
        </Badge>
        <Badge bg={diffC.bg} fg={diffC.fg}>
          {difficultyLabel(pkg.difficulty)}
        </Badge>
      </div>

      {/* Title + description */}
      <div className="flex-1">
        <h3
          className="text-[0.95rem] font-bold leading-snug mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {pkg.title}
        </h3>
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: "var(--text-muted)" }}
        >
          {pkg.description}
        </p>
      </div>

      {/* Stats row */}
      <div
        className="flex flex-wrap gap-3 items-center text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="inline-flex items-center gap-1">
          <IconDoc /> {pkg.totalQuestions} soal
        </span>
        <span className="inline-flex items-center gap-1">
          <IconClock /> {formatDuration(pkg.durationMinutes)}
        </span>
        {pkg.passingGradeTotal != null && (
          <span className="inline-flex items-center gap-1">
            <IconTarget /> PG {pkg.passingGradeTotal}
          </span>
        )}
      </div>

      {/* User status */}
      {hasAttempt && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
          style={{
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            {pkg.lastAttemptStatus === "in_progress"
              ? "Sedang berjalan"
              : "Skor terakhir"}
          </span>
          {pkg.lastAttemptStatus === "submitted" && (
            <span
              className="font-semibold px-2 py-0.5 rounded"
              style={{
                background: pkg.lastAttemptIsPassed
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(239,68,68,0.1)",
                color: pkg.lastAttemptIsPassed ? "var(--green)" : "var(--danger)",
              }}
            >
              {pkg.lastAttemptScore ?? "-"}
              {pkg.lastAttemptIsPassed ? " ✓" : ""}
            </span>
          )}
          {pkg.lastAttemptStatus === "in_progress" && (
            <span style={{ color: "var(--amber)" }} className="font-semibold">
              ⏳
            </span>
          )}
        </div>
      )}

      {/* CTA - using a span styled as button, NOT a button inside Link */}
      <span
        className={`mt-auto text-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
          cta.variant === "primary" ? "btn-primary" : ""
        }`}
        style={
          cta.variant === "ghost"
            ? {
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                display: "block",
              }
            : { display: "block" }
        }
        aria-hidden="true"
      >
        {cta.label}
      </span>
    </article>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div
      className="glass-card flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-dim)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50 mb-4"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <h3
        className="text-base font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {hasFilter ? COPY.empty.filterResult : COPY.empty.catalog}
      </h3>
      <p
        className="text-sm max-w-[360px]"
        style={{ color: "var(--text-muted)" }}
      >
        {hasFilter ? COPY.empty.filterResultSub : COPY.empty.catalogSub}
      </p>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
      style={{
        border: active
          ? "1px solid rgba(37,99,235,0.4)"
          : "1px solid var(--border)",
        background: active ? "rgba(37,99,235,0.1)" : "var(--bg-base)",
        color: active ? "var(--blue)" : "var(--text-muted)",
        fontWeight: active ? 700 : 500,
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs">
      <span className="font-medium" style={{ color: "var(--text-dim)" }}>
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="py-1.5 px-2.5 rounded-lg text-xs outline-none cursor-pointer"
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({
  children,
  bg,
  fg,
  border,
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  border?: string;
}) {
  return (
    <span
      className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: bg,
        color: fg,
        border: border ? `1px solid ${border}` : "none",
      }}
    >
      {children}
    </span>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconDoc() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
