import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import ScoreSimulator from "@/components/landing/ScoreSimulator";

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
    title: "Kamu tryout — persis seperti ujian asli",
    desc: "Timer 100 menit, soal berbobot, sistem penilaian identik SKD. Bukan latihan santai — ini simulasi yang bikin kamu tahu rasanya tekanan ujian sebenarnya.",
    detail: "TWK · TIU · TKP — 110 soal",
  },
  {
    step: "02",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.12)",
    title: "Sistem baca di mana bocornya skor kamu",
    desc: "Selesai tryout, langsung dapat breakdown per subtes. Bukan cuma total skor — tapi tahu persis: TIU kamu 62, passing grade-nya 80. Fokus ke sana.",
    detail: "Analisis per subtes · Gap vs passing grade",
  },
  {
    step: "03",
    color: "#22C55E",
    glow: "rgba(34,197,94,0.12)",
    title: "Review, perbaiki, ulang — skor naik terukur",
    desc: "Buka pembahasan soal yang salah. Pahami polanya. Ulang tryout paket berbeda. Setiap sesi ada datanya — bukan feeling.",
    detail: "Pembahasan lengkap · Ulang bebas",
  },
];

// Score trajectory data — CSS-only mini chart
const TRAJECTORY = [
  { tryout: "T1", score: 241, label: "241" },
  { tryout: "T2", score: 268, label: "268" },
  { tryout: "T3", score: 279, label: "279" },
  { tryout: "T4", score: 295, label: "295" },
  { tryout: "T5", score: 318, label: "318 ✓" },
];
const TRAJ_MIN = 220;
const TRAJ_MAX = 340;
const PG_LINE = 311;

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#020617", overflowX: "hidden" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        background: "rgba(2,6,23,0.9)",
        borderBottom: "1px solid #1E293B",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }} className="gradient-text">
            NalarUp
          </span>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
            <Link href={ROUTES.login}>
              <button className="btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}>Masuk</button>
            </Link>
            <Link href={ROUTES.register}>
              <button className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", cursor: "pointer" }}>Coba Tryout Pertama</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "7rem 1.5rem 5rem", position: "relative" }}>
        <div className="glow-blob" style={{ width: 560, height: 420, background: "radial-gradient(circle, #2563EB, transparent)", top: "0%", left: "5%" }} />
        <div className="glow-blob" style={{ width: 460, height: 380, background: "radial-gradient(circle, #7C3AED, transparent)", top: "5%", right: "5%", animationDelay: "4s" }} />

        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>

          {/* Left — headline + CTA */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "9999px", padding: "0.3rem 0.875rem", marginBottom: "2rem",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block", boxShadow: "0 0 6px #22C55E" }} />
              <span style={{ fontSize: "0.75rem", color: "#4ADE80", fontWeight: 600, letterSpacing: "0.03em" }}>
                Gratis · Tanpa batas · Langsung akses
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 3.25rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.035em", color: "#F1F5F9", marginBottom: "1.5rem" }}>
              Tryout kemarin skormu{" "}
              <span className="num text-3d-blue" style={{ color: "#FCA5A5" }}>287</span>.
              {" "}Passing grade{" "}
              <span className="num text-3d-blue" style={{ color: "#4ADE80" }}>311</span>.{" "}
              <br />
              <span className="gradient-text text-3d-gradient">
                Selisih 24 poin — dan kamu tahu persis harus fokus ke mana.
              </span>
            </h1>

            <p style={{ fontSize: "1rem", color: "#94A3B8", lineHeight: 1.75, marginBottom: "2.25rem", maxWidth: 480 }}>
              NalarUp bukan kumpulan soal biasa. Ini sistem yang baca kelemahan kamu,
              tunjukkan gap-nya, dan bantu kamu tutup satu per satu — sampai aman passing grade.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href={ROUTES.register}>
                <button className="btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "0.95rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                  Coba Tryout Pertama
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Link>
              <Link href={ROUTES.login}>
                <button className="btn-ghost" style={{ padding: "0.9rem 1.5rem", fontSize: "0.95rem", cursor: "pointer", borderRadius: "0.75rem" }}>
                  Sudah punya akun
                </button>
              </Link>
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "#334155" }}>
              Tidak perlu kartu kredit · Daftar 30 detik
            </p>
          </div>

          {/* Right — Score Simulator */}
          <div>
            <ScoreSimulator />
          </div>
        </div>

        {/* Mobile: simulator below headline */}
        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          }
        `}</style>
      </section>

      <hr className="divider" />

      {/* ===== PROBLEM / AGITATE ===== */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-amber" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
            Kenapa skor kamu belum naik-naik?
          </span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Kamu sudah coba semua cara.
            <br />
            <span style={{ color: "#94A3B8", fontWeight: 600 }}>Tapi hasilnya masih sama.</span>
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Bukan karena kamu kurang usaha. Tapi karena cara belajarnya yang salah arah.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: "9999px", padding: "0.2rem 0.625rem", marginBottom: "0.875rem",
              }}>
                <span style={{ fontSize: "0.65rem", color: "#4ADE80", fontWeight: 700, letterSpacing: "0.04em" }}>✓ SOLUSI YANG DICOBA</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#F1F5F9", marginBottom: "0.5rem", lineHeight: 1.4 }}>{p.label}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.65 }}>{p.sub}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "1.75rem 2rem", borderColor: "rgba(245,158,11,0.25)", background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)", borderLeft: "3px solid #F59E0B" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "0.1rem" }}>💡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F1F5F9", marginBottom: "0.5rem" }}>Masalahnya bukan kurang rajin.</div>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.75, margin: 0 }}>
                Masalahnya adalah <span style={{ color: "#FCD34D", fontWeight: 600 }}>latihan tanpa data</span>.
                Kamu tidak tahu subtes mana yang paling bocor, tidak tahu berapa gap-nya,
                dan tidak ada sistem yang kasih tahu harus fokus ke mana.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== SOLUTION — user journey ===== */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="badge badge-blue" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>Cara NalarUp bekerja</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Bukan sekadar latihan soal.{" "}
            <span className="gradient-text">Ini loop yang bikin skor naik.</span>
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Tryout → analisis → perbaikan → ulang. Setiap putaran, kamu lebih dekat ke passing grade.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {JOURNEY.map((j, i) => (
            <div key={i} className="glass-card" style={{ padding: "2rem", borderTop: `2px solid ${j.color}`, background: `linear-gradient(160deg, ${j.glow} 0%, transparent 55%)`, position: "relative" }}>
              <div className="num" style={{ fontSize: "0.7rem", fontWeight: 700, color: j.color, letterSpacing: "0.1em", marginBottom: "1rem", opacity: 0.8 }}>
                LANGKAH {j.step}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#F1F5F9", marginBottom: "0.75rem", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                {j.title}
              </h3>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.75, margin: "0 0 1.25rem" }}>{j.desc}</p>
              <div style={{
                display: "inline-flex", alignItems: "center",
                background: `rgba(${j.color === "#2563EB" ? "37,99,235" : j.color === "#7C3AED" ? "124,58,237" : "34,197,94"},0.1)`,
                border: `1px solid rgba(${j.color === "#2563EB" ? "37,99,235" : j.color === "#7C3AED" ? "124,58,237" : "34,197,94"},0.2)`,
                borderRadius: "9999px", padding: "0.25rem 0.75rem",
              }}>
                <span style={{ fontSize: "0.7rem", color: j.color, fontWeight: 600 }}>{j.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== SCORE TRAJECTORY ===== */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-violet" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>Bukti nyata</span>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Skor naik bukan kebetulan —<br />
            <span className="gradient-text">ini polanya.</span>
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.9rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>
            Peserta yang tryout konsisten 5 sesi rata-rata naik 60–80 poin. Bukan karena pintar tiba-tiba — tapi karena tahu harus fokus ke mana.
          </p>
        </div>

        {/* Mini chart — CSS only */}
        <div className="glass-card" style={{ padding: "2rem 2rem 1.5rem", overflow: "hidden" }}>
          {/* PG line label */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#F59E0B", fontWeight: 600, letterSpacing: "0.04em" }}>
              — PASSING GRADE 311
            </span>
          </div>

          {/* Chart area */}
          <div style={{ position: "relative", height: 140, marginBottom: "1rem" }}>
            {/* PG horizontal line */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: `${((TRAJ_MAX - PG_LINE) / (TRAJ_MAX - TRAJ_MIN)) * 100}%`,
              height: 1,
              background: "rgba(245,158,11,0.3)",
              borderTop: "1px dashed rgba(245,158,11,0.4)",
              zIndex: 1,
            }} />

            {/* Bars */}
            <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: "0.75rem", position: "relative", zIndex: 2 }}>
              {TRAJECTORY.map((t, i) => {
                const heightPct = ((t.score - TRAJ_MIN) / (TRAJ_MAX - TRAJ_MIN)) * 100;
                const isPass = t.score >= PG_LINE;
                const isLast = i === TRAJECTORY.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    {/* Score label */}
                    <div className="num" style={{ fontSize: "0.7rem", fontWeight: 700, color: isPass ? "#4ADE80" : "#94A3B8", marginBottom: "0.375rem" }}>
                      {t.label}
                    </div>
                    {/* Bar */}
                    <div style={{
                      width: "100%",
                      height: `${heightPct}%`,
                      borderRadius: "0.375rem 0.375rem 0 0",
                      background: isPass
                        ? "linear-gradient(180deg, #22C55E, rgba(34,197,94,0.4))"
                        : isLast
                        ? "linear-gradient(180deg, #7C3AED, rgba(124,58,237,0.4))"
                        : "linear-gradient(180deg, #2563EB, rgba(37,99,235,0.3))",
                      boxShadow: isPass ? "0 0 12px rgba(34,197,94,0.3)" : "none",
                      transition: "height 0.5s ease",
                      position: "relative",
                    }}>
                      {isPass && (
                        <div style={{
                          position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                          width: 16, height: 16, borderRadius: "50%",
                          background: "#22C55E",
                          boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.55rem",
                        }}>✓</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis labels */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {TRAJECTORY.map((t, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.65rem", color: "#475569", fontWeight: 600 }}>
                {t.tryout}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.25rem", padding: "0.875rem 1rem", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "0.625rem" }}>
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: "#4ADE80", fontWeight: 600 }}>Tryout ke-5: 318 — lulus.</span>{" "}
              Naik 77 poin dari tryout pertama. Bukan karena belajar lebih keras — tapi karena tahu persis harus fokus ke mana setelah setiap sesi.
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ===== APA YANG KAMU DAPAT ===== */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-green" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>Setelah tryout pertama</span>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Dalam 100 menit, kamu akan tahu<br />
            <span className="gradient-text">tiga hal yang selama ini kamu tebak-tebak.</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              num: "01",
              color: "#2563EB",
              glow: "rgba(37,99,235,0.08)",
              title: "Skor kamu vs passing grade SKD — angka, bukan feeling",
              desc: "Bukan lagi \"kayaknya udah lumayan\". Kamu lihat langsung: total skor 287, passing grade 311, kurang 24 poin. Konkret.",
            },
            {
              num: "02",
              color: "#7C3AED",
              glow: "rgba(124,58,237,0.08)",
              title: "Subtes mana yang paling bocor — bukan semua subtes",
              desc: "TWK kamu sudah aman di 95. TIU cuma 62 dari passing grade 80. TKP 130 dari 166. Sekarang kamu tahu: fokus ke TIU dan TKP, bukan TWK.",
            },
            {
              num: "03",
              color: "#22C55E",
              glow: "rgba(34,197,94,0.08)",
              title: "Berapa poin yang harus ditutup — dan dari mana",
              desc: "Bukan target abstrak \"harus lebih baik\". Tapi: TIU butuh +18 poin, TKP butuh +36 poin. Ini yang jadi fokus tryout berikutnya.",
            },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{
              padding: "1.75rem",
              display: "flex", gap: "1.5rem", alignItems: "flex-start",
              borderLeft: `3px solid ${item.color}`,
              background: `linear-gradient(135deg, ${item.glow} 0%, transparent 50%)`,
            }}>
              <div className="num" style={{
                fontSize: "1.75rem", fontWeight: 800, color: item.color,
                opacity: 0.4, lineHeight: 1, flexShrink: 0, letterSpacing: "-0.03em",
                minWidth: 36,
              }}>
                {item.num}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F1F5F9", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                  {item.title}
                </div>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== CTA FINAL ===== */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "7rem 1.5rem 8rem", textAlign: "center", position: "relative" }}>
        <div className="glow-blob" style={{ width: 480, height: 360, background: "radial-gradient(circle, #7C3AED, transparent)", top: "15%", left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow-blob" style={{ width: 300, height: 250, background: "radial-gradient(circle, #2563EB, transparent)", top: "30%", left: "20%", animationDelay: "5s" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #2563EB, #7C3AED)", borderRadius: 9999, margin: "0 auto 2rem" }} />

          <h2 style={{ fontSize: "clamp(1.9rem, 4.5vw, 3rem)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.035em", lineHeight: 1.18, marginBottom: "1.25rem" }}>
            Passing grade bukan soal nasib.
            <br />
            <span className="gradient-text text-3d-gradient">Soal tahu harus fokus ke mana.</span>
          </h2>

          <p style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.75rem", maxWidth: 460, margin: "0 auto 2.75rem" }}>
            Daftar sekarang, tryout pertama selesai dalam 100 menit,
            dan kamu langsung tahu posisimu vs passing grade SKD hari ini.
          </p>

          <Link href={ROUTES.register}>
            <button className="btn-primary" style={{ padding: "1rem 2.75rem", fontSize: "1.05rem", borderRadius: "0.875rem", cursor: "pointer", boxShadow: "0 0 40px rgba(37,99,235,0.25)" }}>
              Coba Tryout Pertama — Gratis
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
        <p style={{ color: "#334155", fontSize: "0.75rem" }}>© 2025 NalarUp · Platform Tryout CASN Indonesia</p>
      </footer>

    </div>
  );
}
