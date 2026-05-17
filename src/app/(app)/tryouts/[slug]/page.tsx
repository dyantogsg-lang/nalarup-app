import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { getPackageBySlug } from "@/lib/packages/queries";
import { createOrResumeAttempt } from "@/lib/packages/actions";
import { StartExamButton } from "@/components/catalog/StartExamButton";
import { COPY } from "@/lib/constants/copy";
import { ROUTES } from "@/lib/constants/routes";
import {
  difficultyColor,
  difficultyLabel,
  formatDuration,
  modeColor,
  modeLabel,
} from "@/lib/packages/format";
import { GlassCard, ProgressRing, Button3D } from "@/components/ui";
import { TryoutDetailSections } from "@/components/catalog/TryoutDetailSections";

interface Props {
  params: Promise<{ slug: string }>;
}

// Neon difficulty map
const NEON_DIFFICULTY: Record<string, { bg: string; fg: string; glow: string }> = {
  easy: { bg: "rgba(34,197,94,0.12)", fg: "#22c55e", glow: "0 0 8px rgba(34,197,94,0.4)" },
  medium: { bg: "rgba(245,158,11,0.12)", fg: "#f59e0b", glow: "0 0 8px rgba(245,158,11,0.4)" },
  hard: { bg: "rgba(239,68,68,0.12)", fg: "#ef4444", glow: "0 0 8px rgba(239,68,68,0.4)" },
};

export default async function TryoutDetailPage({ params }: Props) {
  const { slug } = await params;
  const { profile } = await requireUser();
  const pkg = await getPackageBySlug(slug, profile.id);

  if (!pkg) notFound();

  const modeC = modeColor(pkg.mode);
  const diffC = NEON_DIFFICULTY[pkg.difficulty] || NEON_DIFFICULTY.easy;
  const isSimulation = pkg.mode === "simulation";

  const hasActiveAttempt = pkg.activeAttempt !== null;
  const submittedCount = pkg.history.filter((h) => h.status === "submitted").length;
  const ctaLabel = hasActiveAttempt
    ? COPY.cta.continueTryout
    : submittedCount > 0
    ? COPY.cta.retryTryout
    : COPY.cta.startTryout;

  const startAction = async (s: string) => {
    "use server";
    await createOrResumeAttempt(s);
  };

  // Best score from history
  const submittedHistory = pkg.history.filter(
    (h) => h.status === "submitted" && h.totalScore != null
  );
  const bestScore =
    submittedHistory.length > 0
      ? Math.max(...submittedHistory.map((h) => h.totalScore!))
      : null;

  return (
    <div className="max-w-[900px] mx-auto px-4 pb-28">
      {/* Breadcrumb */}
      <nav className="mb-5 text-xs" aria-label="Breadcrumb">
        <Link
          href={ROUTES.tryouts}
          className="inline-flex items-center gap-1.5 font-medium transition-colors text-blue-400 hover:text-blue-300 no-underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Katalog Tryout
        </Link>
      </nav>

      {/* Active attempt banner */}
      {hasActiveAttempt && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium flex items-center gap-2">
          <span className="text-lg">⚡</span>
          {COPY.activeAttempt.banner}
        </div>
      )}

      {/* Header card — glass panel */}
      <GlassCard
        glow={isSimulation ? "orange" : "blue"}
        className="!p-6 sm:!p-8 mb-5 relative overflow-hidden"
      >
        {/* Decorative neon blob */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none opacity-40"
          style={{
            background: isSimulation
              ? "radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4 relative z-[1]">
          {pkg.categoryName && (
            <span className="text-[0.72rem] font-semibold px-3 py-1 rounded-full bg-white/[0.06] text-[var(--text-primary)] border border-white/10">
              {pkg.categoryName}
            </span>
          )}
          <span
            className="text-[0.72rem] font-semibold px-3 py-1 rounded-full"
            style={{
              background: modeC.bg,
              color: modeC.fg,
              border: `1px solid ${modeC.border}`,
            }}
          >
            {modeLabel(pkg.mode)}
          </span>
          <span
            className="text-[0.72rem] font-bold px-3 py-1 rounded-full"
            style={{
              background: diffC.bg,
              color: diffC.fg,
              boxShadow: diffC.glow,
            }}
          >
            {difficultyLabel(pkg.difficulty)}
          </span>
        </div>

        {/* Title + description */}
        <h1 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2 relative z-[1] text-[var(--text-primary)]" style={{ letterSpacing: "-0.02em" }}>
          {pkg.title}
        </h1>
        <p className="text-sm leading-relaxed relative z-[1] max-w-[520px] text-[var(--text-muted)]">
          {pkg.description}
        </p>
      </GlassCard>

      {/* Stat cards — neon accents */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCardV4
          label="Jumlah Soal"
          value={String(pkg.totalQuestions)}
          sub="soal"
          color="#3b82f6"
          icon={<IconDoc />}
        />
        <StatCardV4
          label="Durasi"
          value={formatDuration(pkg.durationMinutes)}
          color="#f59e0b"
          icon={<IconClock />}
        />
        <StatCardV4
          label="Passing Grade"
          value={pkg.passingGradeTotal != null ? String(pkg.passingGradeTotal) : "-"}
          color="#22c55e"
          icon={<IconTarget />}
        />
        <StatCardV4
          label="Skor Terbaik"
          value={bestScore != null ? String(bestScore) : "-"}
          sub={submittedCount > 0 ? `${submittedCount}x dikerjakan` : undefined}
          color="#8b5cf6"
          icon={<IconBolt />}
          ring={bestScore != null ? { value: bestScore, max: bestScore > 100 ? 1000 : 100 } : undefined}
        />
      </div>

      {/* Collapsible sections (client component) */}
      <TryoutDetailSections
        subtests={pkg.subtests}
        totalQuestions={pkg.totalQuestions}
        history={pkg.history}
        bestScore={bestScore}
        rules={COPY.exam.rules}
      />

      {/* Sticky CTA — glass bar with 3D button */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 sm:sticky sm:bottom-0 sm:left-auto sm:right-auto"
        style={{
          background: "linear-gradient(to top, #0A0E1A 80%, transparent)",
        }}
      >
        <div className="max-w-[900px] mx-auto px-4 py-3">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl flex items-center justify-between gap-3 px-5 py-3.5">
            {/* Compact info - hidden on very small screens */}
            <div className="hidden sm:flex gap-4 items-center text-xs text-[var(--text-dim)]">
              <span className="inline-flex items-center gap-1.5">
                <IconDoc /> {pkg.totalQuestions} soal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconClock /> {formatDuration(pkg.durationMinutes)}
              </span>
            </div>
            <div className="flex-1 sm:flex-none">
              <StartExamButton
                slug={pkg.slug}
                durationMinutes={pkg.durationMinutes}
                totalQuestions={pkg.totalQuestions}
                ctaLabel={ctaLabel}
                hasActiveAttempt={hasActiveAttempt}
                startAction={startAction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StatCard V4 ────────────────────────────────────────────────────────────

function StatCardV4({
  label,
  value,
  sub,
  color,
  icon,
  ring,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  ring?: { value: number; max: number };
}) {
  return (
    <div
      className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4 flex flex-col gap-2 overflow-hidden transition-all hover:border-white/15 hover:bg-white/[0.05]"
    >
      {/* Neon accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between">
        <span className="text-[var(--text-dim)]" style={{ color: `${color}99` }}>
          {icon}
        </span>
        {ring && (
          <ProgressRing
            value={ring.value}
            max={ring.max}
            size={32}
            strokeWidth={3}
            color={color}
          />
        )}
      </div>

      <div>
        <div className="text-lg font-bold num text-[var(--text-primary)]">{value}</div>
        <div className="text-[0.68rem] text-[var(--text-dim)] mt-0.5">{label}</div>
        {sub && (
          <div className="text-[0.62rem] text-[var(--text-dim)] mt-0.5 opacity-70">{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconDoc() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
