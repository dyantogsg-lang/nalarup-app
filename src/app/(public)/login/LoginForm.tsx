"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROUTES } from "@/lib/constants/routes";
import { AlertBox, EyeIcon } from "@/components/ui";

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
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
          Selamat datang kembali
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
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
            className="input-field"
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
              className="input-field pr-12"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
            <label htmlFor="login-password">Password</label>
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center p-1 bg-transparent border-none cursor-pointer transition-colors duration-150"
            style={{ color: "var(--text-dim)" }}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <AlertBox variant="error" className="text-[0.82rem]">
            {error}
          </AlertBox>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-[0.95rem] mt-1"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
              Memproses...
            </span>
          ) : "Masuk"}
        </button>
      </form>

      <p className="text-center mt-6 text-[0.82rem]" style={{ color: "var(--text-dim)" }}>
        Belum punya akun?{" "}
        <Link href={ROUTES.register} className="font-medium no-underline hover:underline" style={{ color: "var(--blue-light)" }}>
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
