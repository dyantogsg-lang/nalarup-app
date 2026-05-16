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
  const submittedHistory = pkg.history.filter((h) => h.status === "submitted" && h.totalScore != null);
  const bestScore = submittedHistory.length > 0
    ? Math.max(...submittedHistory.map((h) => h.totalScore!))
    : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.25rem", fontSize: "0.82rem" }}>
        <Link href={ROUTES.tryouts} style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 500 }}>
          ← Katalog Tryout
        </Link>
      </div>

      {/* Active attempt banner */}
      {hasActiveAttempt && (
        <div style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.85rem",
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "0.625rem",
            background: "rgba(245,158,11,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--amber)",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <span style={{ color: "var(--amber)", fontWeight: 600 }}>{COPY.activeAttempt.banner}</span>
        </div>
      )}

      {/* ===== HEADER CARD — gradient + icon + 2 kolom ===== */}
      <div style={{
        padding: "2rem 2.25rem",
        marginBottom: "1.25rem",
        background: isSimulation
          ? "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.02))"
          : "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.03))",
        border: `1px solid ${isSimulation ? "rgba(239,68,68,0.12)" : "var(--border)"}`,
        borderRadius: "1.25rem",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "2rem",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blob */}
        <div style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 160,
          height: 160,
          background: isSimulation
            ? "radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)"
            : "radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Left: info */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {pkg.categoryName && (
              <Badge bg="var(--bg-card)" fg="var(--text-primary)" border="var(--border)">
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

          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.6rem",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
          }}>
            {pkg.title}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
            {pkg.description}
          </p>
        </div>

        {/* Right: icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "1.25rem",
          background: isSimulation
            ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))"
            : "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.08))",
          border: `1px solid ${isSimulation ? "rgba(239,68,68,0.15)" : "rgba(37,99,235,0.15)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isSimulation ? "var(--danger)" : "var(--blue)",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}>
          {isSimulation ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          )}
        </div>
      </div>

      {/* ===== STAT CARDS with icons + accent ===== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        marginBottom: "1.25rem",
      }}>
        {[
          {
            label: "Jumlah Soal",
            value: `${pkg.totalQuestions}`,
            sub: "soal",
            accent: "var(--blue)",
            bg: "rgba(37,99,235,0.06)",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
          },
          {
            label: "Durasi",
            value: formatDuration(pkg.durationMinutes),
            sub: "",
            accent: "var(--amber)",
            bg: "rgba(245,158,11,0.06)",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
          },
          {
            label: "Passing Grade",
            value: pkg.passingGradeTotal != null ? String(pkg.passingGradeTotal) : "-",
            sub: "",
            accent: "var(--green)",
            bg: "rgba(34,197,94,0.06)",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
          },
          {
            label: "Skor Terbaik",
            value: bestScore != null ? String(bestScore) : "-",
            sub: submittedCount > 0 ? `${submittedCount}x dikerjakan` : "",
            accent: "var(--violet)",
            bg: "rgba(124,58,237,0.06)",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
          },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "1.25rem",
            background: s.bg,
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            position: "relative",
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "0.625rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: s.accent,
              marginBottom: "0.75rem",
            }}>
              {s.icon}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "0.3rem" }}>
              {s.label}
            </div>
            <div className="num" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
            {s.sub && (
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.2rem" }}>{s.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* ===== KOMPOSISI SUBTES — progress bar visual ===== */}
      {pkg.subtests.length > 0 && (
        <section style={{
          padding: "1.75rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          marginBottom: "1.25rem",
        }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
            Komposisi Subtes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {pkg.subtests.map((s) => {
              const pct = Math.round((s.questionCount / pkg.totalQuestions) * 100);
              const color = s.subtest.includes("TWK") ? "var(--blue)"
                : s.subtest.includes("TIU") ? "var(--violet)"
                : "var(--green)";
              return (
                <div key={s.subtest} style={{
                  padding: "1rem 1.25rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.875rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: color,
                      }} />
                      <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.88rem" }}>
                        {s.subtest}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.78rem", alignItems: "center" }}>
                      <span className="num" style={{ fontWeight: 600 }}>{s.questionCount} soal</span>
                      {s.passingGrade != null && <span>PG {s.passingGrade}</span>}
                      <span style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: color, transition: "width 300ms ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== RIWAYAT — timeline style + trend ===== */}
      {pkg.history.length > 0 && (
        <section style={{
          padding: "1.75rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          marginBottom: "1.25rem",
        }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
            Riwayat Pengerjaan
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pkg.history.map((h, idx) => {
              const prevScore = idx < pkg.history.length - 1 ? pkg.history[idx + 1]?.totalScore : null;
              const trend = h.totalScore != null && prevScore != null
                ? h.totalScore > prevScore ? "up" : h.totalScore < prevScore ? "down" : "same"
                : null;
              const isBest = h.totalScore != null && h.totalScore === bestScore;
              const date = h.submittedAt ?? h.startedAt;
              const statusLabel =
                h.status === "submitted" ? "Selesai"
                : h.status === "in_progress" ? "Berjalan"
                : h.status === "expired" ? "Kedaluwarsa"
                : "Dibatalkan";

              return (
                <div key={h.id} style={{ display: "flex", gap: "1rem" }}>
                  {/* Timeline dot + line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: isBest ? "var(--green)" : h.status === "submitted" ? "var(--blue)" : "var(--border)",
                      border: isBest ? "2px solid rgba(34,197,94,0.3)" : "2px solid var(--bg-card)",
                      flexShrink: 0,
                      marginTop: 4,
                    }} />
                    {idx < pkg.history.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "var(--border)", minHeight: 24 }} />
                    )}
                  </div>

                  {/* Content */}
                  <Link
                    href={h.status === "submitted" ? ROUTES.result(h.id) : ROUTES.exam(h.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 1rem",
                      background: isBest ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isBest ? "rgba(34,197,94,0.15)" : "var(--border)"}`,
                      borderRadius: "0.75rem",
                      textDecoration: "none",
                      marginBottom: "0.625rem",
                      transition: "border-color 150ms ease",
                    }}
                  >
                    <div>
                      <div style={{ color: "var(--text-primary)", fontSize: "0.84rem", fontWeight: 600 }}>
                        {new Date(date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>{statusLabel}</span>
                        {isBest && <span style={{ color: "var(--green)", fontWeight: 600 }}>★ Best</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {trend === "up" && <span style={{ color: "var(--green)", fontSize: "0.82rem" }}>↑</span>}
                      {trend === "down" && <span style={{ color: "var(--danger)", fontSize: "0.82rem" }}>↓</span>}
                      {h.status === "submitted" && h.totalScore != null && (
                        <span style={{
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "0.4rem",
                          fontSize: "0.82rem",
                          background: h.isPassed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                          color: h.isPassed ? "var(--green)" : "var(--danger)",
                        }}>
                          {h.totalScore}
                          {h.isPassed ? " ✓" : ""}
                        </span>
                      )}
                      {h.status === "in_progress" && (
                        <span style={{ color: "var(--amber)", fontWeight: 600, fontSize: "0.82rem" }}>⏳</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== ATURAN UJIAN ===== */}
      <section style={{
        padding: "1.75rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        marginBottom: "6rem",
      }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: "-0.01em" }}>
          Aturan Ujian
        </h2>
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}>
          {COPY.exam.rules.map((r, i) => (
            <li key={i} style={{
              display: "flex",
              gap: "0.75rem",
              color: "var(--text-primary)",
              fontSize: "0.84rem",
              alignItems: "flex-start",
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(37,99,235,0.08)",
                color: "var(--blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.68rem",
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
              }}>
                ✓
              </span>
              <span style={{ lineHeight: 1.5 }}>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== STICKY CTA — prominent + info ===== */}
      <div style={{
        position: "sticky",
        bottom: 0,
        padding: "1rem 0 1.25rem",
        background: "linear-gradient(to top, var(--bg-base) 70%, transparent)",
        zIndex: 10,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1rem 1.5rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", gap: "1.25rem", color: "var(--text-muted)", fontSize: "0.8rem", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {pkg.totalQuestions} soal
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {formatDuration(pkg.durationMinutes)}
            </span>
            {pkg.passingGradeTotal != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                PG {pkg.passingGradeTotal}
              </span>
            )}
          </div>
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
    <span style={{
      fontSize: "0.72rem",
      fontWeight: 600,
      padding: "0.25rem 0.7rem",
      borderRadius: "999px",
      background: bg,
      color: fg,
      border: border ? `1px solid ${border}` : "none",
    }}>
      {children}
    </span>
  );
}
