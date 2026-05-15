import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants/routes";
import ThemeToggle from "@/components/ThemeToggle";
import MotivationGrid from "@/components/motivation/MotivationGrid";
import HeroExamMockup from "@/components/landing/HeroExamMockup";
import { getLandingStats, type LandingStats } from "@/lib/landing/stats";

export const revalidate = 60;

const FALLBACK_STATS: LandingStats = {
  totalQuestions: 320,
  totalPackages: 8,
  twkCount: 90,
  tiuCount: 105,
  tkpCount: 125,
  simulationPackages: 3,
  practicePackages: 5,
};

async function getStatsSafe(): Promise<LandingStats> {
  try {
    return await Promise.race([
      getLandingStats(),
      new Promise<LandingStats>((_, reject) =>
        setTimeout(() => reject(new Error("stats timeout")), 1500)
      ),
    ]);
  } catch {
    return FALLBACK_STATS;
  }
}

const PACKAGES_PREVIEW = [
  {
    title: "SKD CPNS Simulasi Penuh",
    badge: "SKD",
    badgeColor: "badge-blue",
    tag: "Format BKN asli",
    tagColor: "badge-green",
    duration: "100 menit",
    soal: "110 soal",
    count: "TWK 30 · TIU 35 · TKP 45",
  },
  {
    title: "Practice TWK Fokus",
    badge: "TWK",
    badgeColor: "badge-blue",
    tag: "Open access",
    tagColor: "badge-green",
    duration: "15 menit",
    soal: "15 soal",
    count: "Pancasila · UUD · NKRI · Sejarah",
  },
  {
    title: "Practice TIU Logika",
    badge: "TIU",
    badgeColor: "badge-violet",
    tag: "Open access",
    tagColor: "badge-green",
    duration: "15 menit",
    soal: "15 soal",
    count: "Verbal · Numerik · Figural",
  },
];

const FEATURES = [
  {
    accent: "var(--blue)",
    bg: "var(--blue-subtle)",
    title: "Simulasi CAT BKN",
    desc: "Timer, bobot soal, dan sistem penilaian identik ujian asli.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    accent: "var(--violet)",
    bg: "var(--violet-subtle)",
    title: "Pembahasan setelah submit",
    desc: "Lihat alasan jawaban benar/salah setelah tryout selesai.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
      </svg>
    ),
  },
  {
    accent: "var(--green)",
    bg: "var(--green-subtle)",
    title: "Analisis kelemahan",
    desc: "Breakdown per subtes — tahu persis gap kamu vs passing grade.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    accent: "var(--amber)",
    bg: "var(--amber-subtle)",
    title: "Score Safe Meter",
    desc: "Pantau total skor dan jarakmu dari passing grade SKD.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    accent: "var(--pink)",
    bg: "rgba(244,114,182,0.1)",
    title: "Review salah dulu",
    desc: "Fokus bahas jawaban salah agar sesi belajar lebih efisien.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    accent: "var(--teal)",
    bg: "rgba(20,184,166,0.1)",
    title: "Open access fase awal",
    desc: "Semua paket utama bisa dicoba tanpa badge berbayar atau paywall.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Pilih paket tryout",
    desc: "Mulai dari paket SKD penuh atau practice subtes terfokus. Semua open access.",
    img: "/images/landing/step-01-pilih-paket.webp",
  },
  {
    n: "02",
    title: "Kerjakan simulasi",
    desc: "Timer berjalan, soal & navigasi mirip CAT BKN. Autosave setiap jawaban.",
    img: "/images/landing/step-02-kerjakan.webp",
  },
  {
    n: "03",
    title: "Lihat skor & gap",
    desc: "Dapat skor per subtes, status passing grade, dan posisi vs target safe score.",
    img: "/images/landing/step-03-skor-gap.webp",
  },
  {
    n: "04",
    title: "Latihan terarah",
    desc: "Ikuti rekomendasi paket berdasarkan kelemahan, lalu tryout ulang sampai aman.",
    img: "/images/landing/step-04-latihan.webp",
  },
];

export default async function LandingV2() {
  const stats = await getStatsSafe();
  const STATS = [
    { value: stats.totalPackages.toString(), label: "Paket Tryout" },
    { value: stats.totalQuestions.toLocaleString("id-ID"), label: "Total Soal" },
    { value: stats.twkCount.toString(), label: "Soal TWK" },
    { value: stats.tiuCount.toString(), label: "Soal TIU" },
    { value: stats.tkpCount.toString(), label: "Soal TKP" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", overflowX: "hidden" }}>
      {/* ===== NAVBAR ===== */}
      <nav
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="lv2-nav-inner"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 1.5rem",
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", minWidth: 0 }}>
            <span
              className="gradient-text"
              style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}
            >
              NalarUp
            </span>
            <div className="lv2-nav-links" style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
              <Link href={ROUTES.tryouts} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Tryout
              </Link>
              <a href="#how" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Cara kerja
              </a>
              <a href="#fitur" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Fitur
              </a>
              <a href="#paket" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                Paket
              </a>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexShrink: 0 }}>
            <ThemeToggle />
            <Link href={ROUTES.login} className="lv2-login-link">
              <button className="btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}>
                Masuk
              </button>
            </Link>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", cursor: "pointer" }}>
                Mulai
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ASYMMETRIC ===== */}
      <section
        className="lv2-hero"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "5.5rem 1.5rem 4rem",
          position: "relative",
        }}
      >
        <div className="glow-blob" style={{ width: 520, height: 420, background: "radial-gradient(circle, var(--blue), transparent)", top: "0%", left: "-5%" }} />
        <div className="glow-blob" style={{ width: 460, height: 380, background: "radial-gradient(circle, var(--violet), transparent)", top: "-5%", right: "-8%", animationDelay: "4s" }} />

        <div
          className="lv2-hero-grid"
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--green-subtle)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "9999px",
                padding: "0.35rem 1rem",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 600, letterSpacing: "0.03em" }}>
                Gratis · Tanpa batas · Langsung akses
              </span>
            </div>

            <h1
              className="lv2-h1"
              style={{
                fontSize: "clamp(2.25rem, 5.5vw, 4.25rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
              }}
            >
              Naikkan skor SKD<br />
              sampai <span className="gradient-text">aman passing grade</span>
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: 520,
              }}
            >
              Simulasi SKD persis CAT BKN dengan analisis kelemahan per subtes.
              Tahu gap kamu, fokus perbaikan, dan tryout ulang sampai aman.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <Link href={ROUTES.register}>
                <button className="btn-primary" style={{ padding: "0.95rem 1.75rem", fontSize: "0.95rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                  Coba Tryout Gratis
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </Link>
              <a href="#how">
                <button className="btn-ghost" style={{ padding: "0.95rem 1.5rem", fontSize: "0.95rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                  Lihat cara kerja
                </button>
              </a>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--text-dim)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} />
                Tanpa kartu kredit
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--blue)" }} />
                Bisa diulang bebas
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--violet)" }} />
                Pembahasan lengkap
              </span>
            </div>
          </div>

          {/* RIGHT — mockup */}
          <div className="lv2-hero-mockup">
            <HeroExamMockup />
          </div>
        </div>
      </section>

      {/* ===== STATS BIGNUMBER ===== */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div
          className="lv2-stats"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "2.5rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1.5rem",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                className="num"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-dim)",
                  marginTop: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" style={{ maxWidth: 1240, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 720, marginBottom: "3rem" }}>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--blue)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.85rem",
            }}
          >
            Cara kerja
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}
          >
            Loop yang <span className="gradient-text">menaikkan skor</span>, bukan menambah jam
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>
            Empat langkah, diulang sampai posisi aman. Tidak pakai gimmick, tidak pakai paywall.
          </p>
        </div>

        <div
          className="lv2-how-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.25rem",
          }}
        >
          {HOW_STEPS.map((step, idx) => (
            <div
              key={step.n}
              style={{
                position: "relative",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}
            >
              <div
                className="num"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-0.5rem",
                  right: "0.5rem",
                  fontSize: "4.5rem",
                  fontWeight: 800,
                  color: "var(--bg-card-hover)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {step.n}
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <Image
                  src={step.img}
                  alt={step.title}
                  width={120}
                  height={120}
                  style={{ margin: "0 auto 1rem", display: "block", borderRadius: "0.5rem" }}
                />
                <div
                  className="num"
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--blue)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginBottom: "1rem",
                  }}
                >
                  STEP {step.n}
                </div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                    lineHeight: 1.35,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
              {idx < HOW_STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="lv2-how-arrow"
                  style={{
                    position: "absolute",
                    right: "-0.7rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FITUR ===== */}
      <section
        id="fitur"
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "6rem 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              alignItems: "end",
              marginBottom: "3rem",
            }}
            className="lv2-fitur-head"
          >
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--violet)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.85rem",
                }}
              >
                Fitur
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                Bukan sekadar kumpulan soal
              </h2>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Fitur yang dirancang untuk menaikkan skor — analisis kelemahan, simulasi realistis,
              dan latihan terarah berdasarkan hasil tryout terakhir.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "1rem",
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${f.accent}`,
                  borderRadius: "0.85rem",
                  padding: "1.4rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  transition: "border-color 150ms ease, transform 150ms ease",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "0.65rem",
                    background: f.bg,
                    color: f.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--text-primary)",
                      marginBottom: "0.4rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.82rem",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PAKET ===== */}
      <section id="paket" style={{ maxWidth: 1240, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            gap: "2rem",
            marginBottom: "3rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--green)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.85rem",
              }}
            >
              Paket pilihan
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
                marginBottom: "0.75rem",
              }}
            >
              Mulai dari baseline yang jelas
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              Ambil tryout pertama, lihat gap passing grade, lalu lanjut latihan terarah.
            </p>
          </div>
          <Link href={ROUTES.tryouts}>
            <button className="btn-ghost" style={{ padding: "0.7rem 1.25rem", fontSize: "0.85rem", cursor: "pointer", borderRadius: "0.65rem" }}>
              Lihat semua paket
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {PACKAGES_PREVIEW.map((pkg) => (
            <div
              key={pkg.title}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className={`badge ${pkg.badgeColor}`}>{pkg.badge}</span>
                <span className={`badge ${pkg.tagColor}`}>{pkg.tag}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                {pkg.title}
              </h3>
              <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                <span className="num">{pkg.duration}</span>
                <span>·</span>
                <span className="num">{pkg.soal}</span>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border)",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.4 }}>{pkg.count}</span>
                <Link href={ROUTES.tryouts}>
                  <button className="btn-primary" style={{ padding: "0.45rem 0.95rem", fontSize: "0.78rem", cursor: "pointer", flexShrink: 0 }}>
                    Mulai
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MOTIVASI ===== */}
      <section
        id="motivasi"
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="glow-blob" style={{ width: 380, height: 300, background: "radial-gradient(circle, var(--blue), transparent)", top: "10%", left: "5%" }} />
        <div className="glow-blob" style={{ width: 320, height: 260, background: "radial-gradient(circle, var(--violet), transparent)", top: "30%", right: "8%", animationDelay: "3s" }} />

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "6rem 1.5rem", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--violet-subtle)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: "9999px",
                padding: "0.3rem 0.9rem",
                marginBottom: "1.25rem",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5L12 3z" />
              </svg>
              <span style={{ fontSize: "0.72rem", color: "var(--violet)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Catatan untuk kamu
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.035em",
                lineHeight: 1.2,
                marginBottom: "0.75rem",
              }}
            >
              Pengingat kecil supaya <span className="gradient-text">tetap konsisten</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              Bukan janji manis dari orang lain — ini prinsip sederhana yang kepakai
              setiap kamu mengerjakan tryout di sini.
            </p>
          </div>
          <MotivationGrid />
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "7rem 1.5rem 8rem", textAlign: "center", position: "relative" }}>
        <div className="glow-blob" style={{ width: 460, height: 340, background: "radial-gradient(circle, var(--violet), transparent)", top: "10%", left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow-blob" style={{ width: 320, height: 240, background: "radial-gradient(circle, var(--green), transparent)", top: "35%", left: "20%", animationDelay: "5s" }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "1.25rem",
            }}
          >
            Mulai persiapan hari ini, <span className="gradient-text">gratis.</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem" }}>
            Daftar sekarang, tryout pertama selesai dalam 100 menit, dan kamu langsung tahu
            posisimu vs passing grade SKD.
          </p>
          <Link href={ROUTES.register}>
            <button
              className="btn-primary"
              style={{
                padding: "1.05rem 2.5rem",
                fontSize: "1.05rem",
                borderRadius: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 0 50px rgba(37,99,235,0.25)",
              }}
            >
              Coba Tryout Gratis
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
          <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Tidak perlu kartu kredit · Semua paket open access · Bisa diulang bebas
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }}>
            NalarUp
          </span>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href={ROUTES.tryouts} style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Tryout</Link>
            <a href="#how" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Cara kerja</a>
            <a href="#fitur" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Fitur</a>
            <a href="#paket" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Paket</a>
            <Link href={ROUTES.login} style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem" }}>Masuk</Link>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: "0.72rem", margin: 0 }}>© 2026 NalarUp · Platform Tryout CASN Indonesia</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 980px) {
          .lv2-hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .lv2-how-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lv2-how-arrow { display: none !important; }
          .lv2-fitur-head { grid-template-columns: 1fr !important; align-items: start !important; }
          .lv2-stats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .lv2-nav-inner { padding: 0 1rem !important; }
          .lv2-nav-links, .lv2-login-link { display: none !important; }
          .lv2-hero { padding-top: 3rem !important; }
          .lv2-how-grid { grid-template-columns: 1fr !important; }
          .lv2-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
