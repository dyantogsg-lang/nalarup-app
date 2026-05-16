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

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.25rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <Link href={ROUTES.tryouts} style={{ color: "#60A5FA", textDecoration: "none" }}>
          ← Katalog
        </Link>
      </div>

      {/* Active attempt banner */}
      {hasActiveAttempt && (
        <div
          className="glass-card"
          style={{
            padding: "0.9rem 1.1rem",
            marginBottom: "1rem",
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.25)",
            fontSize: "0.85rem",
            color: "#FBBF24",
          }}
        >
          ⏳ {COPY.activeAttempt.banner}
        </div>
      )}

      {/* Header */}
      <div className="glass-card" style={{ padding: "1.75rem 1.75rem 1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.85rem", flexWrap: "wrap" }}>
          {pkg.categoryName && (
            <Badge
              bg="rgba(255,255,255,0.05)"
              fg="#CBD5E1"
              border="rgba(255,255,255,0.08)"
            >
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

        <h1
          style={{
            fontSize: "1.55rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.6rem",
            lineHeight: 1.3,
          }}
        >
          {pkg.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          {pkg.description}
        </p>
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <StatCard label="Jumlah Soal" value={`${pkg.totalQuestions} soal`} />
        <StatCard label="Durasi" value={formatDuration(pkg.durationMinutes)} />
        <StatCard
          label="Passing Grade"
          value={
            pkg.passingGradeTotal != null ? String(pkg.passingGradeTotal) : "-"
          }
        />
        <StatCard label="Mode" value={modeLabel(pkg.mode)} />
      </div>

      {/* Subtest composition */}
      {pkg.subtests.length > 0 && (
        <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.85rem" }}>
            Komposisi Subtes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {pkg.subtests.map((s) => (
              <div
                key={s.subtest}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.85rem",
                  background: "var(--bg-card2)",
                  borderRadius: "0.45rem",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {s.subtest}
                </span>
                <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  <span>{s.questionCount} soal</span>
                  {s.passingGrade != null && <span>Passing {s.passingGrade}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {pkg.history.length > 0 && (
        <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.85rem" }}>
            Riwayat Pengerjaan
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pkg.history.map((h) => (
              <HistoryRow key={h.id} h={h} />
            ))}
          </div>
        </section>
      )}

      {/* Rules */}
      <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.85rem" }}>
          Aturan Ujian
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          {COPY.exam.rules.map((r, i) => (
            <li key={i} style={{ display: "flex", gap: "0.6rem", color: "var(--text-primary)", fontSize: "0.82rem" }}>
              <span aria-hidden style={{ color: "#60A5FA" }}>
                ✓
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Sticky CTA */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          padding: "1rem 0",
          background: "linear-gradient(to top, var(--bg-base) 60%, transparent)",
        }}
      >
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
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "0.22rem 0.6rem",
        borderRadius: "999px",
        background: bg,
        color: fg,
        border: border ? `1px solid ${border}` : "none",
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="glass-card"
      style={{ padding: "0.85rem 1rem" }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function HistoryRow({
  h,
}: {
  h: {
    id: string;
    status: "in_progress" | "submitted" | "expired" | "cancelled";
    totalScore: number | null;
    isPassed: boolean | null;
    startedAt: Date;
    submittedAt: Date | null;
  };
}) {
  const date = h.submittedAt ?? h.startedAt;
  const statusLabel =
    h.status === "submitted"
      ? "Selesai"
      : h.status === "in_progress"
      ? "Berjalan"
      : h.status === "expired"
      ? "Kedaluwarsa"
      : "Dibatalkan";

  return (
    <Link
      href={h.status === "submitted" ? ROUTES.result(h.id) : ROUTES.exam(h.id)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.55rem 0.75rem",
        background: "var(--bg-card2)",
        border: "1px solid var(--border)",
        borderRadius: "0.45rem",
        textDecoration: "none",
      }}
    >
      <div>
        <div style={{ color: "var(--text-primary)", fontSize: "0.82rem" }}>
          {new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.15rem" }}>
          {statusLabel}
        </div>
      </div>
      {h.status === "submitted" && h.totalScore != null && (
        <span
          style={{
            fontWeight: 600,
            padding: "0.15rem 0.55rem",
            borderRadius: "0.35rem",
            fontSize: "0.78rem",
            background: h.isPassed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
            color: h.isPassed ? "#6EE7B7" : "#FCA5A5",
          }}
        >
          {h.totalScore}
          {h.isPassed ? " ✓" : ""}
        </span>
      )}
    </Link>
  );
}
