import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import MobileNav from "@/components/landing/MobileNav";
import FAQAccordion from "@/components/landing/FAQ";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import StatsCounter from "@/components/landing/StatsCounter";
import HowItWorks from "@/components/landing/HowItWorks";
import GamificationShowcase from "@/components/landing/GamificationShowcase";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
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

export default async function LandingPage() {
  const stats = await getStatsSafe();

  const statItems = [
    { value: stats.totalQuestions, label: "Total Soal", suffix: "+" },
    { value: stats.totalPackages, label: "Paket Tryout" },
    { value: stats.twkCount, label: "Soal TWK" },
    { value: stats.tiuCount, label: "Soal TIU" },
    { value: stats.tkpCount, label: "Soal TKP" },
    { value: 2500, label: "Pengguna Aktif", suffix: "+" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] overflow-x-hidden">
      {/* Skip to content */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Langsung ke konten utama
      </a>

      {/* ===== NAVBAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0A0E1A]/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-2 no-underline shrink-0">
            <img src="/logo-icon.png" alt="" width={28} height={28} className="rounded-[6px]" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-extrabold text-lg tracking-tight">
              NalarUp
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navigasi utama">
            <a href="#cara-kerja" className="text-gray-400 hover:text-white text-sm font-medium no-underline transition-colors">
              Cara Kerja
            </a>
            <a href="#fitur" className="text-gray-400 hover:text-white text-sm font-medium no-underline transition-colors">
              Fitur
            </a>
            <a href="#testimoni" className="text-gray-400 hover:text-white text-sm font-medium no-underline transition-colors">
              Testimoni
            </a>
            <a href="#faq" className="text-gray-400 hover:text-white text-sm font-medium no-underline transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={ROUTES.login}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/[0.05] transition-all no-underline"
            >
              Masuk
            </Link>
            <Link
              href={ROUTES.register}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors no-underline shadow-[0_2px_8px_rgba(34,197,94,0.3)]"
            >
              Daftar Gratis
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="konten-utama">
        {/* ===== HERO ===== */}
        <HeroSection />

        {/* ===== STATS ===== */}
        <StatsCounter stats={statItems} />

        {/* ===== HOW IT WORKS ===== */}
        <HowItWorks />

        {/* ===== FEATURES BENTO GRID ===== */}
        <FeaturesGrid />

        {/* ===== GAMIFICATION SHOWCASE ===== */}
        <GamificationShowcase />

        {/* ===== TESTIMONIALS ===== */}
        <Testimonials />

        {/* ===== FAQ ===== */}
        <section id="faq" className="relative py-20 sm:py-28">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-bold text-orange-400 tracking-[0.15em] uppercase mb-3">
                FAQ
              </span>
              <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold text-white tracking-tight leading-tight mb-4">
                Pertanyaan yang sering ditanyakan
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Belum menemukan jawaban? Hubungi kami kapan saja.
              </p>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <CTASection />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.06] bg-[#0A0E1A]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <Link href={ROUTES.home} className="flex items-center gap-2 no-underline">
              <img src="/logo-icon.png" alt="" width={22} height={22} className="rounded-[5px]" />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-extrabold text-base tracking-tight">
                NalarUp
              </span>
            </Link>

            {/* Footer nav */}
            <nav className="flex flex-wrap justify-center gap-5" aria-label="Navigasi footer">
              <Link href={ROUTES.tryouts} className="text-gray-600 hover:text-gray-400 text-sm no-underline transition-colors">
                Tryout
              </Link>
              <a href="#cara-kerja" className="text-gray-600 hover:text-gray-400 text-sm no-underline transition-colors">
                Cara Kerja
              </a>
              <a href="#fitur" className="text-gray-600 hover:text-gray-400 text-sm no-underline transition-colors">
                Fitur
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-400 text-sm no-underline transition-colors">
                FAQ
              </a>
              <Link href={ROUTES.login} className="text-gray-600 hover:text-gray-400 text-sm no-underline transition-colors">
                Masuk
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-gray-600 text-xs m-0">
              © 2026 NalarUp · Platform Tryout CASN Indonesia
            </p>
          </div>

          {/* Glow accent */}
          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
