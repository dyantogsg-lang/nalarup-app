import Link from "next/link";
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
import { SaveStar } from "./SaveStar";

export function PackageCard({ pkg }: { pkg: CatalogPackage }) {
  const modeC = modeColor(pkg.mode);
  const diffC = difficultyColor(pkg.difficulty);
  const cta = ctaForAttemptStatus(pkg.lastAttemptStatus);
  const hasAttempt = pkg.attemptCount > 0;

  return (
    <article
      className="glass-card"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        minHeight: 230,
      }}
    >
      {/* Top meta */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
        {pkg.categoryName && (
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
              background: "var(--bg-card2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {pkg.categoryName}
          </span>
        )}
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.55rem",
            borderRadius: "999px",
            background: modeC.bg,
            color: modeC.fg,
            border: `1px solid ${modeC.border}`,
          }}
        >
          {modeLabel(pkg.mode)}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.55rem",
            borderRadius: "999px",
            background: diffC.bg,
            color: diffC.fg,
          }}
        >
          {difficultyLabel(pkg.difficulty)}
        </span>
        <span style={{ marginLeft: "auto" }}>
          <SaveStar slug={pkg.slug} />
        </span>
      </div>

      {/* Title */}
      <div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "0.35rem",
            lineHeight: 1.35,
          }}
        >
          {pkg.title}
        </h3>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {pkg.description}
        </p>
      </div>

      {/* Stat row */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <span>◉ {pkg.totalQuestions} soal</span>
        <span>◷ {formatDuration(pkg.durationMinutes)}</span>
        {pkg.passingGradeTotal != null && (
          <span>◈ Passing {pkg.passingGradeTotal}</span>
        )}
      </div>

      {/* User status */}
      {hasAttempt && (
        <div
          style={{
            padding: "0.5rem 0.65rem",
            borderRadius: "0.45rem",
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            fontSize: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            {pkg.lastAttemptStatus === "in_progress"
              ? "Sedang berjalan"
              : `Skor terakhir`}
          </span>
          {pkg.lastAttemptStatus === "submitted" && (
            <span
              style={{
                fontWeight: 600,
                padding: "0.12rem 0.45rem",
                borderRadius: "0.3rem",
                background: pkg.lastAttemptIsPassed
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(239,68,68,0.12)",
                color: pkg.lastAttemptIsPassed ? "#6EE7B7" : "#FCA5A5",
              }}
            >
              {pkg.lastAttemptScore ?? "-"}
              {pkg.lastAttemptIsPassed ? " ✓" : ""}
            </span>
          )}
          {pkg.lastAttemptStatus === "in_progress" && (
            <span style={{ color: "#FBBF24", fontWeight: 600 }}>⏳</span>
          )}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
        <Link
          href={ROUTES.tryoutDetail(pkg.slug)}
          style={{ flex: 1 }}
        >
          <button
            className={cta.variant === "primary" ? "btn-primary" : ""}
            style={{
              width: "100%",
              padding: "0.55rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              borderRadius: "0.5rem",
              cursor: "pointer",
              ...(cta.variant === "ghost"
                ? {
                    background: "var(--bg-card2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }
                : {}),
            }}
          >
            {cta.label}
          </button>
        </Link>
      </div>
    </article>
  );
}
