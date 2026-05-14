import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

const STATS = [
  { value: "12.000+", label: "Soal terverifikasi", accent: "#60A5FA" },
  { value: "40+",     label: "Paket tryout",       accent: "#A78BFA" },
  { value: "8.500+",  label: "Peserta aktif",      accent: "#4ADE80" },
  { value: "94%",     label: "Lulus passing grade", accent: "#FCD34D" },
];

const PROBLEMS = [
  {
    label: "Sudah beli buku setebal bantal",
    sub: "Tapi pas tryout, soal TWK-nya beda sama yang di buku. Waktu habis, panik.",
  },
  {
    label: "Ikut bimbel 3 bulan penuh",
    sub: "Materi diulang terus dari awal. Padahal kamu lemah di TIU, bukan TWK.",
  },
  {
    label: "Latihan soal tiap malam",
    sub: "Tapi soal yang sama terus. Tidak ada simulasi tekanan waktu yang sesungguhnya.",
  },
  {
    label: "Merasa sudah siap",
    sub: "Sampai hari H — skor keluar, dan selisihnya masih 30 poin dari passing grade.",
  },
];

const JOURNEY = [
  {
    step: "01",
    color: "#2563EB",
    glow: "rgba(37,99,235,0.12)",
    borderColor: "#2563EB",
    title: "Kamu tryout — persis seperti ujian asli",
    desc: "Timer 100 menit, soal berbobot, sistem penilaian identik SKD. Bukan latihan santai — ini simulasi yang bikin kamu tahu rasanya tekanan ujian sebenarnya.",
    detail: "TWK · TIU · TKP — 110 soal",
  },
  {
    step: "02",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.12)",
    borderColor: "#7C3AED",
    title: "Sistem baca di mana bocornya skor kamu",
    desc: "Selesai tryout, langsung dapat breakdown per subtes. Bukan cuma total skor — tapi tahu persis: TIU kamu 62, passing grade-nya 80. Fokus ke sana.",
    detail: "Analisis per subtes · Gap vs passing grade",
  },
  {
    step: "03",
    color: "#22C55E",
    glow: "rgba(34,197,94,0.12)",
    borderColor: "#22C55E",
    title: "Review, perbaiki, ulang — skor naik terukur",
    desc: "Buka pembahasan soal yang salah. Pahami polanya. Ulang tryout paket berbeda. Setiap sesi ada datanya — bukan feeling.",
    detail: "Pembahasan lengkap · Ulang bebas",
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#020617", overflowX: "hidden" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        background: "rgba(2,6,23,0.9)",
        borderBottom: "1px solid #1E293B",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }} className="gradient-text">
            NalarUp
          </span>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}>
                Masuk
              </button>
            </Link>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", cursor: "pointer" }}>
                Daftar Gratis
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "7rem 1.5rem 6rem",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Glow blobs — hidden on mobile via CSS */}
        <div className="glow-blob" style={{
          width: 560,
          height: 420,
          background: "radial-gradient(circle, #2563EB, transparent)",
          top: "0%",
          left: "10%",
        }} />
        <div className="glow-blob" style={{
          width: 460,
          height: 380,
          background: "radial-gradient(circle, #7C3AED, transparent)",
          top: "5%",
          right: "8%",
          animationDelay: "4s",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Eyebrow badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "9999px",
            padding: "0.3rem 0.875rem",
            marginBottom: "2rem",
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              display: "inline-block",
              boxShadow: "0 0 6px #22C55E",
            }} />
            <span style={{ fontSize: "0.75rem", color: "#4ADE80", fontWeight: 600, letterSpacing: "0.03em" }}>
              Gratis · Tanpa batas · Langsung akses
            </span>
          </div>

          {/* Headline — spesifik, bukan generic */}
          <h1 style={{
            fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.035em",
            color: "#F1F5F9",
            maxWidth: 820,
            margin: "0 auto 1.5rem",
          }}>
            Tryout kemarin skormu{" "}
            <span className="num" style={{ color: "#FCA5A5" }}>287</span>.
            {" "}Passing grade{" "}
            <span className="num" style={{ color: "#4ADE80" }}>311</span>.{" "}
            <br />
            <span className="gradient-text">
              Selisih 24 poin — dan kamu tahu persis harus fokus ke mana.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            color: "#94A3B8",
            maxWidth: 540,
            margin: "0 auto 2.75rem",
            lineHeight: 1.75,
            fontWeight: 400,
          }}>
            NalarUp bukan kumpulan soal biasa. Ini sistem yang baca kelemahan kamu,
            tunjukkan gap-nya, dan bantu kamu tutup satu per satu — sampai aman passing grade.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.9rem 2.25rem", fontSize: "1rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                Mulai Tryout Gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.9rem 1.75rem", fontSize: "1rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                Sudah punya akun
              </button>
            </Link>
          </div>

          <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#475569" }}>
            Tidak perlu kartu kredit · Daftar 30 detik · Langsung akses semua paket
          </p>

          {/* Mini score preview card */}
          <div style={{
            marginTop: "3.5rem",
            display: "inline-flex",
            gap: "0",
            background: "rgba(14,18,35,0.9)",
            border: "1px solid #1E293B",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.4)",
          }}>
            {[
              { label: "TWK", score: 95, pg: 65, color: "#4ADE80" },
              { label: "TIU", score: 62, pg: 80, color: "#FCA5A5" },
              { label: "TKP", score: 130, pg: 166, color: "#FCD34D" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "1.25rem 1.75rem",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid #1E293B" : "none",
                minWidth: 100,
              }}>
                <div style={{ fontSize: "0.65rem", color: "#475569", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                  {s.label}
                </div>
                <div className="num" style={{ fontSize: "1.6rem", fontWeight: 700, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.score}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#334155", marginTop: "0.35rem" }}>
                  PG: <span className="num" style={{ color: "#475569" }}>{s.pg}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.7rem", color: "#334155", marginTop: "0.625rem" }}>
            Contoh breakdown skor setelah tryout
          </p>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== PROBLEM / AGITATE ===== */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-amber" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
            Kenapa skor kamu belum naik-naik?
          </span>
          <h2 style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
            marginBottom: "0.75rem",
          }}>
            Kamu sudah coba semua cara.
            <br />
            <span style={{ color: "#94A3B8", fontWeight: 600 }}>Tapi hasilnya masih sama.</span>
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Bukan karena kamu kurang usaha. Tapi karena cara belajarnya yang salah arah.
          </p>
        </div>

        {/* False solution cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: "9999px",
                padding: "0.2rem 0.625rem",
                marginBottom: "0.875rem",
              }}>
                <span style={{ fontSize: "0.65rem", color: "#4ADE80", fontWeight: 700, letterSpacing: "0.04em" }}>
                  ✓ SOLUSI YANG DICOBA
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#F1F5F9", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                {p.label}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.65 }}>
                {p.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Agitate conclusion */}
        <div className="glass-card" style={{
          padding: "1.75rem 2rem",
          borderColor: "rgba(245,158,11,0.25)",
          background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)",
          borderLeft: "3px solid #F59E0B",
        }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "0.1rem" }}>💡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F1F5F9", marginBottom: "0.5rem" }}>
                Masalahnya bukan kurang rajin.
              </div>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.75, margin: 0 }}>
                Masalahnya adalah <span style={{ color: "#FCD34D", fontWeight: 600 }}>latihan tanpa data</span>.
                Kamu tidak tahu subtes mana yang paling bocor, tidak tahu berapa gap-nya,
                dan tidak ada sistem yang kasih tahu harus fokus ke mana.
                Semua usaha terasa sia-sia karena tidak terarah.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== SOLUTION — user journey framing ===== */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="badge badge-blue" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
            Cara NalarUp bekerja
          </span>
          <h2 style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
            marginBottom: "0.75rem",
          }}>
            Bukan sekadar latihan soal.{" "}
            <span className="gradient-text">Ini loop yang bikin skor naik.</span>
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Tryout → analisis → perbaikan → ulang. Setiap putaran, kamu lebih dekat ke passing grade.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {JOURNEY.map((j, i) => (
            <div key={i} className="glass-card" style={{
              padding: "2rem",
              borderTop: `2px solid ${j.borderColor}`,
              background: `linear-gradient(160deg, ${j.glow} 0%, transparent 55%)`,
              position: "relative",
            }}>
              {/* Step number */}
              <div className="num" style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: j.color,
                letterSpacing: "0.1em",
                marginBottom: "1rem",
                opacity: 0.8,
              }}>
                LANGKAH {j.step}
              </div>

              <h3 style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#F1F5F9",
                marginBottom: "0.75rem",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
              }}>
                {j.title}
              </h3>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.75, margin: "0 0 1.25rem" }}>
                {j.desc}
              </p>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                background: `rgba(${j.color === "#2563EB" ? "37,99,235" : j.color === "#7C3AED" ? "124,58,237" : "34,197,94"},0.1)`,
                border: `1px solid rgba(${j.color === "#2563EB" ? "37,99,235" : j.color === "#7C3AED" ? "124,58,237" : "34,197,94"},0.2)`,
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
              }}>
                <span style={{ fontSize: "0.7rem", color: j.color, fontWeight: 600 }}>{j.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== STATS ===== */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "6rem 1.5rem", position: "relative" }}>
        <div className="glow-blob" style={{
          width: 500,
          height: 350,
          background: "radial-gradient(circle, #2563EB, transparent)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-green" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
              Dalam angka
            </span>
            <h2 style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 800,
              color: "#F1F5F9",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
            }}>
              Ribuan peserta sudah buktikan
            </h2>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: "0.625rem" }}>
              Angka ini bukan klaim — ini hasil dari peserta yang konsisten pakai NalarUp.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {STATS.map((s, i) => (
              <div key={i} className="glass-card" style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                background: "rgba(14,18,35,0.9)",
              }}>
                <div className="num" style={{
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  color: s.accent,
                  letterSpacing: "-0.03em",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500, lineHeight: 1.4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== CTA FINAL ===== */}
      <section style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "7rem 1.5rem 8rem",
        textAlign: "center",
        position: "relative",
      }}>
        <div className="glow-blob" style={{
          width: 480,
          height: 360,
          background: "radial-gradient(circle, #7C3AED, transparent)",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
        }} />
        <div className="glow-blob" style={{
          width: 300,
          height: 250,
          background: "radial-gradient(circle, #2563EB, transparent)",
          top: "30%",
          left: "20%",
          animationDelay: "5s",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Decorative top line */}
          <div style={{
            width: 40,
            height: 3,
            background: "linear-gradient(90deg, #2563EB, #7C3AED)",
            borderRadius: 9999,
            margin: "0 auto 2rem",
          }} />

          <h2 style={{
            fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-0.035em",
            lineHeight: 1.18,
            marginBottom: "1.25rem",
          }}>
            Passing grade bukan soal nasib.
            <br />
            <span className="gradient-text">Soal tahu harus fokus ke mana.</span>
          </h2>

          <p style={{
            color: "#94A3B8",
            fontSize: "1rem",
            lineHeight: 1.75,
            marginBottom: "2.75rem",
            maxWidth: 460,
            margin: "0 auto 2.75rem",
          }}>
            Daftar sekarang, tryout pertama selesai dalam 100 menit,
            dan kamu langsung tahu posisimu vs passing grade SKD hari ini.
          </p>

          <Link href={ROUTES.register}>
            <button className="btn-primary" style={{
              padding: "1rem 2.75rem",
              fontSize: "1.05rem",
              borderRadius: "0.875rem",
              cursor: "pointer",
              boxShadow: "0 0 40px rgba(37,99,235,0.25)",
            }}>
              Mulai Tryout Gratis Sekarang
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>

          <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#334155" }}>
            Tidak perlu kartu kredit · Semua paket open access · Bisa diulang bebas
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid #1E293B", padding: "2rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "#334155", fontSize: "0.75rem" }}>
          © 2025 NalarUp · Platform Tryout CASN Indonesia
        </p>
      </footer>

    </div>
  );
}
