import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import ThemeToggle from "@/components/ThemeToggle";
import MotivationGrid from "@/components/motivation/MotivationGrid";
import MotivationMarquee from "@/components/motivation/MotivationMarquee";

const STATS = [
  { value: "TWK", label: "Skor 0–150" },
  { value: "TIU", label: "Skor 0–175" },
  { value: "TKP", label: "Skor 45–225" },
  { value: "311", label: "Target PG SKD" },
];

const PACKAGES = [
  {
    title: "SKD CPNS Paket Dasar",
    badge: "SKD",
    badgeColor: "badge-blue",
    tag: "Open access",
    tagColor: "badge-green",
    duration: "100 menit",
    soal: "110 soal",
    count: "Cocok untuk baseline pertama",
  },
  {
    title: "TWK Fokus Nasionalisme",
    badge: "TWK",
    badgeColor: "badge-blue",
    tag: "Open access",
    tagColor: "badge-green",
    duration: "15 menit",
    soal: "15 soal",
    count: "Latihan pendek setelah tahu gap",
  },
  {
    title: "TIU Logika Dasar",
    badge: "TIU",
    badgeColor: "badge-violet",
    tag: "Open access",
    tagColor: "badge-green",
    duration: "20 menit",
    soal: "20 soal",
    count: "Prioritas umum untuk menaikkan skor",
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    color: "var(--blue)",
    bg: "var(--blue-subtle)",
    title: "Simulasi CAT BKN",
    desc: "Timer, bobot soal, dan sistem penilaian identik ujian asli.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
      </svg>
    ),
    color: "var(--violet)",
    bg: "var(--violet-subtle)",
    title: "Pembahasan setelah submit",
    desc: "Lihat alasan jawaban benar/salah setelah tryout selesai.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    color: "var(--green)",
    bg: "var(--green-subtle)",
    title: "Analisis kelemahan",
    desc: "Breakdown per subtes — tahu persis gap kamu vs passing grade.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "var(--amber)",
    bg: "var(--amber-subtle)",
    title: "Score Safe Meter",
    desc: "Pantau total skor dan jarakmu dari passing grade SKD.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    color: "var(--pink)",
    bg: "rgba(244,114,182,0.1)",
    title: "Review salah dulu",
    desc: "Fokus bahas jawaban salah agar sesi belajar lebih efisien.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
    color: "var(--teal)",
    bg: "rgba(20,184,166,0.1)",
    title: "Open access fase awal",
    desc: "Semua paket utama bisa dicoba tanpa badge berbayar atau paywall.",
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", overflowX: "hidden" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div className="landing-nav-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", minHeight: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }} className="gradient-text">
              NalarUp
            </span>
            <div className="landing-nav-links" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <Link href={ROUTES.tryouts} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Tryout
              </Link>
              <a href="#fitur" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Fitur
              </a>
              <a href="#motivasi" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Motivasi
              </a>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexShrink: 0 }}>
            <ThemeToggle />
            <Link href={ROUTES.login} className="landing-login-link">
              <button className="btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}>Masuk</button>
            </Link>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", cursor: "pointer" }}>Mulai</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="landing-hero" style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem 4rem", position: "relative" }}>
        <div className="glow-blob" style={{ width: 500, height: 400, background: "radial-gradient(circle, var(--green), transparent)", top: "0%", left: "10%" }} />
        <div className="glow-blob" style={{ width: 420, height: 350, background: "radial-gradient(circle, var(--violet), transparent)", top: "5%", right: "10%", animationDelay: "4s" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          {/* Pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "var(--green-subtle)", border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "9999px", padding: "0.35rem 1rem", marginBottom: "2rem",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 600, letterSpacing: "0.03em" }}>
              Gratis · Tanpa batas · Langsung akses
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.035em", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
            Naikkan skor SKD sampai{" "}
            <span className="gradient-text">aman passing grade</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 560, margin: "0 auto 2.5rem" }}>
            Simulasi SKD persis CAT BKN dengan analisis kelemahan per subtes.
            Tahu gap kamu, fokus perbaikan, dan naikkan skor sampai aman passing grade.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3.5rem" }}>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "0.95rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                Coba Tryout Gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.9rem 1.5rem", fontSize: "0.95rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                Lihat contoh hasil
              </button>
            </Link>
          </div>

          {/* Mini stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", maxWidth: 560, margin: "0 auto" }}>
            {[
              { label: "Skor total", value: "287/311", pct: 92, color: "var(--blue)" },
              { label: "Gap PG", value: "-24", pct: 68, color: "var(--amber)" },
              { label: "Fokus", value: "TIU", pct: 74, color: "var(--violet)" },
            ].map((s) => (
              <div key={s.label} className="glass-card" style={{ padding: "1rem", textAlign: "left" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {s.label}
                </div>
                <div className="num" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {s.value}
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, borderRadius: 2, background: s.color, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", textAlign: "center" }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="num" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MOTIVATION MARQUEE — running reminders ===== */}
      <MotivationMarquee />

      {/* ===== PAKET TRYOUT ===== */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Mulai dari baseline yang jelas
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Ambil tryout pertama, lihat gap passing grade, lalu lanjut latihan terarah.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1.25rem" }}>
          {PACKAGES.map((pkg) => (
            <div key={pkg.title} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className={`badge ${pkg.badgeColor}`}>{pkg.badge}</span>
                <span className={`badge ${pkg.tagColor}`}>{pkg.tag}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                {pkg.title}
              </h3>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                <span>{pkg.duration}</span>
                <span>·</span>
                <span>{pkg.soal}</span>
              </div>
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>{pkg.count}</span>
                <Link href={ROUTES.tryouts}>
                  <button className="btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem", cursor: "pointer" }}>
                    Mulai
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== FITUR ===== */}
      <section id="fitur" style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Bukan sekadar kumpulan soal
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Fitur yang dirancang untuk menaikkan skor, bukan cuma menambah jam latihan.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "0.75rem",
                background: f.bg, color: f.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.4rem", lineHeight: 1.4 }}>
                  {f.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== MOTIVASI — kalimat penyemangat dari proses, bukan testimoni ===== */}
      <section id="motivasi" style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem", position: "relative" }}>
        <div className="glow-blob" style={{ width: 380, height: 300, background: "radial-gradient(circle, var(--blue), transparent)", top: "10%", left: "5%" }} />
        <div className="glow-blob" style={{ width: 320, height: 260, background: "radial-gradient(circle, var(--violet), transparent)", top: "30%", right: "8%", animationDelay: "3s" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "var(--violet-subtle)", border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: "9999px", padding: "0.3rem 0.9rem", marginBottom: "1.25rem",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5L12 3z"/>
              </svg>
              <span style={{ fontSize: "0.72rem", color: "var(--violet)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Catatan untuk kamu
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
              Pengingat kecil supaya{" "}
              <span className="gradient-text">tetap konsisten</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              Bukan janji manis dari orang lain — ini prinsip sederhana yang kepakai
              setiap kamu mengerjakan tryout di sini.
            </p>
          </div>

          <MotivationGrid />
        </div>
      </section>

      <hr className="divider" />

      {/* ===== CTA FINAL ===== */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "6rem 1.5rem 7rem", textAlign: "center", position: "relative" }}>
        <div className="glow-blob" style={{ width: 400, height: 300, background: "radial-gradient(circle, var(--violet), transparent)", top: "20%", left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow-blob" style={{ width: 280, height: 220, background: "radial-gradient(circle, var(--green), transparent)", top: "35%", left: "25%", animationDelay: "5s" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.035em", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Mulai persiapan hari ini,{" "}
            <span className="gradient-text">gratis.</span>
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 460, margin: "0 auto 2.5rem" }}>
            Daftar sekarang, tryout pertama selesai dalam 100 menit,
            dan kamu langsung tahu posisimu vs passing grade SKD.
          </p>

          <Link href={ROUTES.register}>
            <button className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem", borderRadius: "0.875rem", cursor: "pointer", boxShadow: "0 0 40px rgba(37,99,235,0.2)" }}>
              Coba Tryout Gratis
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>

          <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Tidak perlu kartu kredit · Semua paket open access · Bisa diulang bebas
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .landing-nav-inner { padding: 0 1rem !important; }
          .landing-nav-links, .landing-login-link { display: none !important; }
          .landing-hero { padding-top: 3.25rem !important; }
        }
      `}</style>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }} className="gradient-text">
            NalarUp
          </span>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href={ROUTES.tryouts} style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Tryout</Link>
            <a href="#fitur" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Fitur</a>
            <a href="#motivasi" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Motivasi</a>
            <Link href={ROUTES.login} style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Masuk</Link>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: "0.72rem", margin: 0 }}>© 2025 NalarUp · Platform Tryout CASN Indonesia</p>
        </div>
      </footer>

    </div>
  );
}
