import { sql } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  tryoutPackages,
  questions,
  questionReports,
  attempts,
} from "@/lib/db/schema";

export default async function AdminDashboardPage() {
  const [pkgStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${tryoutPackages.status} = 'published')::int`,
      draft: sql<number>`count(*) filter (where ${tryoutPackages.status} = 'draft')::int`,
      review: sql<number>`count(*) filter (where ${tryoutPackages.status} = 'review')::int`,
    })
    .from(tryoutPackages);

  const [qStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${questions.status} = 'published')::int`,
      draft: sql<number>`count(*) filter (where ${questions.status} = 'draft')::int`,
    })
    .from(questions);

  const [reportStats] = await db
    .select({
      open: sql<number>`count(*) filter (where ${questionReports.status} = 'open')::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(questionReports);

  const [attemptStats] = await db
    .select({
      today: sql<number>`count(*) filter (where ${attempts.startedAt} >= now() - interval '24 hours')::int`,
      week: sql<number>`count(*) filter (where ${attempts.startedAt} >= now() - interval '7 days')::int`,
      submitted: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
    })
    .from(attempts);

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.25rem" }}>
        Admin Dashboard
      </h1>
      <p style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Ringkasan konten dan aktivitas NalarUp.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "0.85rem",
          marginBottom: "1.5rem",
        }}
      >
        <Card
          title="Paket"
          value={pkgStats?.total ?? 0}
          sub={`${pkgStats?.published ?? 0} published · ${pkgStats?.draft ?? 0} draft · ${pkgStats?.review ?? 0} review`}
          href="/admin/packages"
        />
        <Card
          title="Soal"
          value={qStats?.total ?? 0}
          sub={`${qStats?.published ?? 0} published · ${qStats?.draft ?? 0} draft`}
          href="/admin/questions"
        />
        <Card
          title="Laporan terbuka"
          value={reportStats?.open ?? 0}
          sub={`${reportStats?.total ?? 0} total laporan`}
          href="/admin/reports"
          alert={(reportStats?.open ?? 0) > 0}
        />
        <Card
          title="Attempt"
          value={attemptStats?.submitted ?? 0}
          sub={`${attemptStats?.today ?? 0} hari ini · ${attemptStats?.week ?? 0} 7 hari`}
        />
      </div>

      <section
        className="glass-card"
        style={{ padding: "1.25rem 1.5rem" }}
      >
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.6rem" }}>
          Jalur kerja cepat
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <LinkButton href="/admin/packages/new">+ Paket baru</LinkButton>
          <LinkButton href="/admin/questions/new">+ Soal baru</LinkButton>
          <LinkButton href="/admin/packages">Kelola paket</LinkButton>
          <LinkButton href="/admin/questions">Kelola soal</LinkButton>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  sub,
  href,
  alert,
}: {
  title: string;
  value: number;
  sub: string;
  href?: string;
  alert?: boolean;
}) {
  const body = (
    <div
      className="glass-card"
      style={{
        padding: "1rem 1.1rem",
        borderColor: alert ? "rgba(245,158,11,0.3)" : undefined,
        background: alert ? "rgba(245,158,11,0.05)" : undefined,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: alert ? "#FBBF24" : "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.35rem",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "0.15rem" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.72rem", color: "#64748B" }}>{sub}</div>
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {body}
    </Link>
  ) : (
    body
  );
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: "0.5rem 0.9rem",
        background: "rgba(96,165,250,0.1)",
        border: "1px solid rgba(96,165,250,0.25)",
        color: "#BFDBFE",
        borderRadius: "0.4rem",
        fontSize: "0.82rem",
        textDecoration: "none",
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  );
}
