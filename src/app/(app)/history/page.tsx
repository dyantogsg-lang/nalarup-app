import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { attempts, tryoutPackages } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { HistoryClient } from "@/components/history/HistoryClient";
import { PageHeader, StatCard, SectionCard } from "@/components/ui";

export default async function HistoryPage() {
  const { profile } = await requireUser();

  const history = await db
    .select({
      id: attempts.id,
      totalScore: attempts.totalScore,
      isPassed: attempts.isPassed,
      status: attempts.status,
      submittedAt: attempts.submittedAt,
      startedAt: attempts.startedAt,
      packageTitle: tryoutPackages.title,
      packageSlug: tryoutPackages.slug,
      packageDuration: tryoutPackages.durationMinutes,
    })
    .from(attempts)
    .innerJoin(tryoutPackages, eq(attempts.packageId, tryoutPackages.id))
    .where(and(eq(attempts.userId, profile.id)))
    .orderBy(desc(attempts.startedAt))
    .limit(50);

  const submitted = history.filter((h) => h.status === "submitted");
  const passedCount = submitted.filter((h) => h.isPassed).length;
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((s, h) => s + (h.totalScore ?? 0), 0) / submitted.length)
      : null;
  const bestScore = submitted.length > 0
    ? Math.max(...submitted.map((h) => h.totalScore ?? 0))
    : null;

  return (
    <div className="container-md">
      <PageHeader
        title="Riwayat Tryout"
        subtitle="Semua sesi tryout kamu — selesai maupun yang masih berjalan."
      />

      {/* ===== STATS ===== */}
      {submitted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Selesai"
            value={submitted.length}
            accent="blue"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>}
          />
          <StatCard
            label="Rata-rata Skor"
            value={avgScore ?? "—"}
            accent="violet"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>}
          />
          <StatCard
            label="Lulus Passing"
            value={`${passedCount}/${submitted.length}`}
            accent="green"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          />
          <StatCard
            label="Skor Terbaik"
            value={bestScore ?? "—"}
            accent="amber"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
          />
        </div>
      )}

      {/* ===== CONTENT ===== */}
      {history.length === 0 ? (
        <SectionCard padding="lg" className="text-center">
          <div className="mb-5 opacity-50">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
            Belum ada riwayat
          </h3>
          <p className="text-sm mb-6 max-w-[360px] mx-auto" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Mulai tryout pertama untuk melihat progress dan analisis skor kamu di sini.
          </p>
          <Link href={ROUTES.tryouts}>
            <button className="btn-primary py-3 px-8 text-sm rounded-xl cursor-pointer">
              Lihat Katalog Tryout
            </button>
          </Link>
        </SectionCard>
      ) : (
        <HistoryClient history={history.map(h => ({
          ...h,
          submittedAt: h.submittedAt?.toISOString() ?? null,
          startedAt: h.startedAt.toISOString(),
        }))} />
      )}
    </div>
  );
}
