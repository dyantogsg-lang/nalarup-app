import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0A0F1E" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "rgba(10,15,30,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NalarUp
          </span>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.5rem 1rem" }}>
                Masuk
              </button>
            </Link>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                Daftar Gratis
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, rgba(124,58,237,0.12) 50%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.3)",
            borderRadius: 9999,
            padding: "0.3rem 0.9rem",
            marginBottom: "1.5rem",
            fontSize: "0.78rem",
            color: "#60A5FA",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: "#10B981",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          Open access — semua paket tryout bisa langsung dicoba
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: "1.25rem",
            background: "linear-gradient(135deg, #F1F5F9 30%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Naikkan skor sampai aman
          <br />
          passing grade CASN
        </h1>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "1.1rem",
            maxWidth: 540,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Simulasi tryout realistis, analisis kelemahan otomatis, dan latihan
          perbaikan terarah. Dipakai 12.000+ pejuang CASN.
        </p>

        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href={ROUTES.register}>
            <button
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}
            >
              Mulai Tryout Gratis
            </button>
          </Link>
          <Link href={ROUTES.tryouts}>
            <button
              className="btn-ghost"
              style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}
            >
              Lihat Katalog
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem 1.5rem",
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          { value: "12.000+", label: "Pejuang CASN" },
          { value: "3x", label: "Rata-rata tryout per minggu" },
          { value: "100%", label: "Simulasi format CAT BKN" },
          { value: "Open", label: "Semua paket bisa dicoba" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{ padding: "1.25rem 2rem", textAlign: "center", minWidth: 150 }}
          >
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#60A5FA",
                marginBottom: "0.25rem",
              }}
            >
              {s.value}
            </div>
            <div style={{ color: "#64748B", fontSize: "0.8rem" }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Loop produk */}
      <section
        style={{
          maxWidth: 900,
          margin: "3rem auto",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#F1F5F9",
            marginBottom: "2rem",
          }}
        >
          Sistem peningkatan skor yang terstruktur
        </h2>
        <div
          style={{
            display: "flex",
            gap: "0",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { step: "Tryout", desc: "Simulasi realistis" },
            { step: "Hasil", desc: "Skor & passing grade" },
            { step: "Kelemahan", desc: "Analisis per topik" },
            { step: "Latihan", desc: "Perbaikan terarah" },
            { step: "Skor Naik", desc: "Aman passing grade" },
          ].map((item, i) => (
            <div
              key={item.step}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                className="glass-card"
                style={{
                  padding: "1rem 1.25rem",
                  textAlign: "center",
                  minWidth: 110,
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#60A5FA",
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                  {item.desc}
                </div>
              </div>
              {i < 4 && (
                <div
                  style={{
                    color: "#2563EB",
                    margin: "0 0.25rem",
                    fontSize: "1.2rem",
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section
        style={{
          textAlign: "center",
          padding: "4rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#F1F5F9",
            marginBottom: "1rem",
          }}
        >
          Mulai latihan sekarang — gratis
        </h2>
        <p style={{ color: "#64748B", marginBottom: "2rem" }}>
          Tidak perlu kartu kredit. Semua paket awal open access.
        </p>
        <Link href={ROUTES.register}>
          <button
            className="btn-primary"
            style={{ fontSize: "1rem", padding: "0.9rem 2.5rem" }}
          >
            Daftar Sekarang
          </button>
        </Link>
      </section>
    </div>
  );
}
