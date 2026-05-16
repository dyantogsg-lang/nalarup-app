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

const IconSoal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconTarget = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

function getCategoryAccent(categoryName: string | null, mode: string): string {
  if (mode === "simulation") return "var(--danger)";
  if (!categoryName) return "var(--blue)";
  const lower = categoryName.toLowerCase();
  if (lower.includes("twk")) return "var(--blue)";
  if (lower.includes("tiu")) return "var(--violet)";
  if (lower.includes("tkp")) return "var(--green)";
  return "var(--blue)";
}

export function PackageCard({ pkg, featured = false }: { pkg: CatalogPackage; featured?: boolean }) {
  const modeC = modeColor(pkg.mode);
  const diffC = difficultyColor(pkg.difficulty);
  const cta = ctaForAttemptStatus(pkg.lastAttemptStatus);
  const hasAttempt = pkg.attemptCount > 0;
  const accent = getCategoryAccent(pkg.categoryName, pkg.mode);

  if (featured) {
    return (
      <article style={{
        padding: "2rem 2.25rem",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "2rem",
        alignItems: "center",
        background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.04))",
        border: "1px solid rgba(37,99,235,0.15)",
        borderRadius: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative */}
        <div style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.85rem" }}>
            <span style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "0.25rem 0.7rem",
              borderRadius: "999px",
              background: "rgba(37,99,235,0.12)",
              color: "var(--blue)",
              border: "1px solid rgba(37,99,235,0.2)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              ★ Rekomendasi
            </span>
            {pkg.categoryName && (
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}>
                {pkg.categoryName}
              </span>
            )}
            <span style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: modeC.bg,
              color: modeC.fg,
              border: `1px solid ${modeC.border}`,
            }}>
              {modeLabel(pkg.mode)}
            </span>
          </div>

          <h3 style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}>
            {pkg.title}
          </h3>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            lineHeight: 1.6,
            marginBottom: "1rem",
            maxWidth: 500,
          }}>
            {pkg.description}
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: "1.25rem", color: "var(--text-muted)", fontSize: "0.8rem", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <IconSoal /> {pkg.totalQuestions} soal
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <IconClock /> {formatDuration(pkg.durationMinutes)}
            </span>
            {pkg.passingGradeTotal != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <IconTarget /> PG {pkg.passingGradeTotal}
              </span>
            )}
          </div>
        </div>

        {/* CTA side */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <Link href={ROUTES.tryoutDetail(pkg.slug)}>
            <button className="btn-primary" style={{
              padding: "0.85rem 2rem",
              fontSize: "0.92rem",
              cursor: "pointer",
              borderRadius: "0.75rem",
              whiteSpace: "nowrap",
            }}>
              {cta.label}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginLeft: "0.4rem" }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
          {hasAttempt && pkg.lastAttemptStatus === "submitted" && (
            <span style={{
              fontSize: "0.72rem",
              color: pkg.lastAttemptIsPassed ? "var(--green)" : "var(--text-dim)",
              fontWeight: 600,
            }}>
              Skor: {pkg.lastAttemptScore ?? "—"} {pkg.lastAttemptIsPassed ? "✓" : ""}
            </span>
          )}
        </div>
      </article>
    );
  }

  // Regular card
  return (
    <article style={{
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.9rem",
      minHeight: 240,
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${accent}`,
      borderRadius: "1rem",
      transition: "border-color 150ms ease, box-shadow 150ms ease",
    }}>
      {/* Top meta */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
        {pkg.categoryName && (
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.22rem 0.6rem",
            borderRadius: "999px",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}>
            {pkg.categoryName}
          </span>
        )}
        <span style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          padding: "0.22rem 0.6rem",
          borderRadius: "999px",
          background: modeC.bg,
          color: modeC.fg,
          border: `1px solid ${modeC.border}`,
        }}>
          {modeLabel(pkg.mode)}
        </span>
        <span style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          padding: "0.22rem 0.6rem",
          borderRadius: "999px",
          background: diffC.bg,
          color: diffC.fg,
        }}>
          {difficultyLabel(pkg.difficulty)}
        </span>
        <span style={{ marginLeft: "auto" }}>
          <SaveStar slug={pkg.slug} />
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 style={{
          fontSize: "1.02rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "0.4rem",
          lineHeight: 1.35,
        }}>
          {pkg.title}
        </h3>
        <p style={{
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {pkg.description}
        </p>
      </div>

      {/* Stat row with icons */}
      <div style={{
        display: "flex",
        gap: "1rem",
        color: "var(--text-muted)",
        fontSize: "0.75rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <IconSoal /> {pkg.totalQuestions} soal
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <IconClock /> {formatDuration(pkg.durationMinutes)}
        </span>
        {pkg.passingGradeTotal != null && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <IconTarget /> PG {pkg.passingGradeTotal}
          </span>
        )}
      </div>

      {/* User status */}
      {hasAttempt && (
        <div style={{
          padding: "0.6rem 0.75rem",
          borderRadius: "0.625rem",
          background: "var(--bg-card2)",
          border: "1px solid var(--border)",
          fontSize: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ color: "var(--text-muted)" }}>
            {pkg.lastAttemptStatus === "in_progress"
              ? "Sedang berjalan"
              : "Skor terakhir"}
          </span>
          {pkg.lastAttemptStatus === "submitted" && (
            <span style={{
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
              borderRadius: "0.35rem",
              background: pkg.lastAttemptIsPassed
                ? "rgba(34,197,94,0.12)"
                : "rgba(239,68,68,0.1)",
              color: pkg.lastAttemptIsPassed ? "var(--green)" : "var(--danger)",
            }}>
              {pkg.lastAttemptScore ?? "-"}
              {pkg.lastAttemptIsPassed ? " ✓" : ""}
            </span>
          )}
          {pkg.lastAttemptStatus === "in_progress" && (
            <span style={{ color: "var(--amber)", fontWeight: 600 }}>⏳</span>
          )}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
        <Link href={ROUTES.tryoutDetail(pkg.slug)} style={{ flex: 1 }}>
          <button
            className={cta.variant === "primary" ? "btn-primary" : ""}
            style={{
              width: "100%",
              padding: "0.6rem 0.9rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              borderRadius: "0.625rem",
              cursor: "pointer",
              ...(cta.variant === "ghost"
                ? {
                    background: "var(--bg-card)",
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
