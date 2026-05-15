import { listReviewQueue, getReviewQueueStats } from "@/lib/admin/reviewQueries";
import { ReviewQueueClient } from "./ReviewQueueClient";
import {
  approveQuestion,
  rejectQuestion,
  editAndApprove,
  bulkApprove,
} from "@/lib/admin/reviewActions";

interface Props {
  searchParams: Promise<{
    subtest?: string;
    verified?: "all" | "yes" | "no";
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function ReviewQueuePage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const verified = sp.verified ?? "no"; // default: belum diverifikasi

  const [stats, items] = await Promise.all([
    getReviewQueueStats(),
    listReviewQueue({
      subtest: sp.subtest,
      verified,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.25rem" }}>
          Review Queue Soal
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.82rem" }}>
          Verifikasi soal yang dihasilkan AI sebelum naik tayang ke user. {stats.unverified} soal menunggu review.
        </p>
      </div>

      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.85rem",
          marginBottom: "1.25rem",
        }}
      >
        <StatCard label="Total Aktif" value={stats.total} sub={`${stats.archived} archived`} />
        <StatCard
          label="Sudah Verified"
          value={stats.verified}
          sub={`${Math.round((stats.verified / Math.max(1, stats.total)) * 100)}% progress`}
          color="#34D399"
        />
        <StatCard label="Belum Review" value={stats.unverified} sub="butuh tindakan" color="#FBBF24" />
        <StatCard label="TWK" value={stats.bySubtest.TWK} sub="belum review" color="#60A5FA" />
        <StatCard label="TIU" value={stats.bySubtest.TIU} sub="belum review" color="#A78BFA" />
        <StatCard label="TKP" value={stats.bySubtest.TKP} sub="belum review" color="#F472B6" />
      </div>

      <ReviewQueueClient
        items={items}
        currentSubtest={sp.subtest ?? "all"}
        currentVerified={verified}
        page={page}
        pageSize={PAGE_SIZE}
        approveAction={approveQuestion}
        rejectAction={rejectQuestion}
        editApproveAction={editAndApprove}
        bulkApproveAction={bulkApprove}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "#F1F5F9",
}: {
  label: string;
  value: number;
  sub: string;
  color?: string;
}) {
  return (
    <div className="glass-card" style={{ padding: "0.9rem 1rem" }}>
      <div
        style={{
          fontSize: "0.68rem",
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color, marginBottom: "0.15rem" }}>
        {value.toLocaleString("id-ID")}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#64748B" }}>{sub}</div>
    </div>
  );
}
