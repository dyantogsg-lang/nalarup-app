import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/landing/MobileNav";
import FAQAccordion from "@/components/landing/FAQ";
import MotivationCarousel from "@/components/landing/MotivationCarousel";
import HeroExamMockup from "@/components/landing/HeroExamMockup";
import { getLandingStats, type LandingStats } from "@/lib/landing/stats";
import AnimatedNumber from "@/components/landing/AnimatedNumber";
import RevealOnScroll from "@/components/landing/RevealOnScroll";
import ScrollProgress from "@/components/landing/ScrollProgress";

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

const FEATURES = [
  {
    title: "Simulasi CAT BKN",
    desc: "Timer, bobot soal, dan sistem penilaian identik ujian asli.",
    icon: "monitor",
    color: "blue",
  },
  {
    title: "Pembahasan Lengkap",
    desc: "Lihat alasan jawaban benar/salah setelah tryout selesai.",
    icon: "chart",
    color: "violet",
  },
  {
    title: "Analisis Kelemahan",
    desc: "Breakdown per subtes — tahu persis gap kamu vs passing grade.",
    icon: "target",
    color: "green",
  },
  {
    title: "Score Safe Meter",
    desc: "Pantau total skor dan jarakmu dari passing grade SKD.",
    icon: "users",
    color: "amber",
  },
  {
    title: "Review Soal Salah",
    desc: "Fokus bahas jawaban salah agar sesi belajar lebih efisien.",
    icon: "bell",
    color: "pink",
  },
  {
    title: "Akses Terbuka",
    desc: "Semua paket utama bisa dicoba tanpa paywall atau biaya tersembunyi.",
    icon: "wifi",
    color: "teal",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Pilih paket tryout",
    desc: "Mulai dari paket SKD penuh atau practice subtes terfokus. Semua open access.",
  },
  {
    n: "02",
    title: "Kerjakan simulasi",
    desc: "Timer berjalan, soal & navigasi mirip CAT BKN. Autosave setiap jawaban.",
  },
  {
    n: "03",
    title: "Lihat skor & gap",
    desc: "Dapat skor per subtes, status passing grade, dan posisi vs target safe score.",
  },
  {
    n: "04",
    title: "Latihan terarah",
    desc: "Ikuti rekomendasi berdasarkan kelemahan, lalu tryout ulang sampai aman.",
  },
];

const TESTIMONIALS = [
  {
    name: "Rina S.",
    role: "Lolos CPNS 2025 — Kemenkeu",
    text: "Awalnya skor TWK saya di bawah passing grade. Setelah 3 minggu pakai NalarUp, gap-nya hilang dan saya lolos di attempt kedua.",
  },
  {
    name: "Andi P.",
    role: "Lolos CPNS 2025 — Kemendikbud",
    text: "Fitur analisis kelemahan sangat membantu. Saya jadi tahu harus fokus di mana tanpa buang waktu di materi yang sudah dikuasai.",
  },
  {
    name: "Dian M.",
    role: "Lolos PPPK 2025 — Guru",
    text: "Simulasinya realistis banget, mirip CAT BKN asli. Pas hari H saya sudah terbiasa dengan tekanan timer dan navigasi soal.",
  },
];

function FeatureIcon({ type, className }: { type: string; className?: string }) {
  const props = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className };
  switch (type) {
    case "monitor":
      return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
    case "chart":
      return <svg {...props}><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>;
    case "target":
      return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case "users":
      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "bell":
      return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case "wifi":
      return <svg {...props}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>;
    default:
      return null;
  }
}

export default async function LandingPage() {
  const stats = await getStatsSafe();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-x-hidden">
      <ScrollProgress />
      {/* Skip to content */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--blue)] focus:text-white focus:rounded-[var(--radius-md)] focus:text-sm focus:font-semibold"
      >
        Langsung ke konten utama
      </a>

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-[var(--bg-card)]/95 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-2 no-underline shrink-0">
            <img src="/logo-icon.png" alt="" width={28} height={28} className="rounded-[6px]" />
            <span className="gradient-text font-extrabold text-lg tracking-tight">NalarUp</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navigasi utama">
            <a href="#cara-kerja" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium no-underline transition-colors">
              Cara Kerja
            </a>
            <a href="#fitur" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium no-underline transition-colors">
              Fitur
            </a>
            <a href="#statistik" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium no-underline transition-colors">
              Statistik
            </a>
            <a href="#testimoni" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium no-underline transition-colors">
              Testimoni
            </a>
            <a href="#faq" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium no-underline transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />
            <Link href={ROUTES.login} className="hidden sm:inline-flex">
              <span className="btn-ghost px-4 py-2 text-sm cursor-pointer">Masuk</span>
            </Link>
            <Link href={ROUTES.register} className="hidden sm:inline-flex">
              <span className="btn-primary px-4 py-2 text-sm cursor-pointer">Daftar Gratis</span>
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="konten-utama">
        {/* ===== HERO ===== */}
        <section className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          {/* Decorative blobs */}
          <div className="glow-blob w-[520px] h-[420px] bg-[radial-gradient(circle,var(--blue),transparent)] top-0 -left-[5%]" aria-hidden="true" />
          <div className="glow-blob w-[460px] h-[380px] bg-[radial-gradient(circle,var(--violet),transparent)] -top-[5%] -right-[8%]" style={{ animationDelay: "4s" }} aria-hidden="true" />

          <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
            {/* Left */}
            <div>
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-[var(--green-subtle)] border border-[rgba(34,197,94,0.25)] rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block shadow-[0_0_6px_var(--green)]" aria-hidden="true" />
                <span className="text-xs text-[var(--green)] font-semibold tracking-wide">
                  Gratis · Tanpa batas · Langsung akses
                </span>
              </div>

              <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] mb-6">
                Naikkan skor SKD<br />
                sampai <span className="gradient-text">aman passing grade</span>
              </h1>

              <p className="text-[1.05rem] text-[var(--text-muted)] leading-relaxed mb-8 max-w-[520px]">
                Simulasi SKD persis CAT BKN dengan analisis kelemahan per subtes.
                Tahu gap kamu, fokus perbaikan, dan tryout ulang sampai aman.
              </p>

              {/* CTA buttons */}
              <div className="flex gap-3 flex-wrap mb-6">
                <Link href={ROUTES.register}>
                  <span className="btn-primary px-7 py-3.5 text-base rounded-xl cursor-pointer inline-flex items-center gap-2">
                    Coba Tryout Gratis
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
                <a href="#cara-kerja">
                  <span className="btn-ghost px-6 py-3.5 text-base rounded-xl cursor-pointer inline-flex items-center gap-2">
                    Lihat cara kerja
                  </span>
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex gap-5 flex-wrap text-xs text-[var(--text-dim)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" aria-hidden="true" />
                  Tanpa kartu kredit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" aria-hidden="true" />
                  Bisa diulang bebas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--violet)]" aria-hidden="true" />
                  Pembahasan lengkap
                </span>
              </div>
            </div>

            {/* Right — mockup */}
            <div className="hidden lg:block">
              <HeroExamMockup />
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section id="statistik" className="border-y border-[var(--border)] bg-[var(--bg-card)]" aria-label="Statistik platform">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { value: stats.totalPackages, label: "Paket Tryout" },
              { value: stats.totalQuestions, label: "Total Soal" },
              { value: stats.twkCount, label: "Soal TWK" },
              { value: stats.tiuCount, label: "Soal TIU" },
              { value: stats.tkpCount, label: "Soal TKP" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="num text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-[var(--text-primary)] tracking-tight leading-none">
                  <AnimatedNumber value={s.value} />
                </div>
                <div className="text-xs text-[var(--text-dim)] mt-2 uppercase tracking-widest font-semibold">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <RevealOnScroll>
        <section id="cara-kerja" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="max-w-[720px] mb-12">
            <span className="text-xs text-[var(--blue)] font-bold tracking-[0.1em] uppercase block mb-3">
              Cara kerja
            </span>
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
              Loop yang <span className="gradient-text">menaikkan skor</span>, bukan menambah jam
            </h2>
            <p className="text-[var(--text-muted)] text-base leading-relaxed">
              Empat langkah, diulang sampai posisi aman. Tidak pakai gimmick, tidak pakai paywall.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map((step) => (
              <div
                key={step.n}
                className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-focus)] transition-colors"
              >
                {/* Big number watermark */}
                <span
                  className="num absolute -top-2 right-3 text-7xl font-extrabold text-[var(--bg-card-hover)] tracking-tighter leading-none pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <div className="relative z-[1]">
                  <span className="num text-[0.7rem] text-[var(--blue)] font-bold tracking-wider block mb-4">
                    LANGKAH {step.n}
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed m-0">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        </RevealOnScroll>

        {/* ===== FEATURES ===== */}
        <RevealOnScroll>
        <section id="fitur" className="bg-[var(--bg-card)] border-y border-[var(--border)]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
              <div>
                <span className="text-xs text-[var(--violet)] font-bold tracking-[0.1em] uppercase block mb-3">
                  Fitur
                </span>
                <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight m-0">
                  Bukan sekadar kumpulan soal
                </h2>
              </div>
              <p className="text-[var(--text-muted)] text-[0.95rem] leading-relaxed m-0 lg:pt-8">
                Fitur yang dirancang untuk menaikkan skor — analisis kelemahan, simulasi realistis,
                dan latihan terarah berdasarkan hasil tryout terakhir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className={`feature-card feature-card-${f.color} bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 hover:border-[var(--border-focus)]`}
                  style={{ borderLeftWidth: 3, borderLeftColor: `var(--${f.color})` }}
                >
                  <div
                    className="w-10 h-10 rounded-[0.65rem] flex items-center justify-center"
                    style={{ background: `var(--${f.color}-subtle)`, color: `var(--${f.color})` }}
                  >
                    <FeatureIcon type={f.icon} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[0.95rem] text-[var(--text-primary)] mb-1.5 leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed m-0">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </RevealOnScroll>

        {/* ===== TESTIMONIALS ===== */}
        <RevealOnScroll>
        <section id="testimoni" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-12">
            <span className="text-xs text-[var(--green)] font-bold tracking-[0.1em] uppercase block mb-3">
              Testimoni
            </span>
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
              Cerita mereka yang sudah <span className="gradient-text-green">berhasil</span>
            </h2>
            <p className="text-[var(--text-muted)] text-base max-w-[540px] mx-auto leading-relaxed">
              Ribuan peserta sudah merasakan manfaat latihan terarah dengan NalarUp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 m-0"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--blue-subtle)" aria-hidden="true">
                  <path d="M11 7H7a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H6a1 1 0 0 0 0 2h1a4 4 0 0 0 4-4v-9zm10 0h-4a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a1 1 0 0 0 0 2h1a4 4 0 0 0 4-4v-9z" />
                </svg>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1 m-0">
                  {t.text}
                </p>
                <footer className="border-t border-[var(--border)] pt-4">
                  <cite className="not-italic">
                    <span className="block font-semibold text-sm text-[var(--text-primary)]">{t.name}</span>
                    <span className="block text-xs text-[var(--text-dim)] mt-0.5">{t.role}</span>
                  </cite>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
        </RevealOnScroll>

        {/* ===== MOTIVATION CAROUSEL ===== */}
        <MotivationCarousel />

        {/* ===== FAQ ===== */}
        <RevealOnScroll>
        <section id="faq" className="bg-[var(--bg-card)] border-y border-[var(--border)]">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <div className="text-center mb-12">
              <span className="text-xs text-[var(--amber)] font-bold tracking-[0.1em] uppercase block mb-3">
                FAQ
              </span>
              <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
                Pertanyaan yang sering ditanyakan
              </h2>
              <p className="text-[var(--text-muted)] text-base leading-relaxed">
                Belum menemukan jawaban? Hubungi kami kapan saja.
              </p>
            </div>
            <FAQAccordion />
          </div>
        </section>
        </RevealOnScroll>

        {/* ===== CTA FINAL ===== */}
        <RevealOnScroll>
        <section className="relative max-w-[720px] mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="glow-blob w-[460px] h-[340px] bg-[radial-gradient(circle,var(--violet),transparent)] top-[10%] left-1/2 -translate-x-1/2" aria-hidden="true" />
          <div className="glow-blob w-[320px] h-[240px] bg-[radial-gradient(circle,var(--green),transparent)] top-[35%] left-[20%]" style={{ animationDelay: "5s" }} aria-hidden="true" />

          <div className="relative z-[1]">
            <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.04em] leading-[1.1] mb-5">
              Mulai persiapan hari ini, <span className="gradient-text">gratis.</span>
            </h2>
            <p className="text-[var(--text-muted)] text-[1.05rem] leading-relaxed mb-10 max-w-[480px] mx-auto">
              Daftar sekarang, tryout pertama selesai dalam 100 menit, dan kamu langsung tahu
              posisimu vs passing grade SKD.
            </p>
            <Link href={ROUTES.register}>
              <span className="btn-primary px-10 py-4 text-[1.05rem] rounded-[0.875rem] cursor-pointer inline-flex items-center gap-2 shadow-[0_0_50px_rgba(37,99,235,0.25)]">
                Coba Tryout Gratis
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <p className="mt-5 text-xs text-[var(--text-dim)]">
              Tidak perlu kartu kredit · Semua paket open access · Bisa diulang bebas
            </p>
          </div>
        </section>
        </RevealOnScroll>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <Link href={ROUTES.home} className="flex items-center gap-2 no-underline">
              <img src="/logo-icon.png" alt="" width={22} height={22} className="rounded-[5px]" />
              <span className="gradient-text font-extrabold text-base tracking-tight">NalarUp</span>
            </Link>

            {/* Footer nav */}
            <nav className="flex flex-wrap justify-center gap-5" aria-label="Navigasi footer">
              <Link href={ROUTES.tryouts} className="text-[var(--text-dim)] hover:text-[var(--text-muted)] text-sm no-underline transition-colors">
                Tryout
              </Link>
              <a href="#cara-kerja" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] text-sm no-underline transition-colors">
                Cara Kerja
              </a>
              <a href="#fitur" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] text-sm no-underline transition-colors">
                Fitur
              </a>
              <a href="#faq" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] text-sm no-underline transition-colors">
                FAQ
              </a>
              <Link href={ROUTES.login} className="text-[var(--text-dim)] hover:text-[var(--text-muted)] text-sm no-underline transition-colors">
                Masuk
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-[var(--text-dim)] text-xs m-0">
              © 2026 NalarUp · Platform Tryout CASN Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
