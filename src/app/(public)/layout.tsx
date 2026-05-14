const ROTATING_QUOTES = [
  {
    quote: "Skor TWK saya naik dari 65 ke 112 setelah 2 bulan rutin tryout di NalarUp.",
    name: "Rizky A.",
    role: "Lulus CPNS Kemenkeu 2024",
    avatar: "RA",
    color: "#2563EB",
  },
  {
    quote: "Analisis per subtes bikin saya tahu harus fokus ke mana. Bukan cuma latihan buta.",
    name: "Siti N.",
    role: "Lulus CPNS Kemenkes 2024",
    avatar: "SN",
    color: "#7C3AED",
  },
  {
    quote: "Fitur review pembahasan yang paling membantu. Langsung tahu kenapa jawaban saya salah.",
    name: "Bagas P.",
    role: "Lulus CPNS BPS 2024",
    avatar: "BP",
    color: "#22C55E",
  },
];

const LIVE_STATS = [
  { value: "8.500+", label: "Peserta aktif" },
  { value: "12.000+", label: "Soal terverifikasi" },
  { value: "94%", label: "Lulus passing grade" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Pick a quote deterministically (SSR-safe, rotates by hour)
  const quoteIndex = Math.floor(Date.now() / 1000 / 3600) % ROTATING_QUOTES.length;
  const q = ROTATING_QUOTES[quoteIndex];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#020617" }}>

      {/* ===== LEFT PANEL — branding + dynamic content ===== */}
      <div style={{
        flex: "0 0 480px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3rem",
        background: "linear-gradient(160deg, #0E1223 0%, #020617 100%)",
        borderRight: "1px solid #1E293B",
        position: "relative",
        overflow: "hidden",
      }}
        className="auth-left-panel"
      >
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: "15%", left: "10%",
          width: 300, height: 250,
          background: "radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "5%",
          width: 250, height: 200,
          background: "radial-gradient(circle, rgba(124,58,237,0.10), transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em" }} className="gradient-text">
            NalarUp
          </span>
          <p style={{ color: "#475569", fontSize: "0.8rem", marginTop: "0.25rem" }}>
            Platform Tryout CASN
          </p>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontSize: "1.75rem", fontWeight: 800, color: "#F1F5F9",
            letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "1rem",
          }}>
            Naikkan skor CASN<br />
            <span className="gradient-text">sampai aman passing grade</span>
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Simulasi realistis, analisis kelemahan per subtes, dan loop perbaikan terarah.
          </p>

          {/* Live stats */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {LIVE_STATS.map((s) => (
              <div key={s.label}>
                <div className="num" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F1F5F9" }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "0.1rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rotating testimonial */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid #1E293B",
            borderLeft: `3px solid ${q.color}`,
            borderRadius: "0.75rem",
            padding: "1.25rem",
          }}>
            <p style={{ color: "#CBD5E1", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1rem", fontStyle: "italic" }}>
              &ldquo;{q.quote}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `linear-gradient(135deg, ${q.color}, ${q.color}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {q.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#F1F5F9" }}>{q.name}</div>
                <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>{q.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.72rem", color: "#334155" }}>
            © 2025 NalarUp · Gratis, tanpa kartu kredit
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL — form ===== */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        minHeight: "100vh",
      }}>
        {children}
      </div>

      {/* Hide left panel on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
