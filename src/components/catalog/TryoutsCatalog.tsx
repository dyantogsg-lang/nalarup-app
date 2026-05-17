"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { GlassCard, Button3D, ProgressRing, PageTransition } from "@/components/ui";

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

// Neon difficulty colors
const NEON_DIFFICULTY: Record<string, { bg: string; fg: string; glow: string }> = {
  easy: { bg: "rgba(34,197,94,0.12)", fg: "#22c55e", glow: "0 0 8px rgba(34,197,94,0.4)" },
  medium: { bg: "rgba(245,158,11,0.12)", fg: "#f59e0b", glow: "0 0 8px rgba(245,158,11,0.4)" },
  hard: { bg: "rgba(239,68,68,0.12)", fg: "#ef4444", glow: "0 0 8px rgba(239,68,68,0.4)" },
};

// ─── Stagger animation variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

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
  const [searchFocused, setSearchFocused] = useState(false);

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
    <PageTransition className="max-w-[1100px] mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2">
          Katalog Tryout
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Pilih paket tryout sesuai target latihan. Semua paket open access.
        </p>
      </div>

      {/* Quick stats — glass HUD */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard glow="blue" className="!p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 num">{packages.length}</div>
          <div className="text-[0.7rem] text-[var(--text-dim)] mt-1">Paket</div>
        </GlassCard>
        <GlassCard glow="purple" className="!p-4 text-center">
          <div className="text-2xl font-bold text-violet-400 num">
            {totalSoal.toLocaleString("id-ID")}
          </div>
          <div className="text-[0.7rem] text-[var(--text-dim)] mt-1">Total Soal</div>
        </GlassCard>
        <GlassCard glow="green" className="!p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400 num">{categories.length}</div>
          <div className="text-[0.7rem] text-[var(--text-dim)] mt-1">Kategori</div>
        </GlassCard>
      </div>

      {/* Filters — glass panel */}
      <GlassCard className="!p-4 sm:!p-5 mb-6">
        {/* Search with glow focus */}
        <div
          className="relative mb-4 rounded-xl transition-shadow duration-300"
          style={{
            boxShadow: searchFocused
              ? "0 0 20px rgba(59,130,246,0.25), inset 0 0 0 1px rgba(59,130,246,0.4)"
              : "none",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={searchFocused ? "#3b82f6" : "var(--text-dim)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {isSearching && (
            <div
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              aria-label="Mencari..."
              role="status"
            >
              <div className="w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
          <input
            type="search"
            placeholder="Cari paket tryout…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Cari paket tryout"
            className="w-full py-3 pl-11 pr-10 rounded-xl text-sm outline-none transition-all bg-white/[0.04] border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:bg-white/[0.06]"
          />
        </div>

        {/* Category chips — glass style */}
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter kategori">
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
              className="ml-auto px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer bg-white/[0.05] border border-white/10 text-[var(--text-muted)] hover:bg-white/[0.1] hover:text-white"
            >
              ✕ Reset filter
            </button>
          )}
        </div>
      </GlassCard>

      {/* Result count */}
      <div
        className="text-xs mb-4 font-medium text-[var(--text-muted)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {filtered.length} paket ditemukan
        {hasActiveFilter && " · filter aktif"}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilter} />
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={`${category}-${mode}-${difficulty}-${debouncedSearch}-${page}`}
          >
            {paginated.map((pkg) => (
              <motion.div key={pkg.id} variants={cardVariants}>
                <PackageCardV4 pkg={pkg} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination — 3D ghost buttons */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 mb-4">
              <Button3D
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </Button3D>
              <span className="text-xs font-bold text-[var(--text-muted)] px-3 num">
                {page} / {totalPages}
              </span>
              <Button3D
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </Button3D>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}

// ─── PackageCard V4 ─────────────────────────────────────────────────────────

function PackageCardV4({ pkg }: { pkg: CatalogPackage }) {
  const router = useRouter();
  const diffC = NEON_DIFFICULTY[pkg.difficulty] || NEON_DIFFICULTY.easy;
  const cta = ctaForAttemptStatus(pkg.lastAttemptStatus);
  const hasAttempt = pkg.attemptCount > 0;

  // Best score for mini ring
  const bestScore = pkg.lastAttemptStatus === "submitted" ? pkg.lastAttemptScore : null;

  return (
    <article
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:bg-white/[0.06] hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
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
      {/* Gradient overlay on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Top row: badges + mini score ring */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex flex-wrap gap-1.5 items-center">
          {pkg.categoryName && (
            <span className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] text-[var(--text-primary)] border border-white/10">
              {pkg.categoryName}
            </span>
          )}
          <span
            className="text-[0.68rem] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: diffC.bg,
              color: diffC.fg,
              boxShadow: diffC.glow,
            }}
          >
            {difficultyLabel(pkg.difficulty)}
          </span>
        </div>

        {/* Mini score ring */}
        {bestScore != null && (
          <ProgressRing
            value={bestScore}
            max={bestScore > 100 ? 1000 : 100}
            size={36}
            strokeWidth={3}
            color={pkg.lastAttemptIsPassed ? "#22c55e" : "#3b82f6"}
          />
        )}
      </div>

      {/* Title + description */}
      <div className="flex-1 relative z-10">
        <h3 className="text-[0.95rem] font-bold leading-snug mb-1 text-[var(--text-primary)] group-hover:text-white transition-colors">
          {pkg.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2 text-[var(--text-muted)]">
          {pkg.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 items-center text-xs text-[var(--text-dim)] relative z-10">
        <span className="inline-flex items-center gap-1">
          <IconDoc /> {pkg.totalQuestions} soal
        </span>
        <span className="inline-flex items-center gap-1">
          <IconClock /> {formatDuration(pkg.durationMinutes)}
        </span>
        {pkg.mode === "simulation" && (
          <span className="inline-flex items-center gap-1 text-red-400">
            ⚡ Simulasi
          </span>
        )}
      </div>

      {/* User status bar */}
      {hasAttempt && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] relative z-10">
          <span className="text-[var(--text-dim)]">
            {pkg.lastAttemptStatus === "in_progress"
              ? "Sedang berjalan"
              : "Skor terakhir"}
          </span>
          {pkg.lastAttemptStatus === "submitted" && (
            <span
              className="font-bold px-2 py-0.5 rounded"
              style={{
                background: pkg.lastAttemptIsPassed
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.12)",
                color: pkg.lastAttemptIsPassed ? "#22c55e" : "#ef4444",
              }}
            >
              {pkg.lastAttemptScore ?? "-"}
              {pkg.lastAttemptIsPassed ? " ✓" : ""}
            </span>
          )}
          {pkg.lastAttemptStatus === "in_progress" && (
            <span className="font-semibold text-amber-400">⏳</span>
          )}
        </div>
      )}

      {/* CTA indicator */}
      <div
        className={`mt-auto text-center py-2.5 px-4 rounded-xl text-sm font-semibold relative z-10 transition-all ${
          cta.variant === "primary"
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/25 group-hover:shadow-[0_0_12px_rgba(34,197,94,0.2)]"
            : "bg-white/[0.05] text-[var(--text-primary)] border border-white/10 group-hover:bg-white/[0.1]"
        }`}
        aria-hidden="true"
      >
        {cta.label}
      </div>
    </article>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">
        {hasFilter ? COPY.empty.filterResult : COPY.empty.catalog}
      </h3>
      <p className="text-sm max-w-[360px] text-[var(--text-muted)]">
        {hasFilter ? COPY.empty.filterResultSub : COPY.empty.catalogSub}
      </p>
    </GlassCard>
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
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
        active
          ? "bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
          : "bg-white/[0.04] border-white/10 text-[var(--text-muted)] hover:bg-white/[0.08] hover:border-white/20"
      }`}
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
      <span className="font-medium text-[var(--text-dim)]">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="py-1.5 px-2.5 rounded-lg text-xs outline-none cursor-pointer bg-white/[0.04] border border-white/10 text-[var(--text-primary)] focus:border-blue-500/40 transition-colors"
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
