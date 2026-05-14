import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export default function SavedPage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Disimpan
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Soal dan paket yang kamu tandai untuk dipelajari lagi.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔖</div>
        <h3 style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Belum ada yang disimpan</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: 360, margin: "0 auto 1.5rem" }}>
          Tandai soal atau paket tryout saat review untuk muncul di sini.
        </p>
        <Link href={ROUTES.tryouts}>
          <button className="btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}>
            Lihat Katalog Tryout
          </button>
        </Link>
      </div>
    </div>
  );
}
