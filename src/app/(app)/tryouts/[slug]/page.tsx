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
import { PageHeader, StatCard, SectionCard, AlertBox } from "@/components/ui";
import { TryoutDetailSections } from "@/components/catalog/TryoutDetailSections";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TryoutDetailPage({ params }: Props) {
  const { slug } = await params;
  const { profile } = await requireUser();
  const pkg = await getPackageBySlug(slug, profile.id);

  if (!pkg) notFound();

  const modeC = modeColor(pkg.mode);
  const diffC = difficultyColor(pkg.difficulty);
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
      <nav className="mb-4 text-xs" aria-label="Breadcrumb">
        <Link
          href={ROUTES.tryouts}
          className="inline-flex items-center gap-1 font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--blue)", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Katalog Tryout
        </Link>
      </nav>

      {/* Active attempt banner */}
      {hasActiveAttempt && (
        <AlertBox variant="warning" className="mb-4">
          {COPY.activeAttempt.banner}
        </AlertBox>
      )}

      {/* Header card */}
      <div
        className="glass-card p-5 sm:p-8 mb-4 relative overflow-hidden"
        style={{
          background: isSimulation
            ? "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.02))"
            : "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.03))",
          borderColor: isSimulation ? "rgba(239,68,68,0.12)" : undefined,
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
          style={{
            background: isSimulation
              ? "radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)"
              : "radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3 relative z-[1]">
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
        <h1
          className="text-xl sm:text-2xl font-extrabold leading-tight mb-2 relative z-[1]"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          {pkg.title}
        </h1>
        <p
          className="text-sm leading-relaxed relative z-[1] max-w-[520px]"
          style={{ color: "var(--text-muted)" }}
        >
          {pkg.description}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Jumlah Soal"
          value={pkg.totalQuestions}
          sub="soal"
          accent="blue"
          icon={<IconDoc />}
        />
        <StatCard
          label="Durasi"
          value={formatDuration(pkg.durationMinutes)}
          accent="amber"
          icon={<IconClock />}
        />
        <StatCard
          label="Passing Grade"
          value={pkg.passingGradeTotal != null ? pkg.passingGradeTotal : "-"}
          accent="green"
          icon={<IconTarget />}
        />
        <StatCard
          label="Skor Terbaik"
          value={bestScore != null ? bestScore : "-"}
          sub={submittedCount > 0 ? `${submittedCount}x dikerjakan` : undefined}
          accent="violet"
          icon={<IconBolt />}
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

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 sm:sticky sm:bottom-0 sm:left-auto sm:right-auto"
        style={{
          background: "linear-gradient(to top, var(--bg-base) 80%, transparent)",
        }}
      >
        <div
          className="max-w-[900px] mx-auto px-4 py-3"
        >
          <div
            className="glass-card flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          >
            {/* Compact info - hidden on very small screens */}
            <div
              className="hidden sm:flex gap-4 items-center text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="inline-flex items-center gap-1">
                <IconDoc /> {pkg.totalQuestions} soal
              </span>
              <span className="inline-flex items-center gap-1">
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

// ─── Presentational helpers ─────────────────────────────────────────────────

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
      className="text-[0.72rem] font-semibold px-2.5 py-1 rounded-full"
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
