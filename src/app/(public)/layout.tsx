import RotatingMotivation from "@/components/motivation/RotatingMotivation";

const LIVE_STATS = [
  { value: "TWK", label: "Wawasan Kebangsaan" },
  { value: "TIU", label: "Intelegensia Umum" },
  { value: "TKP", label: "Karakteristik Pribadi" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-base)" }}>

      {/* ===== LEFT PANEL — branding + dynamic content ===== */}
      <div style={{
        flex: "0 0 480px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3rem",
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
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
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/logo-icon.png" alt="NalarUp" width={40} height={40} style={{ borderRadius: 10 }} />
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em" }} className="gradient-text">
              NalarUp
            </span>
            <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: "0.15rem" }}>
              Platform Tryout CASN
            </p>
          </div>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)",
            letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "1rem",
          }}>
            Naikkan skor CASN<br />
            <span className="gradient-text">sampai aman passing grade</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Simulasi realistis, analisis kelemahan per subtes, dan loop perbaikan terarah.
          </p>

          {/* Subtes legend (replaces vanity stats) */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {LIVE_STATS.map((s) => (
              <div key={s.label}>
                <div className="num gradient-text" style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.15rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rotating motivation (replaces testimoni) */}
          <RotatingMotivation intervalMs={6000} />
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
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
