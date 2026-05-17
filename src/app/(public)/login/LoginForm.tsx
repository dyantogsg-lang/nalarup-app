"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROUTES } from "@/lib/constants/routes";
import { GlassCard, Button3D, AlertBox, EyeIcon } from "@/components/ui";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? ROUTES.dashboard;
  const hasRedirect = searchParams.has("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email atau password salah. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="w-full max-w-[420px] relative">
      {/* Floating orbs background */}
      <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <GlassCard glow="green" className="!p-8">
          {/* Header */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Masuk untuk lanjutkan latihan
            </p>
          </div>

          {hasRedirect && (
            <AlertBox variant="info" className="mb-4">
              Masuk dulu untuk melanjutkan tryout atau halaman yang kamu buka.
            </AlertBox>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="float-label-wrap">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                autoComplete="email"
                className="input-field focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
              <label htmlFor="login-email">Email</label>
            </div>

            {/* Password */}
            <div className="relative">
              <div className="float-label-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=" "
                  autoComplete="current-password"
                  className="input-field pr-12 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <label htmlFor="login-password">Password</label>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center p-1 bg-transparent border-none cursor-pointer transition-colors duration-150 text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {/* Error */}
            {error && (
              <AlertBox variant="error" className="text-[0.82rem]">
                <span id="login-error">{error}</span>
              </AlertBox>
            )}

            <Button3D
              type="submit"
              variant="green"
              size="lg"
              disabled={loading}
              loading={loading}
              className="w-full mt-1"
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button3D>
          </form>

          <p className="text-center mt-6 text-[0.82rem] text-[var(--text-dim)]">
            Belum punya akun?{" "}
            <Link
              href={ROUTES.register}
              className="font-medium no-underline hover:underline text-emerald-400"
            >
              Daftar gratis
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
