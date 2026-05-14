import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

const STATS = [
  { value: "12.000+", label: "Soal terverifikasi" },
  { value: "40+",     label: "Paket tryout" },
  { value: "8.500+",  label: "Peserta aktif" },
  { value: "94%",     label: "Lulus passing grade" },
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Simulasi Realistis",
    desc: "Timer ketat, soal berbobot, dan sistem penilaian identik dengan ujian CASN asli. Bukan latihan biasa.",
    color: "#2563EB",
    glow: "rgba(37,99,235,0.12)",
  },
  {
    icon: "📊",
    title: "Analisis Kelemahan",
    desc: "Setiap tryout menghasilkan breakdown per subtes. Kamu tahu persis di mana bocornya skor.",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.12)",
  },
  {
    icon: "🔁",
    title: "Loop Perbaikan",
    desc: "Review jawaban salah, pelajari pembahasannya, ulang tryout. Skor naik bukan karena keberuntungan.",
    color: "#22C55E",
    glow: "rgba(34,197,94,0.12)",
  },
];

const TESTIMONIALS = [
  {
    name: "Rizky Aditya",
    role: "Lulus CPNS Kemenkeu 2024",
    avatar: "RA",
    color: "#2563EB",
    quote: "Saya tryout 3x seminggu selama 2 bulan. Skor TWK saya naik dari 65 ke 112. NalarUp yang bikin saya tahu harus fokus ke mana.",
  },
  {
    name: "Siti Nurhaliza",
    role: "Lulus CPNS Kemenkes 2024",
    avatar: "SN",
    color: "#7C3AED",
    quote: "Dulu sering gagal di TIU. Setelah lihat analisis NalarUp, ternyata masalahnya di soal deret angka. Sekarang sudah aman.",
  },
  {
    name: "Bagas Prasetyo",
    role: "Lulus CPNS BPS 2024",
    avatar: "BP",
    color: "#22C55E",
    quote: "Yang paling membantu itu fitur review pembahasan. Bisa langsung tahu kenapa jawaban saya salah, bukan cuma tahu salahnya.",
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#020617", overflowX: "hidden" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        background: "rgba(2,6,23,0.85)",
        borderBottom: "1px solid #1E293B",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }} className="gradient-text">
            NalarUp
          </span>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.5rem 1.1rem" }}>Masuk</button>
            </Link>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.5rem 1.25rem" }}>Daftar Gratis</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem 5rem", textAlign: "center", position: "relative" }}>
        {/* Glow blobs */}
        <div className="glow-blob" style={{ width: 500, height: 400, background: "radial-gradient(circle, #2563EB, transparent)", top: "5%", left: "20%" }} />
        <div className="glow-blob" style={{ width: 400, height: 350, background: "radial-gradient(circle, #7C3AED, transparent)", top: "10%", right: "15%", animationDelay: "3s" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: "9999px", padding: "0.35rem 1rem", marginBottom: "1.75rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>Platform tryout CASN — gratis, tanpa batas</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "#F1F5F9", marginBottom: "1.25rem", maxWidth: 800, margin: "0 auto 1.25rem" }}>
            Naikkan Skor CASN{" "}
            <span className="gradient-text">Sampai Aman</span>{" "}
            Passing Grade
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#94A3B8", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.7, fontWeight: 400 }}>
            Simulasi tryout realistis, analisis kelemahan per subtes, dan loop perbaikan terarah.
            Bukan sekadar latihan soal — ini sistem untuk naik skor.
          </p>

          <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
                Mulai Tryout Gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </Link>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.875rem 1.75rem", fontSize: "1rem" }}>
                Sudah punya akun
              </button>
            </Link>
          </div>

          {/* Trust line */}
          <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: "#475569" }}>
            Tidak perlu kartu kredit · Langsung akses semua paket
          </p>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== PROBLEM / AGITATE ===== */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="badge badge-amber" style={{ marginBottom: "1rem" }}>Kenali masalahnya dulu</span>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            Kamu sudah beli buku, ikut bimbel,<br />latihan soal tiap hari —
          </h2>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, marginTop: "0.25rem" }}>
            <span className="gradient-text">tapi skor tetap stagnan. Kenapa?</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { icon: "📚", text: "Latihan soal tanpa tahu subtes mana yang paling bocor" },
            { icon: "⏱️", text: "Tidak terbiasa tekanan waktu ujian yang sesungguhnya" },
            { icon: "🔄", text: "Mengulang materi yang sudah dikuasai, bukan yang lemah" },
            { icon: "📉", text: "Tidak ada data — hanya feeling apakah sudah siap atau belum" },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</span>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ marginTop: "1.5rem", padding: "1.5rem 2rem", borderColor: "rgba(37,99,235,0.3)", background: "rgba(37,99,235,0.06)", textAlign: "center" }}>
          <p style={{ color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
            Masalahnya bukan kurang rajin. Masalahnya adalah{" "}
            <span style={{ color: "#F1F5F9", fontWeight: 600 }}>latihan tanpa arah</span>.
            Tanpa tahu di mana bocornya skor, semua usaha terasa sia-sia.
          </p>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== SOLUTION ===== */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>Solusinya</span>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            Sistem yang tahu persis{" "}
            <span className="gradient-text">di mana kamu harus fokus</span>
          </h2>
          <p style={{ color: "#94A3B8", marginTop: "0.75rem", fontSize: "1rem", maxWidth: 500, margin: "0.75rem auto 0" }}>
            Bukan sekadar kumpulan soal. NalarUp adalah loop: tryout → analisis → perbaikan → ulang.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: "2rem", borderTop: `2px solid ${f.color}`, background: `linear-gradient(135deg, ${f.glow} 0%, transparent 60%)` }}>
              <div style={{ width: 48, height: 48, borderRadius: "0.75rem", background: `rgba(${f.color === "#2563EB" ? "37,99,235" : f.color === "#7C3AED" ? "124,58,237" : "34,197,94"},0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.25rem" }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#F1F5F9", marginBottom: "0.625rem" }}>{f.title}</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== SOCIAL PROOF — STATS ===== */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="badge badge-green" style={{ marginBottom: "1rem" }}>Dalam angka</span>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
            Dipercaya ribuan peserta CASN
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {STATS.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.75rem", textAlign: "center" }}>
              <div className="num" style={{ fontSize: "2rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== TESTIMONI ===== */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-violet" style={{ marginBottom: "1rem" }}>Cerita nyata</span>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
            Mereka sudah buktikan
          </h2>
          <p style={{ color: "#94A3B8", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Bukan janji — ini hasil nyata dari peserta yang konsisten pakai NalarUp.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.75rem" }}>
              {/* Quote mark */}
              <div style={{ fontSize: "2.5rem", lineHeight: 1, color: t.color, opacity: 0.4, marginBottom: "0.75rem", fontFamily: "Georgia, serif" }}>"</div>
              <p style={{ color: "#CBD5E1", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                {t.quote}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#F1F5F9" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== CTA FINAL ===== */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "6rem 1.5rem 7rem", textAlign: "center", position: "relative" }}>
        <div className="glow-blob" style={{ width: 400, height: 300, background: "radial-gradient(circle, #7C3AED, transparent)", top: "10%", left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "1rem" }}>
            Mulai sekarang —<br />
            <span className="gradient-text">gratis, tanpa batas</span>
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem" }}>
            Daftar dalam 30 detik. Langsung akses semua paket tryout dan mulai tahu posisimu hari ini.
          </p>
          <Link href={ROUTES.register}>
            <button className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem", borderRadius: "0.75rem" }}>
              Daftar Gratis Sekarang
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </Link>
          <p style={{ marginTop: "1.25rem", fontSize: "0.78rem", color: "#475569" }}>
            Tidak perlu kartu kredit · Semua paket open access
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid #1E293B", padding: "1.75rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "#475569", fontSize: "0.78rem" }}>
          © 2025 NalarUp · Platform Tryout CASN
        </p>
      </footer>

    </div>
  );
}
